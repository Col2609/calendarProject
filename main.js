const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 330,
    height: 410,
    frame: false,
    transparent: false,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('src/index.html');

  win.on('resize', () => {
    const [width, height] = win.getSize();

    console.log(`Width: ${width} | Height: ${height}`);
  });
}

app.whenReady().then(() => {
  createWindow();
});
