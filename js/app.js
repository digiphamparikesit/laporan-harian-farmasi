// =========================================================
// STATE
// =========================================================
let staffList = [];
let currentRoom = null;
let editingReportId = null;
let editingRoom = null;
let editingReportData = null;

const loginScreen = document.getElementById('loginScreen');
const formScreen = document.getElementById('formScreen');
const roomSelect = document.getElementById('roomSelect');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const reportForm = document.getElementById('reportForm');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const submitMessage = document.getElementById('submitMessage');
const logoutBtn = document.getElementById('logoutBtn');
const activeRoomBadge = document.getElementById('activeRoomBadge');
const loadingOverlay = document.getElementById('loadingOverlay');

const tabNav = document.getElementById('tabNav');
const tabInputBtn = document.getElementById('tabInputBtn');
const tabRecapBtn = document.getElementById('tabRecapBtn');
const recapScreen = document.getElementById('recapScreen');
const adminRoomFilterWrap = document.getElementById('adminRoomFilterWrap');
const adminRoomSelect = document.getElementById('adminRoomSelect');
const recapYear = document.getElementById('recapYear');
const recapMonth = document.getElementById('recapMonth');
const statCards = document.getElementById('statCards');
const chartTitle = document.getElementById('chartTitle');
const barChart = document.getElementById('barChart');
const adminTrendPanel = document.getElementById('adminTrendPanel');
const trendYearLabel = document.getElementById('trendYearLabel');
const lineChartLegend = document.getElementById('lineChartLegend');
const lineChart = document.getElementById('lineChart');
const dailyRoomLabel = document.getElementById('dailyRoomLabel');
const dailyCalendar = document.getElementById('dailyCalendar');
const reportModalOverlay = document.getElementById('reportModalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalActions = document.getElementById('modalActions');
const editFormContainer = document.getElementById('editFormContainer');
const editReportForm = document.getElementById('editReportForm');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editReportBtn = document.getElementById('editReportBtn');
const deleteReportBtn = document.getElementById('deleteReportBtn');
const exportExcelBtn = document.getElementById('exportExcelBtn');
const printPreviewBtn = document.getElementById('printPreviewBtn');

// =========================================================
// HELPER: panggil Apps Script
// =========================================================
async function callApi(payload) {
  showLoading(true);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Gagal menghubungi server: ' + err.message };
  } finally {
    showLoading(false);
  }
}

function showLoading(state) {
  loadingOverlay.classList.toggle('hidden', !state);
}

// =========================================================
// INIT
// =========================================================
function init() {
  Object.keys(ROOMS).forEach(function (roomKey) {
    const opt = document.createElement('option');
    opt.value = roomKey;
    opt.textContent = ROOMS[roomKey].fields.length === 0
      ? ROOMS[roomKey].label + ' (segera hadir)'
      : ROOMS[roomKey].label;
    if (ROOMS[roomKey].fields.length === 0) opt.disabled = true;
    roomSelect.appendChild(opt);
  });

  const adminOpt = document.createElement('option');
  adminOpt.value = ADMIN_ROOM;
  adminOpt.textContent = 'ADMIN (Lihat Semua Laporan)';
  roomSelect.appendChild(adminOpt);

  const savedRoom = sessionStorage.getItem('activeRoom');
  if (savedRoom && (ROOMS[savedRoom] || savedRoom === ADMIN_ROOM)) {
    currentRoom = savedRoom;
    showFormScreen();
  }
}

// =========================================================
// LOGIN
// =========================================================
loginBtn.addEventListener('click', async function () {
  const room = roomSelect.value;
  const password = passwordInput.value.trim();
  loginError.classList.add('hidden');

  if (!password) {
    loginError.textContent = 'Password wajib diisi.';
    loginError.classList.remove('hidden');
    return;
  }

  const result = await callApi({ action: 'login', room: room, password: password });

  if (result.success) {
    currentRoom = room;
    sessionStorage.setItem('activeRoom', room);
    passwordInput.value = '';
    showFormScreen();
  } else {
    loginError.textContent = result.message || 'Login gagal.';
    loginError.classList.remove('hidden');
  }
});

