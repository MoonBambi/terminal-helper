const { ipcMain, dialog, BrowserWindow, app } = require('electron');
const { spawn, spawnSync } = require('child_process');
const pty = require('node-pty');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const OpenAI = require('openai');
const store = require('./store');
const iconv = require('iconv-lite');

const activeCollections = new Set();
const activeRuns = new Map();
const activeTerminals = new Map();
let boardDbPool = null;

function getBoardDbPool() {
  if (boardDbPool) return boardDbPool;
  boardDbPool = mysql.createPool({
    host: process.env.BOARD_DB_HOST || '127.0.0.1',
    port: Number(process.env.BOARD_DB_PORT || 3306),
    user: process.env.BOARD_DB_USER || 'root',
    password: process.env.BOARD_DB_PASSWORD || '123123',
    database: process.env.BOARD_DB_NAME || 'land_news',
    waitForConnections: true,
    connectionLimit: 4,
    queueLimit: 0
  });
  return boardDbPool;
}

function sendToRenderer(event, channel, payload) {
  event.sender.send(channel, payload);
}

function decodeChunk(data) {
  if (process.platform === 'win32') {
    if (data.length >= 2) {
      let zeroCount = 0;
      for (let i = 1; i < data.length; i += 2) {
        if (data[i] === 0) zeroCount += 1;
      }
      if (zeroCount > data.length / 4) {
        return data.toString('utf16le');
      }
    }
    try {
      return iconv.decode(data, 'gbk');
    } catch (err) {
      return data.toString('utf8');
    }
  }
  return data.toString('utf8');
}

function getShellPaths() {
  const data = store.getAll();
  const paths = data && data.settings && data.settings.shellPaths ? data.settings.shellPaths : {};
  return {
    cmd: paths.cmd || 'cmd.exe',
    ps: paths.ps || 'powershell.exe',
    bash: paths.bash || 'bash'
  };
}

function getQwenSettings() {
  const data = store.getAll();
  const qwen = data && data.settings && data.settings.qwen ? data.settings.qwen : {};
  return {
    apiKey: typeof qwen.apiKey === 'string' ? qwen.apiKey.trim() : '',
    baseURL:
      (typeof qwen.baseURL === 'string' && qwen.baseURL.trim()) ||
      'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model:
      (typeof qwen.model === 'string' && qwen.model.trim()) ||
      'qwen-plus'
  };
}

const QWEN_SQL_SYSTEM_PROMPT = `You are "DumbOx SQL assistant".
Use only these tables and columns:
1) word_frequency_stats(id, word, count, created_at)
2) land_news_analysis(id, url, title, publish_date, source, content_summary, sentiment_score, keywords, created_at)

Rules:
- Generate exactly one MySQL SELECT statement.
- Never generate UPDATE, DELETE, INSERT, DROP, ALTER, TRUNCATE, CREATE, REPLACE.
- Only query the two tables above.
- If user request is unrelated to these tables, return exactly this sentence:
老牛在田里转了一圈，没发现相关数据。
- Output either SQL code block or the fixed sentence above. No extra explanation.`;

const QWEN_SUMMARY_SYSTEM_PROMPT = `You are DumbOx data analyst.
Given user question + executed SQL + SQL result rows, provide concise Chinese summary:
- First line: direct conclusion.
- Then 1-3 key observations.
- Do not fabricate numbers.
- If result set is empty, clearly say: 未查到匹配数据。`;

const QWEN_NO_DATA_TEXT = '老牛在田里转了一圈，没发现相关数据。';
const ALLOWED_QUERY_TABLES = new Set(['word_frequency_stats', 'land_news_analysis']);

function extractCompletionText(completion) {
  const answerRaw = completion && completion.choices && completion.choices[0] && completion.choices[0].message
    ? completion.choices[0].message.content
    : '';
  return Array.isArray(answerRaw)
    ? answerRaw.map((item) => (typeof item === 'string' ? item : item && item.text ? item.text : '')).join('\n').trim()
    : String(answerRaw || '').trim();
}

