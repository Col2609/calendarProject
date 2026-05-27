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

monthYearElement = document.getElementById('monthYear');
datesElement = document.getElementById('dates');
prevBtn = document.getElementById('prevBtn');
nextBtn = document.getElementById('nextBtn');
toDayBtn = document.getElementById('toDayBtn');
let currentDate = new Date();

const updateCalendar = () => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const firstDay = new Date(currentYear, currentMonth, 0);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const totalDay = lastDay.getDate();
  const firstDayIndex = firstDay.getDay();
  const lastDayIndex = lastDay.getDay();

  const monthYearString = `${monthNames[currentMonth]}, ${currentYear}`;
  monthYearElement.textContent = monthYearString;

  let datesHTML = '';
  let totalCells = 0;

  for (let i = firstDayIndex; i > 0; i--) {
    const prevDate = new Date(currentYear, currentMonth, 0 - i + 1);
    datesHTML += `<button class = "calendar__date inactive">${prevDate.getDate()}</button>`;
    totalCells++;
  }

  for (let i = 1; i <= totalDay; i++) {
    const date = new Date(currentYear, currentMonth, i);
    const activeClass = date.toDateString() === new Date().toDateString() ? 'active' : '';
    datesHTML += `<button class = "calendar__date ${activeClass}">${i}</button> `;
    totalCells++;
  }

  //   for (let i = 1; i <= 7 - lastDayIndex; i++) {
  //     const nextDate = new Date(currentYear, currentMonth + 1, i);
  //     datesHTML += `<button class = "calendar__date inactive">${nextDate.getDate()}</button>`;
  //   }

  const remainCells = 42 - totalCells;

  for (let i = 1; i <= remainCells; i++) {
    datesHTML += `
    <button class="calendar__date inactive">
      ${i}
    </button>
  `;
  }

  datesElement.innerHTML = datesHTML;

  console.log({
    firstDay,
    firstDayIndex,
    lastDay,
    lastDayIndex,
    totalDay,
  });
};

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

updateCalendar();