logoutBtn.addEventListener('click', function () {
  sessionStorage.removeItem('activeRoom');
  currentRoom = null;
  formScreen.classList.add('hidden');
  recapScreen.classList.add('hidden');
  tabNav.classList.add('hidden');
  tabInputBtn.classList.remove('hidden');
  adminRoomFilterWrap.classList.add('hidden');
  adminTrendPanel.classList.add('hidden');
  logoutBtn.classList.add('hidden');
  activeRoomBadge.classList.add('hidden');
  loginScreen.classList.remove('hidden');
});

// =========================================================
// TAMPILKAN LAYAR FORM
// =========================================================
async function showFormScreen() {
  if (currentRoom !== ADMIN_ROOM && !ROOMS[currentRoom]) {
    sessionStorage.removeItem('activeRoom');
    currentRoom = null;
    loginError.textContent = 'Sesi login sebelumnya sudah tidak berlaku (mungkin ada perubahan data ruangan). Silakan login ulang.';
    loginError.classList.remove('hidden');
    loginScreen.classList.remove('hidden');
    formScreen.classList.add('hidden');
    recapScreen.classList.add('hidden');
    tabNav.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    activeRoomBadge.classList.add('hidden');
    return;
  }

  loginScreen.classList.add('hidden');
  recapScreen.classList.add('hidden');
  logoutBtn.classList.remove('hidden');
  activeRoomBadge.classList.remove('hidden');
  tabNav.classList.remove('hidden');

  if (currentRoom === ADMIN_ROOM) {
    activeRoomBadge.textContent = 'ADMIN';
    formScreen.classList.add('hidden');
    tabInputBtn.classList.add('hidden');
    adminRoomFilterWrap.classList.remove('hidden');
    adminTrendPanel.classList.remove('hidden');

    if (adminRoomSelect.options.length === 0) {
      RECAP_ROOM_LIST.forEach(function (roomKey) {
        const opt = document.createElement('option');
        opt.value = roomKey;
        opt.textContent = ROOMS[roomKey].label;
        adminRoomSelect.appendChild(opt);
      });
      adminRoomSelect.addEventListener('change', loadRecap);
    }

    setActiveTab('recap');
    if (recapYear.options.length === 0) initRecapFilters();
    loadRecap();
    return;
  }

  tabInputBtn.classList.remove('hidden');
  adminRoomFilterWrap.classList.add('hidden');
  adminTrendPanel.classList.add('hidden');
  formScreen.classList.remove('hidden');
  activeRoomBadge.textContent = ROOMS[currentRoom].label;
  formTitle.textContent = 'Input Laporan - ' + ROOMS[currentRoom].label;

  setActiveTab('input');

  if (staffList.length === 0) {
    const staffResult = await callApi({ action: 'getStaff' });
    if (staffResult.success) staffList = staffResult.staff;
  }

  renderForm(currentRoom);
}

// =========================================================
// RENDER FORM DINAMIS
// =========================================================
function buildFieldGroup(field) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group' + (field.type === 'textarea' ? ' form-group-full' : '');

  const label = document.createElement('label');
  label.className = 'field-label';
  label.textContent = field.label;
  label.setAttribute('for', 'f_' + field.key);
  wrapper.appendChild(label);

  let inputEl;

  if (field.type === 'date') {
    inputEl = document.createElement('input');
    inputEl.type = 'date';
  } else if (field.type === 'number') {
    inputEl = document.createElement('input');
    inputEl.type = 'number';
    inputEl.min = '0';
    inputEl.inputMode = 'numeric';
  } else if (field.type === 'time') {
    inputEl = document.createElement('input');
    inputEl.type = 'time';
  } else if (field.type === 'textarea') {
    inputEl = document.createElement('textarea');
    inputEl.rows = 3;
    inputEl.placeholder = 'Tulis daftar/catatan di sini...';
  } else if (field.type === 'select') {
    inputEl = document.createElement('select');
    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = '-- Pilih --';
    inputEl.appendChild(emptyOpt);
    (field.options || []).forEach(function (opt) {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt;
      inputEl.appendChild(o);
    });
  } else if (field.type === 'staff') {
    inputEl = document.createElement('select');
    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = '-- Pilih Petugas --';
    inputEl.appendChild(emptyOpt);
    staffList.forEach(function (s) {
      const o = document.createElement('option');
      o.value = s.nama;
      o.textContent = s.nama + (s.nip ? ' (' + s.nip + ')' : '');
      inputEl.appendChild(o);
    });
  } else {
    inputEl = document.createElement('input');
    inputEl.type = 'text';
  }

  inputEl.className = 'input';
  inputEl.id = 'f_' + field.key;
  inputEl.dataset.key = field.key;
  wrapper.appendChild(inputEl);
  return wrapper;
}

