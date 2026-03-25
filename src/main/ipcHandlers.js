const { ipcMain, dialog, BrowserWindow } = require('electron');
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
  if (process.platform === 'win32') {
    if (normalized === 'ps') {
      return spawn(paths.ps, ['-NoProfile', '-Command', command], { windowsHide: true });
    }
    if (normalized === 'bash') {
      return spawn(paths.bash, ['-lc', command], { windowsHide: true });
    }
    return spawn(paths.cmd, ['/c', command], { windowsHide: true });
  }
  if (normalized === 'ps') {
    return spawn(paths.ps || 'pwsh', ['-NoProfile', '-Command', command]);
  }
  if (normalized === 'bash') {
    return spawn(paths.bash || 'bash', ['-lc', command]);
  }
  return spawn(command, { shell: true });
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

    let status = 'success';
    for (const card of cards) {
      const stepId = `step_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const result = await runCommand(event, card, runId, stepId);
      if (result.exitCode !== 0) {
        status = 'failed';
        break;
      }
    }

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
