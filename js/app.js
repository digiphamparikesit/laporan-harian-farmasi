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
  logoutBtn.classList.remove('hidden');
  activeRoomBadge.classList.remove('hidden');
  activeRoomBadge.textContent = ROOMS[currentRoom].label;
  formTitle.textContent = 'Input Laporan - ' + ROOMS[currentRoom].label;

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

// Kolom KIRI: tanggal, jadwal shift, nama petugas (sticky - diam saat di-scroll)
// Kolom KANAN: semua field angka/jumlah (dari "Jumlah Resep Terlayani" dst)
function renderForm(roomKey) {
  reportForm.innerHTML = '';
  const fields = ROOMS[roomKey].fields;

  const columnsWrap = document.createElement('div');
  columnsWrap.className = 'form-columns';

  const leftCol = document.createElement('div');
  leftCol.className = 'form-col form-col-left';

  const rightCol = document.createElement('div');
  rightCol.className = 'form-col form-col-right';

  fields.forEach(function (field) {
    const group = buildFieldGroup(field);
    if (field.type === 'number') {
      rightCol.appendChild(group);
    } else {
      leftCol.appendChild(group);
    }
  });

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