function groupLabel(label) {
  return label.replace(/\s+\d+$/, '').trim();
}

function renderForm(roomKey) {
  reportForm.innerHTML = '';
  const fields = ROOMS[roomKey].fields;

  const columnsWrap = document.createElement('div');
  columnsWrap.className = 'form-columns';

  const leftCol = document.createElement('div');
  leftCol.className = 'form-col form-col-left';

  const rightCol = document.createElement('div');
  rightCol.className = 'form-col form-col-right';

  const metaFields = fields.filter(function (f) { return f.type === 'date' || f.type === 'select'; });
  const staffFields = fields.filter(function (f) { return f.type === 'staff'; });
  const otherFields = fields.filter(function (f) {
    return f.type !== 'date' && f.type !== 'select' && f.type !== 'staff';
  });

  metaFields.forEach(function (f) { leftCol.appendChild(buildFieldGroup(f)); });

  if (staffFields.length) {
    const groups = {};
    const groupOrder = [];
    staffFields.forEach(function (f) {
      const g = groupLabel(f.label);
      if (!groups[g]) { groups[g] = []; groupOrder.push(g); }
      groups[g].push(f);
    });

    const staffColumns = ROOMS[roomKey].staffColumns || 2;
    const staffWrap = document.createElement('div');
    staffWrap.className = 'staff-section';

    groupOrder.forEach(function (g) {
      if (groupOrder.length > 1) {
        const heading = document.createElement('div');
        heading.className = 'staff-group-title';
        heading.textContent = g;
        staffWrap.appendChild(heading);
      }
      const grid = document.createElement('div');
      grid.className = 'staff-grid';
      grid.style.gridTemplateColumns = 'repeat(' + staffColumns + ', 1fr)';
      groups[g].forEach(function (f) { grid.appendChild(buildFieldGroup(f)); });
      staffWrap.appendChild(grid);
    });

    leftCol.appendChild(staffWrap);
  }

  otherFields.forEach(function (f) { rightCol.appendChild(buildFieldGroup(f)); });

  columnsWrap.appendChild(leftCol);
  columnsWrap.appendChild(rightCol);
  reportForm.appendChild(columnsWrap);
}

// =========================================================
// SUBMIT LAPORAN
// =========================================================
submitBtn.addEventListener('click', async function () {
  submitMessage.classList.add('hidden');
  const fields = ROOMS[currentRoom].fields;
  const data = {};
  let missingRequired = null;

  fields.forEach(function (field) {
    const el = document.getElementById('f_' + field.key);
    data[field.key] = el.value;
    if ((field.type === 'date' || field.key.indexOf('JADWAL') === 0 || field.key.indexOf('JADWAL') > -1) && !el.value && !missingRequired) {
      missingRequired = field.label;
    }
  });

  if (missingRequired) {
    submitMessage.textContent = 'Mohon lengkapi: ' + missingRequired;
    submitMessage.className = 'error-text';
    submitMessage.classList.remove('hidden');
    return;
  }

  const result = await callApi({ action: 'submitReport', room: currentRoom, data: data });

  if (result.success) {
    submitMessage.textContent = 'Laporan berhasil disimpan.';
    submitMessage.className = 'success-text';
    submitMessage.classList.remove('hidden');
    renderForm(currentRoom);
  } else {
    submitMessage.textContent = result.message || 'Gagal menyimpan laporan.';
    submitMessage.className = 'error-text';
    submitMessage.classList.remove('hidden');
  }
});

init();

