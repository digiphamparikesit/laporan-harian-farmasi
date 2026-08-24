// =========================================================
// STATE
// =========================================================
let staffList = [];
let currentRoom = null;
let editingReportId = null;
let editingRoom = null;
let editingReportData = null;
let roomPasswords = {}; // Cache password dari server

// =========================================================
// AMBIL ELEMEN DOM
// =========================================================
const roomSelect = document.getElementById('roomSelect');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const activeRoomBadge = document.getElementById('activeRoomBadge');
const formScreen = document.getElementById('formScreen');
const loginScreen = document.getElementById('loginScreen');
const recapScreen = document.getElementById('recapScreen');
const tabNav = document.getElementById('tabNav');
const tabInputBtn = document.getElementById('tabInputBtn');
const tabRecapBtn = document.getElementById('tabRecapBtn');
const submitBtn = document.getElementById('submitBtn');
const submitMessage = document.getElementById('submitMessage');
const reportForm = document.getElementById('reportForm');

// =========================================================
// HELPER: Tampilkan / Sembunyikan Loading Overlay
// =========================================================
function showLoading(isLoading) {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    if (isLoading) {
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }
}

// =========================================================
// HELPER: panggil Apps Script
// =========================================================
async function callApi(payload) {
  showLoading(true);
  try {
    console.log('📡 CALL API:', payload.action, '->', API_URL);
    
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      console.error('❌ API Response Error:', res.status, res.statusText);
      return { 
        success: false, 
        message: `Server error: ${res.status} - ${res.statusText}` 
      };
    }
    
    const result = await res.json();
    console.log('✅ API Response:', result);
    return result;
  } catch (err) {
    console.error('❌ API Call Error:', err);
    return { 
      success: false, 
      message: 'Gagal menghubungi server: ' + err.message 
    };
  } finally {
    showLoading(false);
  }
}

// =========================================================
// AMBIL PASSWORD DARI SERVER
// =========================================================
async function loadPasswords() {
  try {
    const result = await callApi({ action: 'getPasswords' });
    if (result.success) {
      roomPasswords = result.passwords;
      console.log('✅ Password loaded:', Object.keys(roomPasswords));
      return true;
    } else {
      console.error('❌ Gagal load password:', result.message);
      return false;
    }
  } catch (e) {
    console.error('❌ Error load password:', e);
    return false;
  }
}

// =========================================================
// AMBIL DAFTAR STAFF DARI SERVER (BARU)
// =========================================================
async function loadStaff() {
  const result = await callApi({ action: 'getStaff' });
  if (result.success) {
    staffList = result.staff;
    console.log('✅ Staff loaded:', staffList.length);
    // Jika sedang di form, render ulang agar staff muncul
    if (currentRoom && currentRoom !== ADMIN_ROOM) {
      renderForm(currentRoom);
    }
  } else {
    console.error('❌ Gagal load staff:', result.message);
  }
}

// =========================================================
// ISI DROPDOWN TAHUN & BULAN DI REKAP (BARU)
// =========================================================
function populateFilters() {
  const recapYear = document.getElementById('recapYear');
  const recapMonth = document.getElementById('recapMonth');

  if (recapYear) {
    recapYear.innerHTML = '';
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 5; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      recapYear.appendChild(opt);
    }
  }

  if (recapMonth) {
    recapMonth.innerHTML = '<option value="">Semua Bulan</option>';
    MONTHS_ID.forEach((month, index) => {
      const opt = document.createElement('option');
      opt.value = index + 1;
      opt.textContent = month;
      recapMonth.appendChild(opt);
    });
  }
}

// =========================================================
// FUNGSI VALIDASI RUANGAN
// =========================================================
function isValidRoom(roomKey) {
  if (!roomKey) return false;
  if (roomKey === ADMIN_ROOM) return true;
  return ROOMS.hasOwnProperty(roomKey);
}

// =========================================================
// TAMPILKAN FORM (SETELAH LOGIN BERHASIL)
// =========================================================
function showFormScreen() {
  loginScreen.classList.add('hidden');
  formScreen.classList.remove('hidden');
  recapScreen.classList.add('hidden');
  
  if (currentRoom && currentRoom !== ADMIN_ROOM) {
    activeRoomBadge.textContent = ROOMS[currentRoom].label;
    activeRoomBadge.classList.remove('hidden');
  } else if (currentRoom === ADMIN_ROOM) {
    activeRoomBadge.textContent = 'ADMIN';
    activeRoomBadge.classList.remove('hidden');
  }
  
  logoutBtn.classList.remove('hidden');
  
  if (tabNav) tabNav.classList.remove('hidden');

  if (currentRoom && currentRoom !== ADMIN_ROOM) {
    tabInputBtn.classList.add('active');
    tabRecapBtn.classList.remove('active');
    formScreen.classList.remove('hidden');
    recapScreen.classList.add('hidden');
    renderForm(currentRoom);
  } else {
    tabRecapBtn.classList.add('active');
    tabInputBtn.classList.remove('active');
    formScreen.classList.add('hidden');
    recapScreen.classList.remove('hidden');
    showRecapScreen();
  }

  const formTitle = document.getElementById('formTitle');
  if (formTitle) {
    formTitle.textContent = ROOMS[currentRoom] ? ROOMS[currentRoom].label : 'Input Laporan';
  }

  console.log('✅ Form ditampilkan untuk:', currentRoom);
}

