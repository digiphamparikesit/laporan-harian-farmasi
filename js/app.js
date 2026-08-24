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
// Pastikan elemen diambil setelah DOM siap
const roomSelect = document.getElementById('roomSelect');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const activeRoomBadge = document.getElementById('activeRoomBadge');
const formScreen = document.getElementById('formScreen');
const loginScreen = document.getElementById('loginScreen');
const recapScreen = document.getElementById('recapScreen');
// ... (dan elemen lainnya jika ada)

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
// INIT - ISIAN DROPDOWN
// =========================================================
function init() {
  console.log('🚀 INIT: Memulai aplikasi...');
  
  // Pastikan roomSelect ada
  if (!roomSelect) {
    console.error('❌ Elemen #roomSelect tidak ditemukan!');
    return;
  }
  
  // Kosongkan dropdown terlebih dahulu (jika ada isi lama)
  roomSelect.innerHTML = '';
  
  // Populate room select dari ROOMS
  Object.keys(ROOMS).forEach(function (roomKey) {
    const opt = document.createElement('option');
    opt.value = roomKey;
    opt.textContent = ROOMS[roomKey].label;
    roomSelect.appendChild(opt);
  });

  // Tambahkan opsi ADMIN
  const adminOpt = document.createElement('option');
  adminOpt.value = ADMIN_ROOM;
  adminOpt.textContent = 'ADMIN (Lihat Semua Laporan)';
  roomSelect.appendChild(adminOpt);

  // Load passwords dari server
  loadPasswords();

  // Cek session
  const savedRoom = sessionStorage.getItem('activeRoom');
  if (savedRoom && isValidRoom(savedRoom)) {
    currentRoom = savedRoom;
    showFormScreen();
  }
}

// =========================================================
// LOGIN - CEK PASSWORD DARI SERVER
// =========================================================
loginBtn.addEventListener('click', async function () {
  const room = roomSelect.value;
  const password = passwordInput.value.trim();
  loginError.classList.add('hidden');

  console.log('🔑 Login attempt - Room:', room);

  if (!password) {
    loginError.textContent = 'Password wajib diisi.';
    loginError.classList.remove('hidden');
    return;
  }

  // VALIDASI: cek ruangan
  if (room !== ADMIN_ROOM && !ROOMS[room]) {
    loginError.textContent = 'Ruangan tidak ditemukan.';
    loginError.classList.remove('hidden');
    return;
  }

  // Pastikan password sudah di-load
  if (Object.keys(roomPasswords).length === 0) {
    await loadPasswords();
  }

  // Cek password dari cache
  const correctPassword = roomPasswords[room];
  console.log('🔑 Password untuk', room, ':', correctPassword ? 'ada' : 'tidak ada');

  if (correctPassword && password === correctPassword) {
    currentRoom = room;
    sessionStorage.setItem('activeRoom', room);
    passwordInput.value = '';
    loginError.classList.add('hidden');
    console.log('✅ Login berhasil:', room);
    showFormScreen();
    return;
  }

  // Jika password tidak cocok, coba ke server sebagai fallback
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

// =========================================================
// PANGGIL INIT SAAT DOM READY
// =========================================================
// Jika script diletakkan di akhir body, ini sudah aman, tapi tambahkan guard:
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM sudah siap, langsung panggil
  init();
}

// =========================================================
// FUNGSI LAINNYA (SAMA SEPERTI SEBELUMNYA)
// =========================================================
// ... semua fungsi lainnya tetap sama (logout, showFormScreen, renderForm, submit, dll) ...
