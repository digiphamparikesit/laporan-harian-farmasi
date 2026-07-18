// =========================================================
// STATE
// =========================================================
let staffList = [];
let currentRoom = null;

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
const recapYear = document.getElementById('recapYear');
const recapMonth = document.getElementById('recapMonth');
const statCards = document.getElementById('statCards');
const barChart = document.getElementById('barChart');

// =========================================================
// HELPER: panggil Apps Script (pakai text/plain agar tak kena preflight CORS)
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

  const savedRoom = sessionStorage.getItem('activeRoom');
  if (savedRoom && ROOMS[savedRoom]) {
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
  logoutBtn.classList.add('hidden');
  activeRoomBadge.classList.add('hidden');
  loginScreen.classList.remove('hidden');
});

// =========================================================
// TAMPILKAN LAYAR FORM
// =========================================================
async function showFormScreen() {
  loginScreen.classList.add('hidden');
  formScreen.classList.remove('hidden');
  recapScreen.classList.add('hidden');
  logoutBtn.classList.remove('hidden');
  activeRoomBadge.classList.remove('hidden');
  activeRoomBadge.textContent = ROOMS[currentRoom].label;
  formTitle.textContent = 'Input Laporan - ' + ROOMS[currentRoom].label;

  tabNav.classList.remove('hidden');
  setActiveTab('input');

  if (staffList.length === 0) {
    const staffResult = await callApi({ action: 'getStaff' });
    if (staffResult.success) staffList = staffResult.staff;
  }

  renderForm(currentRoom);
}

// =========================================================
// RENDER FORM DINAMIS SESUAI KONFIGURASI RUANGAN
// =========================================================
function buildFieldGroup(field) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group';

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

// Ambil nama grup dari label dengan menghapus angka urut di belakang
// contoh: "Petugas Pagi 1" -> "Petugas Pagi", "Petugas 1" -> "Petugas"
function groupLabel(label) {
  return label.replace(/\s+\d+$/, '').trim();
}

// Kolom KIRI: tanggal, jadwal shift (langsung), lalu field petugas
//   dikelompokkan jadi grid 2 kolom per sub-grup (mis. Pagi / Midel).
// Kolom KANAN: semua field angka/jumlah, disusun grid otomatis.
function renderForm(roomKey) {
  reportForm.innerHTML = '';
  const fields = ROOMS[roomKey].fields;

  const columnsWrap = document.createElement('div');
  columnsWrap.className = 'form-columns';

  const leftCol = document.createElement('div');
  leftCol.className = 'form-col form-col-left';

  const rightCol = document.createElement('div');
  rightCol.className = 'form-col form-col-right';

  const metaFields = fields.filter(function (f) { return f.type !== 'number' && f.type !== 'staff'; });
  const staffFields = fields.filter(function (f) { return f.type === 'staff'; });
  const numberFields = fields.filter(function (f) { return f.type === 'number'; });

  metaFields.forEach(function (f) { leftCol.appendChild(buildFieldGroup(f)); });

  if (staffFields.length) {
    const groups = {};
    const groupOrder = [];
    staffFields.forEach(function (f) {
      const g = groupLabel(f.label);
      if (!groups[g]) { groups[g] = []; groupOrder.push(g); }
      groups[g].push(f);
    });

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
      groups[g].forEach(function (f) { grid.appendChild(buildFieldGroup(f)); });
      staffWrap.appendChild(grid);
    });

    leftCol.appendChild(staffWrap);
  }

  numberFields.forEach(function (f) { rightCol.appendChild(buildFieldGroup(f)); });

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
    // Tanggal & Jadwal Shift wajib diisi
    if ((field.type === 'date' || field.key.indexOf('JADWAL') === 0 || field.key.indexOf('JADWAL') > -1) && !el.value && !missingRequired) {
      missingRequired = field.label;
    }
  });

  if (missingRequired) {
    submitMessage.textContent = 'Mohon lengkapi: ' + missingRequired;
    submitMessage.className = 'error-text';
    return;
  }

  const result = await callApi({ action: 'submitReport', room: currentRoom, data: data });

  if (result.success) {
    submitMessage.textContent = 'Laporan berhasil disimpan.';
    submitMessage.className = 'success-text';
    renderForm(currentRoom); // reset form
  } else {
    submitMessage.textContent = result.message || 'Gagal menyimpan laporan.';
    submitMessage.className = 'error-text';
  }
});

init();

// =========================================================
// TAB NAVIGASI (Input Laporan <-> Rekap Laporan)
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

  MONTHS_ID.forEach(function (m) {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    recapMonth.appendChild(opt);
  });
}

recapYear.addEventListener('change', loadRecap);
recapMonth.addEventListener('change', loadRecap);

// =========================================================
// AMBIL DATA REKAP & RENDER KARTU + GRAFIK
// =========================================================
async function loadRecap() {
  const result = await callApi({
    action: 'getRecap',
    tahun: recapYear.value,
    bulan: recapMonth.value
  });

  if (!result.success) {
    statCards.innerHTML = '<p class="error-text">' + (result.message || 'Gagal memuat rekap.') + '</p>';
    barChart.innerHTML = '';
    return;
  }

  renderStatCards(result.data);
  renderBarChart(result.data);
}

function renderStatCards(data) {
  statCards.innerHTML = '';
  RECAP_CONFIG.forEach(function (cfg) {
    const card = document.createElement('div');
    card.className = 'stat-card';

    const value = document.createElement('div');
    value.className = 'stat-value';
    value.textContent = (data[cfg.room] || 0).toLocaleString('id-ID');

    const label = document.createElement('div');
    label.className = 'stat-room';
    label.textContent = cfg.label;

    const metric = document.createElement('div');
    metric.className = 'stat-metric';
    metric.textContent = cfg.metricLabel;

    card.appendChild(value);
    card.appendChild(label);
    card.appendChild(metric);
    statCards.appendChild(card);
  });
}

function renderBarChart(data) {
  barChart.innerHTML = '';
  const maxValue = Math.max(1, ...RECAP_CONFIG.map(function (cfg) { return data[cfg.room] || 0; }));

  RECAP_CONFIG.forEach(function (cfg) {
    const value = data[cfg.room] || 0;
    const pct = Math.round((value / maxValue) * 100);

    const row = document.createElement('div');
    row.className = 'bar-row';

    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = cfg.label;

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