// =========================================================
// RENDER FORM
// =========================================================
function renderForm(roomKey) {
  const room = ROOMS[roomKey];
  if (!room) return;

  reportForm.innerHTML = '';

  room.fields.forEach(function (field) {
    const label = document.createElement('label');
    label.className = 'field-label';
    label.textContent = field.label;
    reportForm.appendChild(label);

    let input;
    if (field.type === 'select') {
      input = document.createElement('select');
      input.className = 'input';
      input.name = field.key;
      field.options.forEach(function (opt) {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        input.appendChild(option);
      });
    } else if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.className = 'input';
      input.name = field.key;
      input.rows = 3;
    } else if (field.type === 'date') {
      input = document.createElement('input');
      input.className = 'input';
      input.type = 'date';
      input.name = field.key;
    } else if (field.type === 'staff') {
      input = document.createElement('select');
      input.className = 'input';
      input.name = field.key;
      input.innerHTML = '<option value="">-- Pilih Staff --</option>';
      staffList.forEach(function (staff) {
        const option = document.createElement('option');
        option.value = staff.nama;
        option.textContent = staff.nama;
        input.appendChild(option);
      });
    } else {
      input = document.createElement('input');
      input.className = 'input';
      input.type = 'number';
      input.name = field.key;
    }

    if (field.type !== 'select' && field.type !== 'staff') {
      input.placeholder = field.label;
    }

    reportForm.appendChild(input);
  });
}

// =========================================================
// TAMPILKAN REKAP
// =========================================================
function showRecapScreen() {
  console.log('📊 Menampilkan layar rekap');
  // Pastikan filter terisi
  populateFilters();
  // Di sini Anda bisa menambahkan logika pemanggilan API getYearlyTrend, dll
}

// =========================================================
// LOGOUT
// =========================================================
function handleLogout() {
  currentRoom = null;
  sessionStorage.removeItem('activeRoom');
  loginScreen.classList.remove('hidden');
  formScreen.classList.add('hidden');
  recapScreen.classList.add('hidden');
  logoutBtn.classList.add('hidden');
  activeRoomBadge.classList.add('hidden');
  if (tabNav) tabNav.classList.add('hidden');
  passwordInput.value = '';
  console.log('🚪 Logout berhasil');
}

// =========================================================
// EVENT LISTENER
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

  if (room !== ADMIN_ROOM && !ROOMS[room]) {
    loginError.textContent = 'Ruangan tidak ditemukan.';
    loginError.classList.remove('hidden');
    return;
  }

  if (Object.keys(roomPasswords).length === 0) {
    await loadPasswords();
  }

  const correctPassword = roomPasswords[room];

  if (correctPassword && password === correctPassword) {
    currentRoom = room;
    sessionStorage.setItem('activeRoom', room);
    passwordInput.value = '';
    loginError.classList.add('hidden');
    showFormScreen();
    return;
  }

  const result = await callApi({ action: 'login', room: room, password: password });

  if (result.success) {
    currentRoom = room;
    sessionStorage.setItem('activeRoom', room);
    passwordInput.value = '';
    loginError.classList.add('hidden');
    showFormScreen();
  } else {
    loginError.textContent = result.message || 'Password salah. Silakan coba lagi.';
    loginError.classList.remove('hidden');
  }
});

logoutBtn.addEventListener('click', handleLogout);

if (tabInputBtn) {
  tabInputBtn.addEventListener('click', function () {
    if (currentRoom && currentRoom !== ADMIN_ROOM) {
      formScreen.classList.remove('hidden');
      recapScreen.classList.add('hidden');
      tabInputBtn.classList.add('active');
      tabRecapBtn.classList.remove('active');
    }
  });
}

if (tabRecapBtn) {
  tabRecapBtn.addEventListener('click', function () {
    recapScreen.classList.remove('hidden');
    formScreen.classList.add('hidden');
    tabRecapBtn.classList.add('active');
    tabInputBtn.classList.remove('active');
    showRecapScreen();
  });
}

// =========================================================
// INIT - ISIAN DROPDOWN
// =========================================================
function init() {
  console.log('🚀 INIT: Memulai aplikasi...');
  
  if (!roomSelect) {
    console.error('❌ Elemen #roomSelect tidak ditemukan!');
    return;
  }
  
  roomSelect.innerHTML = '';
  
  Object.keys(ROOMS).forEach(function (roomKey) {
    const opt = document.createElement('option');
    opt.value = roomKey;
    opt.textContent = ROOMS[roomKey].label;
    roomSelect.appendChild(opt);
  });

  const adminOpt = document.createElement('option');
  adminOpt.value = ADMIN_ROOM;
  adminOpt.textContent = 'ADMIN (Lihat Semua Laporan)';
  roomSelect.appendChild(adminOpt);

  // Load passwords, staff, dan filter
  loadPasswords();
  loadStaff();
  populateFilters();

  const savedRoom = sessionStorage.getItem('activeRoom');
  if (savedRoom && isValidRoom(savedRoom)) {
    currentRoom = savedRoom;
    showFormScreen();
  }
}

// =========================================================
// PANGGIL INIT SAAT DOM READY
// =========================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
