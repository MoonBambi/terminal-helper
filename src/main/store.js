const { default: Store } = require('electron-store');

const defaults = {
  cards: [],
  collections: [],
  runLogs: [],
  settings: {
    shellPaths: {
      cmd: 'cmd.exe',
      ps: 'powershell.exe',
      bash: 'bash'
    }
  }
};

const store = new Store({
  name: 'terminal-helper',
  defaults
});

function getAll() {
  return store.store;
}

function setAll(data) {
  store.set({
    cards: Array.isArray(data.cards) ? data.cards : [],
    collections: Array.isArray(data.collections) ? data.collections : [],
    runLogs: Array.isArray(data.runLogs) ? data.runLogs : [],
    settings: data.settings || defaults.settings
  });
}

module.exports = { getAll, setAll };
