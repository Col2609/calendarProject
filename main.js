const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
require('dotenv').config();

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));
let win;
let loginPromise = null;

const CONFIG = {
  user: process.env.UT_USER,
  pass: process.env.UT_PASS,
  token: null,
  cache: null,
};

function getSystemDate() {
  const now = new Date();

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`; // format API cần
}

function generateFakeCaptcha(length = 30) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

async function apiGet(url) {
  await ensureLogin();

  try {
    const res = await client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json, text/plain, */*',
        Referer: 'https://portal.ut.edu.vn/dashboard',
        Authorization: `Bearer ${CONFIG.token}`,
      },
    });

    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      console.log('[AUTH] Token invalid -> relogin');

      CONFIG.token = null;

      await ensureLogin();

      const retry = await client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'application/json, text/plain, */*',
          Referer: 'https://portal.ut.edu.vn/dashboard',
          Authorization: `Bearer ${CONFIG.token}`,
        },
      });

      return retry.data;
    }

    throw err;
  }
}

async function login() {
  const fakeCaptcha = generateFakeCaptcha();

  const res = await client.post(
    `https://portal.ut.edu.vn/api/v1/user/login?g-recaptcha-response=${fakeCaptcha}`,
    {
      username: CONFIG.user,
      password: CONFIG.pass,
    },
    {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json',
      },
    }
  );
  CONFIG.token = res.data?.token;

  if (!CONFIG.token) {
    throw new Error('Login failed');
  }
}

async function ensureLogin() {
  if (CONFIG.token) return CONFIG.token;

  if (!loginPromise) {
    loginPromise = login().catch((err) => {
      loginPromise = null;
      throw err;
    });
  }

  try {
    await loginPromise;
  } finally {
    loginPromise = null;
  }
  return CONFIG.token;
}

async function getMonthSchedule(date) {
  return apiGet(`https://portal.ut.edu.vn/api/v1/lichhoc/thang?date=${date}`);
}

async function getWeekSchedule(date) {
  return apiGet(`https://portal.ut.edu.vn/api/v1/lichhoc/lichTuan?date=${date}`);
}

function createWindow() {
  win = new BrowserWindow({
    width: 420,
    height: 500,
    frame: false,
    transparent: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'src/Font-end/js/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile('index.html');
}

ipcMain.handle('window:pin', (_, isPinned) => {
  if (!win) return;

  win.setMovable(!isPinned);
});

ipcMain.handle('auth:login', async () => {
  await ensureLogin();
  return true;
});

ipcMain.handle('schedule:getMonth', async (_, date) => {
  try {
    return await getMonthSchedule(date);
  } catch (err) {
    console.error('getMonthSchedule error:', err);
    throw err;
  }
});

ipcMain.handle('schedule:getWeek', async (_, date) => {
  try {
    return await getWeekSchedule(date);
  } catch (err) {
    console.error('getWeekSchedule error:', err);
    throw err;
  }
});

ipcMain.on('window:close', () => {
  app.quit();
});

app.whenReady().then(async () => {
  createWindow();
});
