const monthNames = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

//Data

let scheduleMonth = [];
let scheduleWeek = [];
// Cache
const monthCache = new Map();
const weekCache = new Map();

// Header
const monthYearElement = document.getElementById('monthYear');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const toDayBtn = document.getElementById('toDayBtn');

// View Buttons
const monthBtn = document.getElementById('monthBtn');
const weekBtn = document.getElementById('weekBtn');
const dayBtn = document.getElementById('dayBtn');

// Frame Button
const pinBtn = document.getElementById('pinBtn');
const closeBtn = document.getElementById('closeBtn');

// Sections
const monthViewDates = document.getElementById('monthViewDates');
const weekViewDates = document.getElementById('weekViewList');
const dayViewDates = document.getElementById('dayViewList');
// State
let currentDate = new Date();
// Util
function getActiveView() {
  return document.querySelector('.calendar section.active');
}

function formatDate(day, month, year) {
  return `${String(day).padStart(2, '0')}/` + `${String(month).padStart(2, '0')}/` + year;
}

async function goToDayView(dateObj) {
  currentDate = new Date(dateObj);

  scheduleWeek = await getWeekData(currentDate);
  prefetchWeek();
  // bỏ active khỏi tất cả section và button
  document.querySelectorAll('.calendar section').forEach((s) => s.classList.remove('active'));
  document.querySelectorAll('.header__view-button').forEach((b) => b.classList.remove('active'));

  // active dayView
  document.getElementById('dayView').classList.add('active');
  dayBtn.classList.add('active');

  renderDayView(currentDate);
}

function formatApiDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

function getWeekKey(date) {
  const d = new Date(date);

  let day = d.getDay();
  if (day === 0) day = 7;

  d.setDate(d.getDate() - day + 1);

  return formatApiDate(d);
}

// Call data
async function getMonthData(date) {
  const key = getMonthKey(date);

  if (monthCache.has(key)) {
    console.log(`%c[CACHE] MONTH ${key}`, 'color:pink;font-weight:bold');
    return monthCache.get(key);
  }
  console.log(`%c[API CALL] MONTH ${key}`, 'color:orange;font-weight:bold');

  const start = performance.now();

  const res = await window.electronAPI.getMonthSchedule(formatApiDate(date));

  const elapsed = Math.round(performance.now() - start);

  console.log(`%c[API DONE] MONTH ${key} (${elapsed}ms)`, 'color:green;font-weight:bold');

  const data = res.body || [];

  monthCache.set(key, data);

  return data;
}

async function getWeekData(date) {
  const key = getWeekKey(date);

  if (weekCache.has(key)) {
    console.log(`%c[CACHE] WEEK ${key}`, 'color:pink;font-weight:bold');

    return weekCache.get(key);
  }

  console.log(`%c[API CALL] WEEK ${key}`, 'color:orange;font-weight:bold');

  const start = performance.now();

  const res = await window.electronAPI.getWeekSchedule(formatApiDate(date));

  const elapsed = Math.round(performance.now() - start);

  console.log(`%c[API DONE] WEEK ${key} (${elapsed}ms)`, 'color:green;font-weight:bold');

  const data = res.body || [];

  weekCache.set(key, data);

  return data;
}

async function prefetchMonth() {
  console.log(`%cCall prefetchMonth`, 'font-weight:bold;font-style:italic');
  const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

  const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

  getMonthData(prev).catch(() => {});
  getMonthData(next).catch(() => {});
}

async function prefetchWeek() {
  const prev = new Date(currentDate);
  prev.setDate(prev.getDate() - 7);

  const next = new Date(currentDate);
  next.setDate(next.getDate() + 7);

  getWeekData(prev).catch(() => {});
  getWeekData(next).catch(() => {});
}

// Load Data
async function loadSchedule() {
  console.log(`%cCall loadSchedule`, 'font-weight:bold;font-style:italic');

  await window.electronAPI.login();

  scheduleMonth = await getMonthData(currentDate);
  prefetchMonth();
  renderMonthView();
}