// =========================================================
// TAB NAVIGASI
// =========================================================
function setActiveTab(tab) {
  if (tab === 'input') {
    tabInputBtn.classList.add('active');
    tabRecapBtn.classList.remove('active');
    formScreen.classList.remove('hidden');
    recapScreen.classList.add('hidden');
  } else {
    tabRecapBtn.classList.add('active');
    tabInputBtn.classList.remove('active');
    formScreen.classList.add('hidden');
    recapScreen.classList.remove('hidden');
  }
}

tabInputBtn.addEventListener('click', function () { setActiveTab('input'); });

tabRecapBtn.addEventListener('click', function () {
  setActiveTab('recap');
  if (recapYear.options.length === 0) initRecapFilters();
  loadRecap();
});

// =========================================================
// FILTER TAHUN & BULAN
// =========================================================
function initRecapFilters() {
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 1; y++) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    if (y === currentYear) opt.selected = true;
    recapYear.appendChild(opt);
  }

  MONTHS_ID.forEach(function (m, idx) {
    const opt = document.createElement('option');
    opt.value = idx + 1;
    opt.textContent = m;
    recapMonth.appendChild(opt);
  });
}

recapYear.addEventListener('change', loadRecap);
recapMonth.addEventListener('change', loadRecap);

// =========================================================
// AMBIL DATA REKAP
// =========================================================
function getTargetRoom() {
  return currentRoom === ADMIN_ROOM ? adminRoomSelect.value : currentRoom;
}

async function loadRecap() {
  const room = getTargetRoom();
  if (!room) return;

  chartTitle.textContent = 'Grafik Nilai Pelayanan - ' + ROOMS[room].label;

  const result = await callApi({
    action: 'getRecap',
    room: room,
    tahun: recapYear.value,
    bulan: recapMonth.value
  });

  if (!result.success) {
    statCards.innerHTML = '<p class="error-text">' + (result.message || 'Gagal memuat rekap.') + '</p>';
    barChart.innerHTML = '';
    return;
  }

  const numericFields = ROOMS[room].fields.filter(function (f) { return f.type === 'number'; });
  renderStatCards(numericFields, result.data);
  renderBarChart(numericFields, result.data);

  loadDailyStatus(room);

  if (currentRoom === ADMIN_ROOM) {
    loadTrend();
  }
}

function renderStatCards(fields, data) {
  statCards.innerHTML = '';
  fields.forEach(function (f) {
    const card = document.createElement('div');
    card.className = 'stat-card';

    const value = document.createElement('div');
    value.className = 'stat-value';
    value.textContent = (data[f.key] || 0).toLocaleString('id-ID');

    const label = document.createElement('div');
    label.className = 'stat-room';
    label.textContent = f.label;

    card.appendChild(value);
    card.appendChild(label);
    statCards.appendChild(card);
  });
}

function renderBarChart(fields, data) {
  barChart.innerHTML = '';
  const maxValue = Math.max(1, ...fields.map(function (f) { return data[f.key] || 0; }));

  fields.forEach(function (f) {
    const value = data[f.key] || 0;
    const pct = Math.round((value / maxValue) * 100);

    const row = document.createElement('div');
    row.className = 'bar-row';

    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = f.label;

    const track = document.createElement('div');
    track.className = 'bar-track';

    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.width = '0%';

    const valueLabel = document.createElement('span');
    valueLabel.className = 'bar-value';
    valueLabel.textContent = value.toLocaleString('id-ID');
    fill.appendChild(valueLabel);

    track.appendChild(fill);
    row.appendChild(label);
    row.appendChild(track);
    barChart.appendChild(row);

    requestAnimationFrame(function () { fill.style.width = pct + '%'; });
  });
}

// =========================================================
// GRAFIK TREN (ADMIN)
// =========================================================
async function loadTrend() {
  const tahun = recapYear.value;
  trendYearLabel.textContent = tahun;

  const result = await callApi({ action: 'getYearlyTrend', tahun: tahun });

  if (!result.success) {
    lineChart.innerHTML = '<p class="error-text">' + (result.message || 'Gagal memuat grafik tren.') + '</p>';
    lineChartLegend.innerHTML = '';
    return;
  }

  renderTrendLegend();
  renderTrendChart(result.data);
}

