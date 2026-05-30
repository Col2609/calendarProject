const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {});

contextBridge.exposeInMainWorld('electronAPI', {
  pinWindow: (isPinned) => ipcRenderer.invoke('window:pin', isPinned),
  closeWindow: () => ipcRenderer.send('window:close'),
});
