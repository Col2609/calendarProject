const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {});

contextBridge.exposeInMainWorld('electronAPI', {
  pinWindow: (isPinned) => ipcRenderer.invoke('window:pin', isPinned),
  closeWindow: () => ipcRenderer.send('window:close'),
  login: () => ipcRenderer.invoke('auth:login'),
  getMonthSchedule: (date) => ipcRenderer.invoke('schedule:getMonth', date),
  getWeekSchedule: (date) => ipcRenderer.invoke('schedule:getWeek', date),
});
