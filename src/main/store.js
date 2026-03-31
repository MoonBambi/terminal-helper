const { app } = require('electron');
const fs = require('fs');
const path = require('path');

const defaults = {
  cards: [],
  collections: [],
  tasks: [],
  taskRunLogs: [],
  runLogs: [],
  settings: {
    shellPaths: {
      cmd: 'cmd.exe',
      ps: 'powershell.exe',
      bash: 'bash'
    },
    qwen: {
      apiKey: '',
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen-plus'
    }
  }
};

function resolveDataDir() {
  return path.join(app.getPath('appData'), 'terminal-helper', 'data');
}

function resolveDataFile() {
  return path.join(resolveDataDir(), 'terminal-helper.json');
}

function resolveSampleFile() {
  return path.join(app.getAppPath(), 'data', 'sample.json');
}

function resolveLegacyFile() {
  return path.join(app.getAppPath(), 'data', 'terminal-helper.json');
}

function ensureDataFile() {
  const dir = resolveDataDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const file = resolveDataFile();
  if (!fs.existsSync(file)) {
    let initial = defaults;
    const legacyPath = resolveLegacyFile();
    if (fs.existsSync(legacyPath)) {
      try {
        const raw = fs.readFileSync(legacyPath, 'utf-8');
        initial = JSON.parse(raw);
      } catch (err) {
        initial = defaults;
      }
    } else {
      const samplePath = resolveSampleFile();
      if (fs.existsSync(samplePath)) {
        try {
          const raw = fs.readFileSync(samplePath, 'utf-8');
          initial = JSON.parse(raw);
        } catch (err) {
          initial = defaults;
        }
      }
    }
    fs.writeFileSync(file, JSON.stringify(normalize(initial), null, 2), 'utf-8');
  }
}

function normalize(data) {
  const shellPaths = data?.settings?.shellPaths || {};
  const qwen = data?.settings?.qwen || {};
  return {
    cards: Array.isArray(data?.cards) ? data.cards : [],
    collections: Array.isArray(data?.collections) ? data.collections : [],
    tasks: Array.isArray(data?.tasks) ? data.tasks : [],
    taskRunLogs: Array.isArray(data?.taskRunLogs) ? data.taskRunLogs : [],
    runLogs: Array.isArray(data?.runLogs) ? data.runLogs : [],
    settings: {
      shellPaths: {
        cmd: shellPaths.cmd || defaults.settings.shellPaths.cmd,
        ps: shellPaths.ps || defaults.settings.shellPaths.ps,
        bash: shellPaths.bash || defaults.settings.shellPaths.bash
      },
      qwen: {
        apiKey: typeof qwen.apiKey === 'string' ? qwen.apiKey : defaults.settings.qwen.apiKey,
        baseURL: qwen.baseURL || defaults.settings.qwen.baseURL,
        model: qwen.model || defaults.settings.qwen.model
      }
    }
  };
}

function getAll() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(resolveDataFile(), 'utf-8');
    const data = JSON.parse(raw);
    return normalize(data);
  } catch (err) {
    return normalize(defaults);
  }
}

function setAll(data) {
  ensureDataFile();
  const normalized = normalize(data);
  fs.writeFileSync(resolveDataFile(), JSON.stringify(normalized, null, 2), 'utf-8');
}

module.exports = { getAll, setAll };