function extractSqlFromModelText(text) {
  const source = String(text || '').trim();
  const fenceMatch = source.match(/```(?:sql)?\s*([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) return fenceMatch[1].trim();
  return source.replace(/^sql\s*[:\uFF1A]/i, '').trim();
}

function validateSelectSql(sql) {
  const original = String(sql || '').trim();
  if (!original) return { ok: false, error: '未生成 SQL' };
  if (/--|\/\*/.test(original)) return { ok: false, error: 'SQL 包含注释，已拒绝执行' };
  const semicolonCount = (original.match(/;/g) || []).length;
  if (semicolonCount > 1 || (semicolonCount === 1 && !/;\s*$/.test(original))) {
    return { ok: false, error: '仅允许单条 SQL' };
  }

  const normalized = original.replace(/;+\s*$/, '').trim();
  if (!/^select\b/i.test(normalized)) return { ok: false, error: '仅允许 SELECT 查询' };
  if (/\b(update|delete|insert|drop|alter|truncate|create|replace|grant|revoke)\b/i.test(normalized)) {
    return { ok: false, error: 'SQL 包含危险关键字，已拒绝执行' };
  }

  const tableMatches = [];
  const tableRegex = /\b(?:from|join)\s+((?:`[^`]+`|\w+)(?:\.(?:`[^`]+`|\w+))?)/gi;
  let match = tableRegex.exec(normalized);
  while (match) {
    tableMatches.push(match[1]);
    match = tableRegex.exec(normalized);
  }
  if (!tableMatches.length) return { ok: false, error: 'SQL 未包含可识别的数据表' };

  for (const rawTable of tableMatches) {
    const table = rawTable
      .split('.')
      .pop()
      .replace(/`/g, '')
      .trim()
      .toLowerCase();
    if (!ALLOWED_QUERY_TABLES.has(table)) {
      return { ok: false, error: `不允许访问表：${table}` };
    }
  }
  return { ok: true, sql: normalized };
}

function attachDefaultLimit(sql, limit = 200) {
  if (/\blimit\s+\d+/i.test(sql)) return sql;
  return `${sql}\nLIMIT ${limit}`;
}

function stringifyRowsForPrompt(rows, maxRows = 120, maxChars = 30000) {
  const clippedRows = Array.isArray(rows) ? rows.slice(0, maxRows) : [];
  let text = JSON.stringify(clippedRows, null, 2);
  if (text.length > maxChars) {
    text = `${text.slice(0, maxChars)}\n...(truncated)`;
  }
  return text;
}

function detectShellPaths() {
  const isWin = process.platform === 'win32';
  const whereCmd = isWin ? 'where' : 'which';
  const windir = process.env.WINDIR || 'C:\\Windows';
  const defaults = {
    cmd: isWin ? `${windir}\\System32\\cmd.exe` : 'sh',
    ps: isWin ? `${windir}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe` : 'pwsh',
    bash: isWin ? 'bash' : 'bash'
  };

  function findPath(name) {
    try {
      const result = spawnSync(whereCmd, [name], { encoding: 'utf8' });
      if (result.status === 0 && result.stdout) {
        const line = result.stdout.split(/\r?\n/).map((l) => l.trim()).find(Boolean);
        return line || null;
      }
    } catch (err) {
      return null;
    }
    return null;
  }

  return {
    cmd: findPath('cmd') || defaults.cmd,
    ps: findPath('powershell') || findPath('pwsh') || defaults.ps,
    bash: findPath('bash') || defaults.bash
  };
}

function normalizeStopAction(value, fallbackShell = 'cmd') {
  const action = value && typeof value === 'object' ? value : {};
  const shell = action.shell === 'ps' || action.shell === 'bash' || action.shell === 'cmd' ? action.shell : fallbackShell;
  return {
    name: typeof action.name === 'string' && action.name.trim() ? action.name.trim() : 'Stop Card',
    command: typeof action.command === 'string' ? action.command.trim() : '',
    shell,
    useDedicatedTerminal: action.useDedicatedTerminal !== false
  };
}

function writeSessionCommand(child, shell, command) {
  if (!child || child.killed || !command) return false;
  const normalized = (shell || 'cmd').toLowerCase();
  const lineBreak = normalized === 'cmd' ? '\r\n' : '\n';
  try {
    child.stdin.write(`${command}${lineBreak}`);
    return true;
  } catch (err) {
    return false;
  }
}

function waitMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function killProcessTree(childOrPid) {
  const pid = typeof childOrPid === 'number' ? childOrPid : childOrPid && childOrPid.pid;
  if (!pid) return;
  if (process.platform === 'win32') {
    try {
      spawn('taskkill', ['/PID', String(pid), '/T', '/F'], { windowsHide: true });
    } catch (err) {
      // ignore
    }
    return;
  }
  try {
    process.kill(-pid, 'SIGKILL');
    return;
  } catch (err) {
    // ignore
  }
  try {
    process.kill(pid, 'SIGKILL');
  } catch (err) {
    // ignore
  }
}



function spawnForShell(command, shell) {
  const paths = getShellPaths();
  const normalized = (shell || 'cmd').toLowerCase();
  const cwd = app.getPath('home') || process.env.USERPROFILE || process.env.HOME || process.cwd();
  if (process.platform === 'win32') {
    if (normalized === 'ps') {
      return spawn(paths.ps, ['-NoProfile', '-Command', command], { windowsHide: true, cwd });
    }
    if (normalized === 'bash') {
      return spawn(paths.bash, ['-lc', command], { windowsHide: true, cwd });
    }
    return spawn(paths.cmd, ['/c', command], { windowsHide: true, cwd });
  }
  if (normalized === 'ps') {
    return spawn(paths.ps || 'pwsh', ['-NoProfile', '-Command', command], { cwd });
  }
  if (normalized === 'bash') {
    return spawn(paths.bash || 'bash', ['-lc', command], { cwd });
  }
  return spawn(command, { shell: true, cwd });
}
function spawnShellSession(shell) {
  const paths = getShellPaths();
  const normalized = (shell || 'cmd').toLowerCase();
  const cwd = app.getPath('home') || process.env.USERPROFILE || process.env.HOME || process.cwd();
  if (process.platform === 'win32') {
    if (normalized === 'ps') {
      return spawn(paths.ps, ['-NoLogo', '-NoProfile', '-Command', '-'], { windowsHide: true, cwd });
    }
    if (normalized === 'bash') {
      return spawn(paths.bash, ['-s'], { windowsHide: true, cwd });
    }
    return spawn(paths.cmd, ['/Q', '/D'], { windowsHide: true, cwd });
  }
  if (normalized === 'ps') {
    return spawn(paths.ps || 'pwsh', ['-NoLogo', '-NoProfile', '-Command', '-'], { cwd });
  }
  if (normalized === 'bash') {
    return spawn(paths.bash || 'bash', ['-s'], { cwd });
  }
  return spawn(process.env.SHELL || 'sh', ['-s'], { cwd });
}

function buildSessionCommand(command, shell, marker) {
  const normalized = (shell || 'cmd').toLowerCase();
  if (normalized === 'ps') {
    return `& { ${command} }\nWrite-Output "${marker}$LASTEXITCODE"\n`;
  }
  if (normalized === 'bash') {
    return `${command}\necho ${marker}$?\n`;
  }
  return `${command}\r\necho ${marker}%ERRORLEVEL%\r\n`;
}

function closeSession(child, shell) {
  if (!child || child.killed) return;
  const normalized = (shell || 'cmd').toLowerCase();
  try {
    if (normalized === 'ps') {
      child.stdin.write('exit\n');
    } else if (normalized === 'bash') {
      child.stdin.write('exit\n');
    } else {
      child.stdin.write('exit\r\n');
    }
  } catch (err) {
    // ignore
  }
}

function resolvePtyCommand(shell) {
  const paths = getShellPaths();
  const normalized = (shell || 'cmd').toLowerCase();
  if (process.platform === 'win32') {
    if (normalized === 'ps') return { file: paths.ps, args: ['-NoLogo'] };
    if (normalized === 'bash') return { file: paths.bash, args: [] };
    return { file: paths.cmd, args: [] };
  }
  if (normalized === 'ps') return { file: paths.ps || 'pwsh', args: ['-NoLogo'] };
  if (normalized === 'bash') return { file: paths.bash || 'bash', args: [] };
  return { file: process.env.SHELL || 'sh', args: [] };
}