let lastMonthKey = null;
async function reloadSchedule() {
  try {
    const activeView = getActiveView();

    if (activeView === monthView) {
      scheduleMonth = await getMonthData(currentDate);

      prefetchMonth();
    }

    if (activeView === weekView || activeView === dayView) {
      scheduleWeek = await getWeekData(currentDate);

      prefetchWeek();
      const monthKey = getMonthKey(currentDate);
      if (monthKey != lastMonthKey) {
        lastMonthKey = monthKey;
        getMonthData(currentDate).catch(() => {});
      }
    }
    console.log(`[RELOAD] ${activeView.id} | ${formatApiDate(currentDate)}`);
    handleActiveView();
  } catch (err) {
    console.error(err);
  }
}

// Render Month View
function renderMonthView() {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const prevMonthLastDay = new Date(currentYear, currentMonth, 0);
  const currentMonthLastDay = new Date(currentYear, currentMonth + 1, 0);
  const totalDay = currentMonthLastDay.getDate();
  const firstDayIndex = prevMonthLastDay.getDay();

  const monthYearString = `${monthNames[currentMonth]}, ${currentYear}`;
  monthYearElement.textContent = monthYearString;

  let datesHTML = '';
  let totalCells = 0;

  const scheduleMap = {};

  scheduleMonth.forEach((item) => {
    scheduleMap[item.date] = item;
  });

  for (let i = firstDayIndex; i > 0; i--) {
    const prevDate = new Date(currentYear, currentMonth, 0 - i + 1);
    // console.log('prevDate:', prevDate);
    datesHTML += `<button class = "month-view__date inactive">${prevDate.getDate()}</button>`;
    totalCells++;
  }

  for (let i = 1; i <= totalDay; i++) {
    const date = new Date(currentYear, currentMonth, i);
    // console.log('date', date);
    const formattedDate = formatDate(i, currentMonth + 1, currentYear);
    // console.log('formattedDate', formattedDate);
    const activeClass = date.toDateString() === new Date().toDateString() ? 'active' : '';
    const scheduleItem = scheduleMap[formattedDate];
    // console.log(scheduleItem);
    const hasScheduleClass = scheduleItem ? 'has-schedule' : '';

    const subjects = scheduleItem?.subjects || [];
    const count = subjects.length;
    let dotHTML = ``;
    if (count > 0 && count <= 3) {
      dotHTML = `
        <div class="dot-group">
          ${Array(count)
            .fill(0)
            .map((_, idx) => {
              const color = subjects[idx]?.color;
              return `<span class="dot" style="color:${color}">•</span>`;
            })
            .join('')}
        </div>
      `;
    } else if (count > 3) {
      dotHTML = `
        <span class="dot-more">+${count}</span>
      `;
    }
    datesHTML += `
      <button
        class="
          month-view__date
          ${activeClass}
          ${hasScheduleClass}
        "
            data-date="${formatDate(i, currentMonth + 1, currentYear)}"
      >
        <span class="date-number">
          ${i}
        </span>

        ${dotHTML}
      </button>
    `;
    totalCells++;
  }

  const remainCells = 42 - totalCells;

  for (let i = 1; i <= remainCells; i++) {
    datesHTML += `
    <button class="month-view__date inactive">
      ${i}
    </button>
  `;
  }

  monthViewDates.innerHTML = datesHTML;

  monthViewDates.querySelectorAll('.month-view__date:not(.inactive)').forEach((btn) => {
    const dateString = btn.dataset.date;
    const [day, month, year] = dateString.split('/');

    const date = new Date(year, month - 1, day);

    // console.log(date);
    btn.addEventListener('click', async () => {
      await goToDayView(date);
    });
  });
}

