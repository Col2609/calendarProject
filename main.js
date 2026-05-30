const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 420,
    height: 500,
    frame: false,
    transparent: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'src/js/preload.js'),
    },
    });

  win.loadFile('index.html');

  win.on('resize', () => {
    const [width, height] = win.getSize();

    console.log(`Width: ${width} | Height: ${height}`);
  });
}

ipcMain.handle('window:pin', (_, isPinned) => {
  if (!win) return;

  win.setMovable(!isPinned);
});

ipcMain.on('window:close', () => {
  app.quit();
});

app.whenReady().then(() => {
  createWindow();
});