function renderTrendLegend() {
  lineChartLegend.innerHTML = '';
  RECAP_ROOM_LIST.forEach(function (roomKey) {
    const item = document.createElement('div');
    item.className = 'legend-item';

    const dot = document.createElement('span');
    dot.className = 'legend-dot';
    dot.style.background = ROOM_COLORS[roomKey];

    const label = document.createElement('span');
    label.textContent = ROOMS[roomKey].label;

    item.appendChild(dot);
    item.appendChild(label);
    lineChartLegend.appendChild(item);
  });
}

function renderTrendChart(data) {
  const width = 760;
  const height = 300;
  const padLeft = 44;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 32;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  let maxValue = 1;
  RECAP_ROOM_LIST.forEach(function (roomKey) {
    (data[roomKey] || []).forEach(function (v) { if (v > maxValue) maxValue = v; });
  });

  const xStep = innerW / 11;
  const xAt = function (i) { return padLeft + i * xStep; };
  const yAt = function (v) { return padTop + innerH - (v / maxValue) * innerH; };

  let svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" class="trend-svg" xmlns="http://www.w3.org/2000/svg">';

  [0, 0.25, 0.5, 0.75, 1].forEach(function (t) {
    const y = padTop + innerH - t * innerH;
    const val = Math.round(maxValue * t);
    svg += '<line x1="' + padLeft + '" y1="' + y + '" x2="' + (width - padRight) + '" y2="' + y + '" class="trend-grid-line" />';
    svg += '<text x="' + (padLeft - 8) + '" y="' + (y + 4) + '" class="trend-axis-label" text-anchor="end">' + val.toLocaleString('id-ID') + '</text>';
  });

  MONTHS_ID_SHORT.forEach(function (m, i) {
    svg += '<text x="' + xAt(i) + '" y="' + (height - 10) + '" class="trend-axis-label" text-anchor="middle">' + m + '</text>';
  });

  RECAP_ROOM_LIST.forEach(function (roomKey) {
    const values = data[roomKey] || new Array(12).fill(0);
    const color = ROOM_COLORS[roomKey];

    let points = '';
    values.forEach(function (v, i) {
      points += xAt(i) + ',' + yAt(v) + ' ';
    });

    svg += '<polyline points="' + points.trim() + '" class="trend-line" style="stroke:' + color + '" />';

    values.forEach(function (v, i) {
      svg += '<circle cx="' + xAt(i) + '" cy="' + yAt(v) + '" r="3.5" style="fill:' + color + '"><title>' +
        ROOMS[roomKey].label + ' - ' + MONTHS_ID_SHORT[i] + ': ' + v.toLocaleString('id-ID') +
        '</title></circle>';
    });
  });

  svg += '</svg>';
  lineChart.innerHTML = svg;
}

// =========================================================
// KELENGKAPAN LAPORAN PER TANGGAL
// =========================================================
async function loadDailyStatus(room) {
  dailyRoomLabel.textContent = ROOMS[room].label;

  const bulan = recapMonth.value;
  const tahun = recapYear.value;

  if (!bulan) {
    dailyCalendar.innerHTML = '<p class="error-text">Pilih Bulan tertentu di filter atas (bukan "Semua Bulan") untuk melihat kelengkapan laporan per tanggal.</p>';
    return;
  }

  const result = await callApi({
    action: 'getDailyStatus',
    room: room,
    bulan: bulan,
    tahun: tahun
  });

  if (!result.success) {
    dailyCalendar.innerHTML = '<p class="error-text">' + (result.message || 'Gagal memuat kelengkapan laporan.') + '</p>';
    return;
  }

  renderDailyCalendar(result.daysInMonth, result.data, Number(tahun), Number(bulan), room);
}