// Render Week View
function renderWeekView() {
  const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const firstDayOfCurrentWeek = new Date(currentDate);
  let datesHTML = '';

  let day = firstDayOfCurrentWeek.getDay();
  if (day === 0) {
    day = 7;
  }
  firstDayOfCurrentWeek.setDate(firstDayOfCurrentWeek.getDate() - day + 1);
  // console.log(firstDayOfCurrentWeek);

  const lastDayOfCurrentWeek = new Date(firstDayOfCurrentWeek);
  lastDayOfCurrentWeek.setDate(firstDayOfCurrentWeek.getDate() + 6);
  // console.log(lastDayOfCurrentWeek);

  const monthYearString =
    `${firstDayOfCurrentWeek.getDate()}/${firstDayOfCurrentWeek.getMonth() + 1} - ` +
    `${lastDayOfCurrentWeek.getDate()}/${lastDayOfCurrentWeek.getMonth() + 1}`;
  monthYearElement.textContent = monthYearString;

  const scheduleMap = {};

  scheduleWeek.forEach((item) => {
    const date = item.ngayBatDauHoc;

    if (!scheduleMap[date]) {
      scheduleMap[date] = [];
    }

    scheduleMap[date].push(item);
  });

  for (let i = 0; i < 7; i++) {
    const date = new Date(firstDayOfCurrentWeek);

    // cộng thêm i ngày
    date.setDate(firstDayOfCurrentWeek.getDate() + i);

    const activeClass = date.toDateString() === new Date().toDateString() ? 'active' : '';

    const formattedDate = formatDate(date.getDate(), date.getMonth() + 1, date.getFullYear());
    // console.log(formattedDate);

    const scheduleItems = scheduleMap[formattedDate] || [];
    // console.log(scheduleItems);

    datesHTML += `
          <div class="week-view__day ${activeClass} ${scheduleItems.length <= 1 ? 'empty' : ''}">
            <div class="week-view__date">
              <span class="day">${weekdays[i]}</span>
              <span class="date">${date.getDate()}</span>
            </div>

            <div class="week-view__timeLine">
            ${
              scheduleItems.length > 0
                ? scheduleItems
                    .map(
                      (item) => `
                <div class="schedule-item">

                <span class="time">
                  ${item.timeToDisplay}
                </span>

                <span class="subject">
                  ${item.tenMonHoc}
                </span>
              </div>
              `
                    )
                    .join('')
                : `<div class="no-schedule">Không có lịch học</div>`
            }
            </div>
          </div>
          
          ${i !== 6 ? '<div class="week-view__divider"></div>' : ''}
    `;
  }

  weekViewDates.innerHTML = datesHTML;
}

