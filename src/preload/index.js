const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('terminalHelper', {
  getData: () => ipcRenderer.invoke('data:get'),
  saveData: (data) => ipcRenderer.invoke('data:save', data),
  exportData: () => ipcRenderer.invoke('data:export'),
  exportDataCustom: (data) => ipcRenderer.invoke('data:export-custom', data),
  importData: () => ipcRenderer.invoke('data:import'),
  importDataRaw: () => ipcRenderer.invoke('data:import-raw'),
  detectShellPaths: () => ipcRenderer.invoke('settings:detect-shells'),
  validateShellPath: (path) => ipcRenderer.invoke('settings:validate-path', path),
  runCard: (card) => ipcRenderer.invoke('run:card', card),
  runCollection: (collection, cards) => ipcRenderer.invoke('run:collection', { collection, cards }),
  windowMinimize: () => ipcRenderer.invoke('window:minimize'),
  windowToggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize'),
  windowClose: () => ipcRenderer.invoke('window:close'),
  windowIsMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  onRunBegin: (callback) => ipcRenderer.on('run:begin', (_, payload) => callback(payload)),
  onRunStepBegin: (callback) => ipcRenderer.on('run:step-begin', (_, payload) => callback(payload)),
  onRunLog: (callback) => ipcRenderer.on('run:log', (_, payload) => callback(payload)),
  onRunStepEnd: (callback) => ipcRenderer.on('run:step-end', (_, payload) => callback(payload)),
  onRunEnd: (callback) => ipcRenderer.on('run:end', (_, payload) => callback(payload))
});
