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

// Conver data

const schedule = [
  {
    date: '15/05/2026',
    total: 2,
    subjects: [
      {
        name: 'Trí tuệ nhân tạo',
        color: '#F5A623',
      },
      {
        name: 'Xử lý ảnh và thị giác máy tính',
        color: '#4A90E2',
      },
      {
        name: 'Xử lý ảnh và thị giác máy tính',
        color: '#9be24a',
      },
    ],
  },
  {
    date: '30/05/2026',
    total: 1,
    subjects: [
      {
        name: 'Xử lý ảnh và thị giác máy tính',
        color: '#4A90E2',
      },
      {
        name: 'Xử lý ảnh và thị giác máy tính',
        color: '#89e24a',
      },
      {
        name: 'Xử lý ảnh và thị giác máy tính',
        color: '#89e24a',
      },
      {
        name: 'Xử lý ảnh và thị giác máy tính',
        color: '#89e24a',
      },
    ],
  },
];

const scheduleMap = {};

schedule.forEach((item) => {
  scheduleMap[item.date] = item;
});

const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('monthViewDates');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const toDayBtn = document.getElementById('toDayBtn');

const monthBtn = document.getElementById('monthBtn');
const weekBtn = document.getElementById('weekBtn');
const dayBtn = document.getElementById('dayBtn');
let currentDate = new Date();

const updateCalendar = () => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const firstDay = new Date(currentYear, currentMonth, 0);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const totalDay = lastDay.getDate();
  const firstDayIndex = firstDay.getDay();

  const monthYearString = `${monthNames[currentMonth]}, ${currentYear}`;
  monthYearElement.textContent = monthYearString;

  let datesHTML = '';
  let totalCells = 0;

  for (let i = firstDayIndex; i > 0; i--) {
    const prevDate = new Date(currentYear, currentMonth, 0 - i + 1);
    datesHTML += `<button class = "month-view__date inactive">${prevDate.getDate()}</button>`;
    totalCells++;
  }

  for (let i = 1; i <= totalDay; i++) {
    const date = new Date(currentYear, currentMonth, i);
    const formattedDate = `${String(i).padStart(2, '0')}/` + `${String(currentMonth + 1).padStart(2, '0')}/` + currentYear;
    const activeClass = date.toDateString() === new Date().toDateString() ? 'active' : '';
    const scheduleItem = scheduleMap[formattedDate];
    const firstSubject = scheduleItem?.subjects?.[0];
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

  datesElement.innerHTML = datesHTML;

  console.log({
    firstDay,
    firstDayIndex,
    lastDay,
    totalDay,
  });
};

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
}

prevBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateCalendar();
});

nextBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateCalendar();
});

toDayBtn.addEventListener('click', () => {
  currentDate = new Date();
  updateCalendar();
});

monthBtn.addEventListener('click', () => {
  switchView('monthView', monthBtn);
});
weekBtn.addEventListener('click', () => {
  switchView('weekView', weekBtn);
});
dayBtn.addEventListener('click', () => {
  switchView('dayView', dayBtn);
});

updateCalendar();