function renderDayView(targetDateObj = currentDate) {
  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const shifts = [
    { id: 1, label: 'Ca 1', time: '06:45 - 09:15', group: 'morning', start: '06:45', end: '09:15' },
    { id: 2, label: 'Ca 2', time: '09:25 - 11:55', group: 'morning', start: '09:25', end: '11:55' },
    { id: 3, label: 'Ca 3', time: '12:10 - 14:40', group: 'afternoon', start: '12:10', end: '14:40' },
    { id: 4, label: 'Ca 4', time: '14:50 - 17:20', group: 'afternoon', start: '14:50', end: '17:20' },
    { id: 5, label: 'Ca 5', time: '17:30 - 20:00', group: 'evening', start: '17:30', end: '20:00' },
  ];

  const currentYear = targetDateObj.getFullYear();
  const currentMonth = targetDateObj.getMonth();
  const currentDay = targetDateObj.getDate();
  const getDay = targetDateObj.getDay();
  const targetDate = formatDate(currentDay, currentMonth + 1, currentYear);
  const monthYearString = `${weekdays[getDay]}, ${targetDate}`;
  monthYearElement.textContent = monthYearString;

  const data = scheduleWeek.filter((x) => x.ngayBatDauHoc === targetDate);
  const now = new Date();

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  function toMinutes(timeStr) {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  const shiftMap = {};
  data.forEach((item) => {
    shiftMap[item.tuGio] = item;
  });

  const candidates = shifts
    .map((shift, index) => {
      const match = shiftMap[shift.start];
      if (!match) return null;

      const start = toMinutes(shift.start);
      const end = toMinutes(shift.end);

      return { index, start, end };
    })
    .filter(Boolean);

  let activeIndex = -1;

  const running = candidates.filter((c) => currentMinutes >= c.start && currentMinutes <= c.end);

  if (running.length > 0) {
    activeIndex = running[0].index;
  } else {
    const upcoming = candidates.filter((c) => c.start > currentMinutes).sort((a, b) => a.start - b.start);

    if (upcoming.length > 0) {
      activeIndex = upcoming[0].index;
    }
  }

  // console.log(activeIndex);

  const renderShift = (shift, index) => {
    const match = shiftMap[shift.start];

    const isActive = index === activeIndex;

    return `
      <div class="schedule-item ${isActive ? 'active' : ''}">
        <div class="schedule-item__title">
          ${shift.label} | ${shift.time}
        </div>

        ${
          match
            ? `
              <div class="schedule-item__subject">
                ${match.tenMonHoc}
              </div>
              <div class="schedule-item__room">
                ${match.tenPhong}
              </div>
              ${match.ghiChu ? `<div class="schedule-item__notes">${match.ghiChu}</div>` : ''}
            `
            : 'Không có môn học!'
        }
      </div>
    `;
  };

  dayViewDates.innerHTML = `
    <div class="day-view__group day-view__group--morning">
    <div class="day-view__title">Sáng</div>
    <div class="day-view__content">
      ${shifts
        .slice(0, 2)
        .map((s, i) => renderShift(s, i))
        .join('')}
    </div>
  </div>

  <div class="day-view__group day-view--afternoon">
    <div class="day-view__title">Chiều</div>
    <div class="day-view__content">
      ${shifts
        .slice(2, 4)
        .map((s, i) => renderShift(s, i + 2))
        .join('')}
    </div>
  </div>

  <div class="day-view__group day-view--evening">
    <div class="day-view__title">Tối</div>
    <div class="day-view__content">
      ${shifts
        .slice(4)
        .map((s, i) => renderShift(s, i + 4))
        .join('')}
    </div>
  </div>
  `;
}
// Switch View
function switchView(viewId, buttonElement) {
  // remove active khỏi tất cả section
  document.querySelectorAll('.calendar section').forEach((section) => {
    section.classList.remove('active');
  });

  // remove active khỏi tất cả button
  document.querySelectorAll('.header__view-button').forEach((button) => {
    button.classList.remove('active');
  });

  // active section hiện tại
  document.getElementById(viewId).classList.add('active');

  // active button hiện tại
  buttonElement.classList.add('active');

  handleActiveView();
}

// Button
const monthView = document.getElementById('monthView');
const weekView = document.getElementById('weekView');
const dayView = document.getElementById('dayView');

prevBtn.addEventListener('click', () => {
  const activeView = getActiveView();

  if (activeView === monthView) {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  }

  if (activeView === weekView) {
    currentDate.setDate(currentDate.getDate() - 7);
  }

  if (activeView === dayView) {
    currentDate.setDate(currentDate.getDate() - 1);
  }
  reloadSchedule();
});

nextBtn.addEventListener('click', () => {
  const activeView = getActiveView();

  if (activeView === monthView) {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }

  if (activeView === weekView) {
    currentDate.setDate(currentDate.getDate() + 7);
  }

  if (activeView === dayView) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  reloadSchedule();
});

toDayBtn.addEventListener('click', () => {
  currentDate = new Date();
  reloadSchedule();
});

monthBtn.addEventListener('click', async () => {
  scheduleMonth = await getMonthData(currentDate);
  prefetchMonth();
  switchView('monthView', monthBtn);
});
weekBtn.addEventListener('click', async () => {
  scheduleWeek = await getWeekData(currentDate);
  prefetchWeek();
  switchView('weekView', weekBtn);
});
dayBtn.addEventListener('click', async () => {
  scheduleWeek = await getWeekData(currentDate);
  prefetchWeek();
  switchView('dayView', dayBtn);
});

// Frame Button
let isPinned = false;

pinBtn.addEventListener('click', async () => {
  if (!window.electronAPI?.pinWindow) {
    console.warn('electronAPI không có — hãy chạy app bằng npm start (Electron), không mở file HTML trực tiếp.');
    return;
  }

  isPinned = !isPinned;

  await window.electronAPI.pinWindow(isPinned);

  pinBtn.classList.toggle('active', isPinned);
});

closeBtn.addEventListener('click', () => {
  window.electronAPI.closeWindow();
});

// Scroll View
function scrollToActive(viewType) {
  let containerSelector = '';
  let activeSelector = '';

  switch (viewType) {
    case 'week':
      containerSelector = '.week-view__list';
      activeSelector = '.week-view__day.active';
      break;

    case 'day':
      containerSelector = '.day-view__list';
      activeSelector = '.schedule-item.active';
      break;

    default:
      return;
  }

  const container = document.querySelector(containerSelector);
  const activeEl = document.querySelector(activeSelector);

  if (!container || !activeEl) return;

  activeEl.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

// Handle
function handleActiveView() {
  const activeView = getActiveView();
  if (activeView === monthView) {
    renderMonthView();
  }

  if (activeView === weekView) {
    renderWeekView();
    requestAnimationFrame(() => {
      scrollToActive('week');
    });
  }

  if (activeView === dayView) {
    renderDayView(currentDate);
    requestAnimationFrame(() => {
      scrollToActive('day');
    });
  }
}

// Init
(async () => {
  await loadSchedule();
})();