function renderDailyCalendar(daysInMonth, counts, tahun, bulanNum, room) {
  dailyCalendar.innerHTML = '';

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === tahun && (today.getMonth() + 1) === bulanNum;
  const todayDate = today.getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const jumlah = counts[d] || 0;
    const isFuture = isCurrentMonth ? d > todayDate : new Date(tahun, bulanNum - 1, d) > today;

    const box = document.createElement('div');
    box.className = 'day-box ' + (jumlah > 0 ? 'day-ok day-clickable' : (isFuture ? 'day-future' : 'day-missing'));

    const num = document.createElement('div');
    num.className = 'day-num';
    num.textContent = d;

    const info = document.createElement('div');
    info.className = 'day-info';
    info.textContent = jumlah > 0 ? (jumlah + ' laporan') : (isFuture ? '-' : 'kosong');

    box.appendChild(num);
    box.appendChild(info);

    if (jumlah > 0) {
      box.title = 'Klik untuk lihat detail laporan';
      box.addEventListener('click', function () {
        openDayReports(room, d, bulanNum, tahun);
      });
    }

    dailyCalendar.appendChild(box);
  }
}

// =========================================================
// POP-UP DETAIL LAPORAN
// =========================================================
modalCloseBtn.addEventListener('click', closeReportModal);
reportModalOverlay.addEventListener('click', function (e) {
  if (e.target === reportModalOverlay) closeReportModal();
});

function closeReportModal() {
  reportModalOverlay.classList.add('hidden');
  // Reset edit state
  editFormContainer.classList.add('hidden');
  modalActions.classList.add('hidden');
  modalBody.classList.remove('hidden');
  editingReportId = null;
  editingRoom = null;
  editingReportData = null;
}

async function openDayReports(room, day, bulanNum, tahun) {
  modalTitle.textContent = ROOMS[room].label + ' - ' + day + ' ' + MONTHS_ID[bulanNum - 1] + ' ' + tahun;
  modalBody.innerHTML = '<p class="card-subtitle">Memuat...</p>';
  reportModalOverlay.classList.remove('hidden');
  
  // Hide edit form initially
  editFormContainer.classList.add('hidden');
  modalActions.classList.add('hidden');
  modalBody.classList.remove('hidden');
  
  const result = await callApi({
    action: 'getDayReports',
    room: room,
    tanggal: day,
    bulan: bulanNum,
    tahun: tahun
  });

  if (!result.success) {
    modalBody.innerHTML = '<p class="error-text">' + (result.message || 'Gagal memuat detail laporan.') + '</p>';
    return;
  }

  if (result.reports.length === 0) {
    modalBody.innerHTML = '<p class="card-subtitle">Tidak ada laporan pada tanggal ini.</p>';
    return;
  }

  // Store room and reports for editing
  editingRoom = room;
  
  modalBody.innerHTML = '';
  result.reports.forEach(function(rep, idx) {
    const block = document.createElement('div');
    block.className = 'modal-report-block';
    
    const heading = document.createElement('div');
    heading.className = 'modal-report-heading';
    heading.textContent = 'Laporan ke-' + (idx + 1) + ' dari ' + result.reports.length;
    block.appendChild(heading);
    
    const table = document.createElement('div');
    table.className = 'modal-report-table';
    
    ROOMS[room].fields.forEach(function(f) {
      const val = rep[f.key];
      if (val === undefined || val === null || val === '') return;
      
      const row = document.createElement('div');
      row.className = 'modal-report-row';
      
      const label = document.createElement('span');
      label.className = 'modal-report-label';
      label.textContent = f.label;
      
      const value = document.createElement('span');
      value.className = 'modal-report-value';
      value.textContent = val;
      
      row.appendChild(label);
      row.appendChild(value);
      table.appendChild(row);
    });
    
    block.appendChild(table);
    modalBody.appendChild(block);
    
    // Store first report data for editing
    if (idx === 0) {
      editingReportData = rep;
      editingReportId = rep._id || rep.id || Date.now().toString();
    }
  });
  
  // Show edit/delete buttons
  modalActions.classList.remove('hidden');
}