function runCommand(event, card, runId, stepId) {
  return new Promise((resolve) => {
    const startedAt = new Date().toISOString();
    sendToRenderer(event, 'run:step-begin', { runId, stepId, cardId: card.id, command: card.command, startedAt });

    const child = spawnForShell(card.command, card.shell);
    activeRuns.set(runId, {
      type: 'card',
      targetId: card.id,
      child,
      stepId,
      canceled: false
    });

    child.stdout.on('data', (data) => {
      sendToRenderer(event, 'run:log', {
        runId,
        stepId,
        stream: 'stdout',
        chunk: decodeChunk(data),
        at: new Date().toISOString()
      });
    });

    child.stderr.on('data', (data) => {
      sendToRenderer(event, 'run:log', {
        runId,
        stepId,
        stream: 'stderr',
        chunk: decodeChunk(data),
        at: new Date().toISOString()
      });
    });

    child.on('close', (code) => {
      const endedAt = new Date().toISOString();
      const runState = activeRuns.get(runId);
      const canceled = runState && runState.canceled;
      const exitCode = canceled ? -1 : code;
      const status = canceled ? 'stopped' : code === 0 ? 'success' : 'failed';
      sendToRenderer(event, 'run:step-end', { runId, stepId, exitCode, status, endedAt });
      activeRuns.delete(runId);
      resolve({ exitCode, status, endedAt });
    });
  });
}

