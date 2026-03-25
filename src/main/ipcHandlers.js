const { ipcMain, dialog, BrowserWindow, app } = require('electron');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const store = require('./store');
const iconv = require('iconv-lite');

const activeCollections = new Set();

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

function runCommand(event, card, runId, stepId) {
  return new Promise((resolve) => {
    const startedAt = new Date().toISOString();
    sendToRenderer(event, 'run:step-begin', { runId, stepId, cardId: card.id, command: card.command, startedAt });

    const child = spawnForShell(card.command, card.shell);

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
      const status = code === 0 ? 'success' : 'failed';
      sendToRenderer(event, 'run:step-end', { runId, stepId, exitCode: code, status, endedAt });
      resolve({ exitCode: code, status, endedAt });
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

    return { runId };
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
        const endedAt = new Date().toISOString();
        sendToRenderer(event, 'run:step-end', {
          runId,
          stepId: currentStep.stepId,
          exitCode: 1,
          status: 'failed',
          endedAt
        });
        currentStep.resolve({ exitCode: 1, status: 'failed' });
        currentStep = null;
      }
    });

    for (const card of cards) {
      if (status !== 'success') break;
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

      if (result.exitCode !== 0) {
        status = 'failed';
      }
    }

    closeSession(session, shell);
    const endedAt = new Date().toISOString();
    sendToRenderer(event, 'run:end', { runId, status, endedAt });
    activeCollections.delete(collection.id);
    return { runId };
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