// =========================================================
// EXPORT EXCEL (CSV dengan Total)
// =========================================================
exportExcelBtn.addEventListener('click', async function() {
  const room = getTargetRoom();
  if (!room) return;
  
  const bulan = recapMonth.value;
  const tahun = recapYear.value;
  
  const result = await callApi({
    action: 'getFullReport',
    room: room,
    tahun: tahun,
    bulan: bulan
  });
  
  if (!result.success) {
    alert('Gagal mengambil data: ' + result.message);
    return;
  }
  
  const fields = ROOMS[room].fields;
  
  // Headers: Tanggal, Shift, then all fields
  const headers = ['Tanggal', 'Shift', ...fields.map(f => f.label)];
  
  // Build rows
  const rows = [];
  const totals = {};
  fields.forEach(f => totals[f.key] = 0);
  
  // Sort by date
  const sortedData = (result.data || []).sort((a, b) => {
    return (a.tanggal || '').localeCompare(b.tanggal || '');
  });
  
  sortedData.forEach(item => {
    const row = [];
    row.push(item.tanggal || '-');
    row.push(item.shift || '-');
    fields.forEach(f => {
      const val = parseFloat(item[f.key]) || 0;
      row.push(val);
      totals[f.key] += val;
    });
    rows.push(row);
  });
  
  // Add totals row
  const totalRow = ['TOTAL', ''];
  fields.forEach(f => totalRow.push(totals[f.key]));
  rows.push(totalRow);
  
  // Create CSV content
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
  
  // Download with BOM for UTF-8
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const monthLabel = bulan ? MONTHS_ID[bulan - 1] : 'semua';
  link.href = URL.createObjectURL(blob);
  link.download = `Laporan_${ROOMS[room].label}_${tahun}_${monthLabel}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
});

// =========================================================
// PRINT PREVIEW
// =========================================================
printPreviewBtn.addEventListener('click', function() {
  window.print();
});

// =========================================================
// EDIT LAPORAN
// =========================================================
editReportBtn.addEventListener('click', function() {
  // Hide detail, show edit form
  modalBody.classList.add('hidden');
  modalActions.classList.add('hidden');
  editFormContainer.classList.remove('hidden');
  
  // Populate form with existing data
  const fields = ROOMS[editingRoom].fields;
  editReportForm.innerHTML = '';
  
  // Build edit form with 2 columns layout
  const columnsWrap = document.createElement('div');
  columnsWrap.className = 'form-columns';
  
  const leftCol = document.createElement('div');
  leftCol.className = 'form-col form-col-left';
  
  const rightCol = document.createElement('div');
  rightCol.className = 'form-col form-col-right';
  
  // Split fields
  const metaFields = fields.filter(f => f.type === 'date' || f.type === 'select');
  const staffFields = fields.filter(f => f.type === 'staff');
  const otherFields = fields.filter(f => f.type !== 'date' && f.type !== 'select' && f.type !== 'staff');
  
  metaFields.forEach(f => {
    const wrapper = buildEditFieldGroup(f);
    leftCol.appendChild(wrapper);
  });
  
  // Staff fields
  if (staffFields.length) {
    const groups = {};
    const groupOrder = [];
    staffFields.forEach(function (f) {
      const g = groupLabel(f.label);
      if (!groups[g]) { groups[g] = []; groupOrder.push(g); }
      groups[g].push(f);
    });
    
    const staffColumns = ROOMS[editingRoom].staffColumns || 2;
    const staffWrap = document.createElement('div');
    staffWrap.className = 'staff-section';
    
    groupOrder.forEach(function (g) {
      if (groupOrder.length > 1) {
        const heading = document.createElement('div');
        heading.className = 'staff-group-title';
        heading.textContent = g;
        staffWrap.appendChild(heading);
      }
      const grid = document.createElement('div');
      grid.className = 'staff-grid';
      grid.style.gridTemplateColumns = 'repeat(' + staffColumns + ', 1fr)';
      groups[g].forEach(function (f) { 
        grid.appendChild(buildEditFieldGroup(f)); 
      });
      staffWrap.appendChild(grid);
    });
    
    leftCol.appendChild(staffWrap);
  }
  
  otherFields.forEach(f => {
    rightCol.appendChild(buildEditFieldGroup(f));
  });
  
  columnsWrap.appendChild(leftCol);
  columnsWrap.appendChild(rightCol);
  editReportForm.appendChild(columnsWrap);
  
  saveEditBtn.dataset.reportId = editingReportId;
});

function buildEditFieldGroup(field) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group' + (field.type === 'textarea' ? ' form-group-full' : '');
  
  const label = document.createElement('label');
  label.className = 'field-label';
  label.textContent = field.label;
  label.setAttribute('for', 'edit_f_' + field.key);
  wrapper.appendChild(label);
  
  let inputEl;
  
  if (field.type === 'date') {
    inputEl = document.createElement('input');
    inputEl.type = 'date';
  } else if (field.type === 'number') {
    inputEl = document.createElement('input');
    inputEl.type = 'number';
    inputEl.min = '0';
    inputEl.inputMode = 'numeric';
  } else if (field.type === 'time') {
    inputEl = document.createElement('input');
    inputEl.type = 'time';
  } else if (field.type === 'textarea') {
    inputEl = document.createElement('textarea');
    inputEl.rows = 2;
    inputEl.placeholder = 'Tulis daftar/catatan di sini...';
  } else if (field.type === 'select') {
    inputEl = document.createElement('select');
    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = '-- Pilih --';
    inputEl.appendChild(emptyOpt);
    (field.options || []).forEach(function (opt) {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt;
      inputEl.appendChild(o);
    });
  } else if (field.type === 'staff') {
    inputEl = document.createElement('select');
    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = '-- Pilih Petugas --';
    inputEl.appendChild(emptyOpt);
    staffList.forEach(function (s) {
      const o = document.createElement('option');
      o.value = s.nama;
      o.textContent = s.nama + (s.nip ? ' (' + s.nip + ')' : '');
      inputEl.appendChild(o);
    });
  } else {
    inputEl = document.createElement('input');
    inputEl.type = 'text';
  }
  
  inputEl.className = 'input';
  inputEl.id = 'edit_f_' + field.key;
  
  // Set value from editingReportData
  if (editingReportData && editingReportData[field.key] !== undefined) {
    inputEl.value = editingReportData[field.key];
  }
  
  wrapper.appendChild(inputEl);
  return wrapper;
}

// =========================================================
// CANCEL EDIT
// =========================================================
cancelEditBtn.addEventListener('click', function() {
  editFormContainer.classList.add('hidden');
  modalBody.classList.remove('hidden');
  modalActions.classList.remove('hidden');
});

// =========================================================
// SAVE EDIT
// =========================================================
saveEditBtn.addEventListener('click', async function() {
  const reportId = this.dataset.reportId;
  if (!reportId || !editingRoom) {
    alert('Error: Data laporan tidak ditemukan.');
    return;
  }
  
  const fields = ROOMS[editingRoom].fields;
  const data = {};
  let missingRequired = null;
  
  fields.forEach(f => {
    const el = document.getElementById('edit_f_' + f.key);
    if (el) {
      data[f.key] = el.value;
      if ((f.type === 'date' || f.key.indexOf('JADWAL') === 0) && !el.value && !missingRequired) {
        missingRequired = f.label;
      }
    }
  });
  
  if (missingRequired) {
    alert('Mohon lengkapi: ' + missingRequired);
    return;
  }
  
  const result = await callApi({
    action: 'updateReport',
    reportId: reportId,
    room: editingRoom,
    data: data
  });
  
  if (result.success) {
    alert('Laporan berhasil diperbarui!');
    closeReportModal();
    loadRecap();
  } else {
    alert('Gagal update: ' + (result.message || 'Terjadi kesalahan.'));
  }
});

// =========================================================
// DELETE LAPORAN
// =========================================================
deleteReportBtn.addEventListener('click', async function() {
  if (!editingReportId || !editingRoom) {
    alert('Error: Data laporan tidak ditemukan.');
    return;
  }
  
  if (!confirm('Yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.')) return;
  
  const result = await callApi({
    action: 'deleteReport',
    reportId: editingReportId,
    room: editingRoom
  });
  
  if (result.success) {
    alert('Laporan berhasil dihapus!');
    closeReportModal();
    loadRecap();
  } else {
    alert('Gagal hapus: ' + (result.message || 'Terjadi kesalahan.'));
  }
});