function registerIpcHandlers() {
  ipcMain.handle('data:get', () => {
    return store.getAll();
  });

  ipcMain.handle('data:save', (event, data) => {
    store.setAll(data);
    return { ok: true };
  });

  ipcMain.handle('data:export', async () => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export Commands JSON',
      defaultPath: 'terminal-helper-export.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (canceled || !filePath) return { ok: false, canceled: true };
    fs.writeFileSync(filePath, JSON.stringify(store.getAll(), null, 2), 'utf-8');
    return { ok: true, filePath };
  });

  ipcMain.handle('data:export-custom', async (event, payload) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export Commands JSON',
      defaultPath: 'terminal-helper-export.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (canceled || !filePath) return { ok: false, canceled: true };
    fs.writeFileSync(filePath, JSON.stringify(payload || {}, null, 2), 'utf-8');
    return { ok: true, filePath };
  });

  ipcMain.handle('data:import', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Import Commands JSON',
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (canceled || !filePaths || filePaths.length === 0) return { ok: false, canceled: true };
    const content = fs.readFileSync(filePaths[0], 'utf-8');
    const data = JSON.parse(content);
    store.setAll(data);
    return { ok: true };
  });

  ipcMain.handle('data:import-raw', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Import Commands JSON',
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (canceled || !filePaths || filePaths.length === 0) return { ok: false, canceled: true };
    const content = fs.readFileSync(filePaths[0], 'utf-8');
    const data = JSON.parse(content);
    return { ok: true, data };
  });

  ipcMain.handle('board:fetch-data', async () => {
    try {
      const pool = getBoardDbPool();
      const [newsRows] = await pool.query(
        `
          SELECT
            id,
            publish_date,
            source,
            sentiment_score,
            keywords
          FROM land_news_analysis
          ORDER BY publish_date DESC
          LIMIT 5000
        `
      );
      const [wordRows] = await pool.query(
        `
          SELECT
            word,
            count
          FROM word_frequency_stats
          ORDER BY count DESC
          LIMIT 600
        `
      );
      const news = Array.isArray(newsRows)
        ? newsRows.map((row) => {
            let keywords = [];
            if (Array.isArray(row.keywords)) {
              keywords = row.keywords;
            } else if (typeof row.keywords === 'string' && row.keywords.trim()) {
              try {
                const parsed = JSON.parse(row.keywords);
                keywords = Array.isArray(parsed) ? parsed : [];
              } catch (err) {
                keywords = [];
              }
            }
            return {
              id: row.id,
              publish_date: row.publish_date ? String(row.publish_date).slice(0, 10) : '',
              source: row.source || '未知来源',
              sentiment_score: Number(row.sentiment_score || 0),
              keywords
            };
          })
        : [];
      const words = Array.isArray(wordRows)
        ? wordRows.map((row) => ({
            word: row.word || '',
            count: Number(row.count || 0)
          }))
        : [];
      return { ok: true, news, words };
    } catch (error) {
      return { ok: false, error: error && error.message ? error.message : '数据库连接失败' };
    }
  });

  ipcMain.handle('qa:ask', async (event, payload) => {
    try {
      const question = payload && typeof payload.question === 'string' ? payload.question.trim() : '';
      if (!question) {
        return { ok: false, error: '问题不能为空' };
      }

      const qwenSettings = getQwenSettings();
      const apiKey = qwenSettings.apiKey || process.env.DASHSCOPE_API_KEY;
      if (!apiKey) {
        return { ok: false, error: '未配置 API Key，请在牛棚配置中填写 Qwen API Key' };
      }
      const baseURL =
        (payload && typeof payload.baseURL === 'string' && payload.baseURL.trim()) ||
        qwenSettings.baseURL ||
        process.env.DASHSCOPE_BASE_URL ||
        'https://dashscope.aliyuncs.com/compatible-mode/v1';
      const model =
        (payload && typeof payload.model === 'string' && payload.model.trim()) ||
        qwenSettings.model ||
        process.env.DASHSCOPE_MODEL ||
        'qwen-plus';

      const client = new OpenAI({ apiKey, baseURL });
      const sqlCompletion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: QWEN_SQL_SYSTEM_PROMPT },
          { role: 'user', content: question }
        ]
      });

      const sqlOutput = extractCompletionText(sqlCompletion);
      if (!sqlOutput) {
        return { ok: false, error: '模型未返回 SQL' };
      }
      if (sqlOutput.includes(QWEN_NO_DATA_TEXT)) {
        return { ok: true, answer: QWEN_NO_DATA_TEXT };
      }

      const sqlCandidate = extractSqlFromModelText(sqlOutput);
      const sqlCheck = validateSelectSql(sqlCandidate);
      if (!sqlCheck.ok) {
        return { ok: false, error: `SQL 校验失败：${sqlCheck.error}` };
      }

      const executableSql = attachDefaultLimit(sqlCheck.sql);
      const pool = getBoardDbPool();
      const [rows] = await pool.query(executableSql);
      const rowCount = Array.isArray(rows) ? rows.length : 0;
      const rowsText = stringifyRowsForPrompt(rows);

      const summaryCompletion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: QWEN_SUMMARY_SYSTEM_PROMPT },
          {
            role: 'user',
            content:
              `用户问题：${question}\n\n` +
              `已执行SQL：\n${executableSql}\n\n` +
              `查询结果行数：${rowCount}\n` +
              `查询结果(JSON)：\n${rowsText}`
          }
        ]
      });

      const answer = extractCompletionText(summaryCompletion);
      return {
        ok: true,
        answer: answer || (rowCount ? '查询完成，但模型未返回总结文本。' : '未查到匹配数据。'),
        sql: executableSql,
        rowCount
      };
    } catch (error) {
      const message = error && error.message ? error.message : '问答请求失败';
      return { ok: false, error: message };
    }
  });
  ipcMain.handle('settings:detect-shells', () => {
    return detectShellPaths();
  });

  ipcMain.handle('settings:validate-path', (event, targetPath) => {
    if (!targetPath || typeof targetPath !== 'string') return false;
    const trimmed = targetPath.trim();
    if (!trimmed) return false;
    if (!path.isAbsolute(trimmed)) return false;
    return fs.existsSync(trimmed);
  });

  ipcMain.handle('run:card', async (event, card) => {
    const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const startedAt = new Date().toISOString();
    sendToRenderer(event, 'run:begin', { runId, targetType: 'card', targetId: card.id, startedAt });

    const stepId = `step_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const result = await runCommand(event, card, runId, stepId);
    const status = result.status;
    const endedAt = new Date().toISOString();
    sendToRenderer(event, 'run:end', { runId, status, endedAt });

    return { runId, status };
  });

  ipcMain.handle('run:collection', async (event, payload) => {
    const { collection, cards } = payload;
    if (activeCollections.has(collection.id)) {
      return { error: 'Collection is already running.' };
    }
    activeCollections.add(collection.id);

    const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const startedAt = new Date().toISOString();
    sendToRenderer(event, 'run:begin', { runId, targetType: 'collection', targetId: collection.id, startedAt });

    const shell = cards && cards.length ? cards[0].shell : 'cmd';
    const session = spawnShellSession(shell);
    const stopAction = normalizeStopAction(collection.stopAction, shell);
    const runState = {
      type: 'collection',
      runId,
      targetId: collection.id,
      session,
      shell,
      stopAction,
      canceled: false
    };
    activeRuns.set(runId, runState);
    let status = 'success';
    let currentStep = null;
    let stdoutTail = '';

    function emitStdout(chunk) {
      if (!currentStep || !chunk) return;
      sendToRenderer(event, 'run:log', {
        runId,
        stepId: currentStep.stepId,
        stream: 'stdout',
        chunk,
        at: new Date().toISOString()
      });
    }

    function emitStderr(chunk) {
      if (!currentStep || !chunk) return;
      sendToRenderer(event, 'run:log', {
        runId,
        stepId: currentStep.stepId,
        stream: 'stderr',
        chunk,
        at: new Date().toISOString()
      });
    }

    function handleStdout(text) {
      if (!currentStep) return;
      const marker = currentStep.marker;
      let buffer = stdoutTail + text;
      let markerIndex = buffer.indexOf(marker);
      if (markerIndex === -1) {
        if (buffer.length > marker.length) {
          const emit = buffer.slice(0, buffer.length - marker.length);
          emitStdout(emit);
          stdoutTail = buffer.slice(-marker.length);
        } else {
          stdoutTail = buffer;
        }
        return;
      }

      const before = buffer.slice(0, markerIndex);
      if (before) emitStdout(before);

      const after = buffer.slice(markerIndex + marker.length);
      const match = after.match(/^(\d+)/);
      const exitCode = match ? Number(match[1]) : 0;
      stdoutTail = '';

      const endedAt = new Date().toISOString();
      const stepId = currentStep.stepId;
      const stepStatus = exitCode === 0 ? 'success' : 'failed';
      sendToRenderer(event, 'run:step-end', { runId, stepId, exitCode, status: stepStatus, endedAt });
      currentStep.resolve({ exitCode, status: stepStatus });
      currentStep = null;
    }

    session.stdout.on('data', (data) => {
      handleStdout(decodeChunk(data));
    });

    session.stderr.on('data', (data) => {
      emitStderr(decodeChunk(data));
    });

    session.on('close', () => {
      if (currentStep) {
        if (stdoutTail) {
          emitStdout(stdoutTail);
          stdoutTail = '';
        }
        const endedAt = new Date().toISOString();
        const stopped = runState.canceled;
        sendToRenderer(event, 'run:step-end', {
          runId,
          stepId: currentStep.stepId,
          exitCode: stopped ? -1 : 1,
          status: stopped ? 'stopped' : 'failed',
          endedAt
        });
        currentStep.resolve({ exitCode: stopped ? -1 : 1, status: stopped ? 'stopped' : 'failed' });
        currentStep = null;
      }
    });

    for (const card of cards) {
      if (status !== 'success') break;
      if (runState.canceled) {
        status = 'stopped';
        break;
      }
      const stepId = `step_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const startedAtStep = new Date().toISOString();
      sendToRenderer(event, 'run:step-begin', {
        runId,
        stepId,
        cardId: card.id,
        command: card.command,
        startedAt: startedAtStep
      });

      const marker = `__TH_END_${stepId}__`;
      const commandText = buildSessionCommand(card.command, shell, marker);
      const result = await new Promise((resolve) => {
        currentStep = { stepId, marker, resolve };
        stdoutTail = '';
        session.stdin.write(commandText);
      });

      if (runState.canceled) {
        status = 'stopped';
      } else if (result.exitCode !== 0) {
        status = 'failed';
      }
    }

    closeSession(session, shell);
    const endedAt = new Date().toISOString();
    if (runState.canceled) {
      status = 'stopped';
    }
    sendToRenderer(event, 'run:end', { runId, status, endedAt });
    activeCollections.delete(collection.id);
    activeRuns.delete(runId);
    return { runId, status };
  });

  ipcMain.handle('run:stop', async (event, runId, options) => {
    if (!runId) return { ok: false, error: 'Missing runId' };
    const runState = activeRuns.get(runId);
    if (!runState) return { ok: false, error: 'Not found' };
    runState.canceled = true;
    if (runState.type === 'card') {
      const child = runState.child;
      try {
        if (child && !child.killed) {
          killProcessTree(child);
        }
      } catch (err) {
        // ignore
      }
      return { ok: true };
    }
    if (runState.type === 'collection') {
      const session = runState.session;
      const incomingStopAction = options && typeof options === 'object' ? options.stopAction : null;
      const stopAction = normalizeStopAction(incomingStopAction || runState.stopAction, runState.shell);
      try {
        if (session && !session.killed) {
          try {
            session.stdin.write('\u0003');
          } catch (err) {
            // ignore
          }
          await waitMs(120);
        }
        if (stopAction.command) {
          if (stopAction.useDedicatedTerminal) {
            spawnForShell(stopAction.command, stopAction.shell || runState.shell);
          } else if (session && !session.killed) {
            writeSessionCommand(session, runState.shell, stopAction.command);
            await waitMs(200);
          }
        }
        closeSession(session, runState.shell);
        if (session && !session.killed) {
          killProcessTree(session);
        }
      } catch (err) {
        // ignore
      }
      if (runState.targetId) {
        activeCollections.delete(runState.targetId);
      }
      return { ok: true };
    }
    return { ok: false, error: 'Unknown run type' };
  });

  ipcMain.handle('terminal:create', (event, options) => {
    const cols = Number(options && options.cols) || 80;
    const rows = Number(options && options.rows) || 24;
    const shell = options && options.shell ? options.shell : 'cmd';
    const cwd = app.getPath('home') || process.env.USERPROFILE || process.env.HOME || process.cwd();
    const { file, args } = resolvePtyCommand(shell);
    const ptyProcess = pty.spawn(file, args, {
      name: 'xterm-color',
      cols,
      rows,
      cwd,
      env: process.env
    });
    const id = `term_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    activeTerminals.set(id, { pty: ptyProcess, sender: event.sender });
    ptyProcess.onData((data) => {
      try {
        event.sender.send('terminal:data', { id, data });
      } catch (err) {
        // ignore
      }
    });
    ptyProcess.onExit(() => {
      try {
        event.sender.send('terminal:exit', { id });
      } catch (err) {
        // ignore
      }
      activeTerminals.delete(id);
    });
    return { ok: true, id };
  });

  ipcMain.handle('terminal:write', (event, payload) => {
    const id = payload && payload.id;
    const data = payload && payload.data;
    const session = id ? activeTerminals.get(id) : null;
    if (!session) return { ok: false, error: 'Not found' };
    try {
      session.pty.write(data);
    } catch (err) {
      return { ok: false, error: 'Write failed' };
    }
    return { ok: true };
  });

  ipcMain.handle('terminal:resize', (event, payload) => {
    const id = payload && payload.id;
    const cols = Number(payload && payload.cols);
    const rows = Number(payload && payload.rows);
    const session = id ? activeTerminals.get(id) : null;
    if (!session) return { ok: false, error: 'Not found' };
    if (!Number.isFinite(cols) || !Number.isFinite(rows)) return { ok: false, error: 'Invalid size' };
    try {
      session.pty.resize(cols, rows);
    } catch (err) {
      return { ok: false, error: 'Resize failed' };
    }
    return { ok: true };
  });

  ipcMain.handle('terminal:close', (event, id) => {
    const session = id ? activeTerminals.get(id) : null;
    if (!session) return { ok: false, error: 'Not found' };
    try {
      session.pty.kill();
    } catch (err) {
      // ignore
    }
    activeTerminals.delete(id);
    return { ok: true };
  });

  ipcMain.handle('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.minimize();
  });

  ipcMain.handle('window:toggle-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return false;
    if (win.isMaximized()) {
      win.unmaximize();
      return false;
    }
    win.maximize();
    return true;
  });

  ipcMain.handle('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
  });

  ipcMain.handle('window:is-maximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win ? win.isMaximized() : false;
  });
}

module.exports = { registerIpcHandlers };





