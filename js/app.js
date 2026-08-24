// =========================================================
// STATE & DOM
// =========================================================
let staffList = [];
let currentRoom = null;
let editingReportId = null;
let editingRoom = null;
let editingReportData = null;
let roomPasswords = {};

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

// Elemen Rekap
const recapYear = document.getElementById('recapYear');
const recapMonth = document.getElementById('recapMonth');
const adminRoomSelect = document.getElementById('adminRoomSelect');
const exportExcelBtn = document.getElementById('exportExcelBtn');
const printPreviewBtn = document.getElementById('printPreviewBtn');
const statCards = document.getElementById('statCards');
const barChart = document.getElementById('barChart');
const dailyCalendar = document.getElementById('dailyCalendar');
const dailyRoomLabel = document.getElementById('dailyRoomLabel');
const trendYearLabel = document.getElementById('trendYearLabel');
const lineChart = document.getElementById('lineChart');
const lineChartLegend = document.getElementById('lineChartLegend');

// Elemen Modal (dari HTML)
const reportModalOverlay = document.getElementById('reportModalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalActions = document.getElementById('modalActions');
const editReportBtn = document.getElementById('editReportBtn');
const deleteReportBtn = document.getElementById('deleteReportBtn');
const editFormContainer = document.getElementById('editFormContainer');
const editReportForm = document.getElementById('editReportForm');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// =========================================================
// HELPER
// =========================================================
function showLoading(isLoading) {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.toggle('hidden', !isLoading);
}

async function callApi(payload) {
  showLoading(true);
  try {
    console.log('📡 CALL API:', payload.action);
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const result = await res.json();
    console.log('✅ API Response:', result);
    return result;
  } catch (err) {
    console.error('❌ API Call Error:', err);
    return { success: false, message: 'Gagal menghubungi server: ' + err.message };
  } finally {
    showLoading(false);
  }
}

async function loadPasswords() {
  const result = await callApi({ action: 'getPasswords' });
  if (result.success) roomPasswords = result.passwords;
}

async function loadStaff() {
  const result = await callApi({ action: 'getStaff' });
  if (result.success) {
    staffList = result.staff;
    if (currentRoom && currentRoom !== ADMIN_ROOM) renderForm(currentRoom);
  }
}

// =========================================================
// FORM LOGIC
// =========================================================
function isValidRoom(roomKey) {
  return roomKey === ADMIN_ROOM || ROOMS.hasOwnProperty(roomKey);
}

function renderForm(roomKey) {
  const room = ROOMS[roomKey];
  if (!room) return;

  reportForm.innerHTML = '';
  room.fields.forEach(field => {
    const label = document.createElement('label');
    label.className = 'field-label';
    label.textContent = field.label;
    reportForm.appendChild(label);

    let input;
    if (field.type === 'select') {
      input = document.createElement('select');
      input.className = 'input';
      input.name = field.key;
      field.options.forEach(opt => {
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
      staffList.forEach(staff => {
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

    reportForm.appendChild(input);
  });
}

function showFormScreen() {
  loginScreen.classList.add('hidden');
  logoutBtn.classList.remove('hidden');
  if (tabNav) tabNav.classList.remove('hidden');

  if (currentRoom && currentRoom !== ADMIN_ROOM) {
    // USER BIASA
    formScreen.classList.remove('hidden');
    recapScreen.classList.add('hidden');
    tabInputBtn.classList.add('active');
    tabRecapBtn.classList.remove('active');
    activeRoomBadge.textContent = ROOMS[currentRoom].label;
    activeRoomBadge.classList.remove('hidden');
    renderForm(currentRoom);
  } else {
    // ADMIN
    formScreen.classList.add('hidden');
    recapScreen.classList.remove('hidden');
    tabRecapBtn.classList.add('active');
    tabInputBtn.classList.remove('active');
    activeRoomBadge.textContent = 'ADMIN';
    activeRoomBadge.classList.remove('hidden');
    showRecapScreen();
  }
}

// =========================================================
// FILTER & RECAP LOGIC (DIPERBAIKI)
// =========================================================
// Fungsi ini HANYA dipanggil SEKALI saat init, agar tidak mereset pilihan user
function initFilters() {
  // Isi Tahun
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

  // Isi Bulan
  if (recapMonth) {
    recapMonth.innerHTML = '<option value="">Semua Bulan</option>';
    MONTHS_ID.forEach((month, i) => {
      const opt = document.createElement('option');
      opt.value = i + 1;
      opt.textContent = month;
      recapMonth.appendChild(opt);
    });
  }

  // Isi Dropdown Ruangan (Khusus Admin)
  if (adminRoomSelect) {
    adminRoomSelect.innerHTML = '';
    Object.keys(ROOMS).forEach(roomKey => {
      const opt = document.createElement('option');
      opt.value = roomKey;
      opt.textContent = ROOMS[roomKey].label;
      adminRoomSelect.appendChild(opt);
    });
  }
}

// Fungsi ini dipanggil setiap kali filter berubah / layar rekap dibuka
function refreshRecapData() {
  const tahun = recapYear.value;
  const bulan = recapMonth.value;

  // 1. Muat Kalender Harian
  if (currentRoom && currentRoom !== ADMIN_ROOM && bulan) {
    dailyRoomLabel.textContent = ROOMS[currentRoom].label;
    loadDailyCalendar(currentRoom, bulan, tahun);
  } else if (currentRoom === ADMIN_ROOM && adminRoomSelect.value && bulan) {
    dailyRoomLabel.textContent = ROOMS[adminRoomSelect.value].label;
    loadDailyCalendar(adminRoomSelect.value, bulan, tahun);
  } else {
    dailyCalendar.innerHTML = '<p style="padding:20px;text-align:center;">Pilih bulan untuk melihat kelengkapan laporan.</p>';
  }

  // 2. Muat Statistik & Grafik
  loadRecapData(tahun, bulan);
}

// Fungsi showRecapScreen hanya menampilkan elemen (tanpa mereset filter)
function showRecapScreen() {
  console.log('📊 Menampilkan layar rekap');
  refreshRecapData();
}

async function loadDailyCalendar(room, bulan, tahun) {
  const result = await callApi({ action: 'getDailyStatus', room: room, bulan: bulan, tahun: tahun });
  if (result.success) {
    dailyCalendar.innerHTML = '';
    for (let day = 1; day <= result.daysInMonth; day++) {
      const cell = document.createElement('div');
      const hasReport = result.data[day] > 0;
      cell.className = 'day-cell' + (hasReport ? ' has-report' : ' missing');
      cell.textContent = day;
      
      // Jika ada laporan, tambahkan event click untuk melihat detail
      if (hasReport) {
        cell.style.cursor = 'pointer';
        cell.addEventListener('click', function() {
          showDayReports(room, day, bulan, tahun);
        });
      }
      
      dailyCalendar.appendChild(cell);
    }
  }
}

async function loadRecapData(tahun, bulan) {
  // Ambil data rekap (untuk stat cards)
  const room = (currentRoom === ADMIN_ROOM && adminRoomSelect.value) ? adminRoomSelect.value : currentRoom;
  if (!room) return;

  const result = await callApi({ action: 'getRecap', room: room, bulan: bulan, tahun: tahun });
  if (result.success) {
    // Render Stat Cards
    statCards.innerHTML = '';
    for (const [key, value] of Object.entries(result.data)) {
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `<div class="stat-value">${value}</div><div class="stat-label">${key}</div>`;
      statCards.appendChild(card);
    }
  }

  // Ambil data tahunan untuk grafik (jika admin)
  if (currentRoom === ADMIN_ROOM) {
    const trendResult = await callApi({ action: 'getYearlyTrend', tahun: tahun });
    if (trendResult.success) {
      // Render Grafik Garis Sederhana
      lineChart.innerHTML = '';
      lineChartLegend.innerHTML = '';
      for (const [roomKey, data] of Object.entries(trendResult.data)) {
        const div = document.createElement('div');
        div.textContent = ROOMS[roomKey]?.label || roomKey;
        lineChartLegend.appendChild(div);
        // (Logika rendering grafik garis dengan CSS/Chart.js bisa ditambahkan di sini)
      }
    }
  }
}

// =========================================================
// MODAL DETAIL & EDIT LAPORAN (DIPERBAIKI)
// =========================================================
async function showDayReports(room, tanggal, bulan, tahun) {
  const result = await callApi({ action: 'getDayReports', room: room, tanggal: tanggal, bulan: bulan, tahun: tahun });
  if (!result.success) {
    alert('Gagal memuat data: ' + result.message);
    return;
  }

  // Tampilkan modal
  reportModalOverlay.classList.remove('hidden');
  modalTitle.textContent = `Laporan Tanggal ${tanggal}/${bulan}/${tahun}`;
  modalBody.innerHTML = '';
  modalActions.classList.add('hidden');
  editFormContainer.classList.add('hidden');
  
  if (result.reports.length === 0) {
    modalBody.innerHTML = '<p>Tidak ada laporan untuk tanggal ini.</p>';
    return;
  }

  // Daftar laporan
  result.reports.forEach((report, index) => {
    const reportDiv = document.createElement('div');
    reportDiv.className = 'report-item';
    reportDiv.innerHTML = `
      <div><strong>Shift: ${report.shift || '-'}</strong></div>
      <pre>${JSON.stringify(report, null, 2)}</pre>
    `;
    
    // Tombol edit untuk setiap laporan
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit Laporan Ini';
    editBtn.className = 'btn-warning';
    editBtn.style.marginTop = '10px';
    editBtn.onclick = function() {
      openEditModal(report);
    };
    
    reportDiv.appendChild(editBtn);
    modalBody.appendChild(reportDiv);
  });
}

function openEditModal(report) {
  // Sembunyikan daftar, tampilkan form edit
  modalBody.classList.add('hidden');
  modalActions.classList.add('hidden');
  editFormContainer.classList.remove('hidden');

  // Simpan data yang sedang diedit
  editingReportData = report;
  editingRoom = currentRoom; // atau room yang sesuai
  editingReportId = report._row; // baris spreadsheet

  // Render form edit sesuai field ruangan
  editReportForm.innerHTML = '';
  const room = ROOMS[editingRoom] || ROOMS[adminRoomSelect.value];
  if (!room) return;

  room.fields.forEach(field => {
    const label = document.createElement('label');
    label.className = 'field-label';
    label.textContent = field.label;
    editReportForm.appendChild(label);

    let input;
    if (field.type === 'select') {
      input = document.createElement('select');
      input.className = 'input';
      input.name = field.key;
      field.options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        input.appendChild(option);
      });
      // Set nilai saat ini
      input.value = report[field.key] || '';
    } else if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.className = 'input';
      input.name = field.key;
      input.value = report[field.key] || '';
    } else if (field.type === 'date') {
      input = document.createElement('input');
      input.className = 'input';
      input.type = 'date';
      input.name = field.key;
      input.value = report[field.key] || '';
    } else if (field.type === 'staff') {
      input = document.createElement('select');
      input.className = 'input';
      input.name = field.key;
      input.innerHTML = '<option value="">-- Pilih Staff --</option>';
      staffList.forEach(staff => {
        const option = document.createElement('option');
        option.value = staff.nama;
        option.textContent = staff.nama;
        input.appendChild(option);
      });
      input.value = report[field.key] || '';
    } else {
      input = document.createElement('input');
      input.className = 'input';
      input.type = 'number';
      input.name = field.key;
      input.value = report[field.key] || '';
    }

    editReportForm.appendChild(input);
  });

  // Gunakan onclick untuk menghindari penumpukan event listener
  saveEditBtn.onclick = saveEditedReport;
  cancelEditBtn.onclick = closeEditModal;
}

async function saveEditedReport() {
  if (!editingReportData || !editingRoom) return;
  
  // Ambil data dari form
  const formData = new FormData(editReportForm);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  // Panggil API update
  const result = await callApi({ 
    action: 'updateReport', 
    room: editingRoom, 
    row: editingReportId, 
    data: data,
    checkTanggal: editingReportData.tanggal // untuk validasi konflik
  });

  if (result.success) {
    alert('Laporan berhasil diperbarui!');
    closeEditModal();
    // Reload data
    const tahun = recapYear.value;
    const bulan = recapMonth.value;
    refreshRecapData();
  } else {
    alert('Gagal memperbarui: ' + result.message);
  }
}

function closeEditModal() {
  reportModalOverlay.classList.add('hidden');
  modalBody.classList.remove('hidden');
  editFormContainer.classList.add('hidden');
  editingReportId = null;
  editingReportData = null;
}

// =========================================================
// EXPORT EXCEL & CETAK PREVIEW
// =========================================================
async function exportToExcel() {
  const room = (currentRoom === ADMIN_ROOM && adminRoomSelect.value) ? adminRoomSelect.value : currentRoom;
  if (!room) {
    alert('Pilih ruangan terlebih dahulu!');
    return;
  }

  const tahun = recapYear.value;
  const bulan = recapMonth.value;

  // Panggil API getFullReport untuk mendapatkan data lengkap
  const result = await callApi({ action: 'getFullReport', room: room, bulan: bulan, tahun: tahun });

  if (!result.success || !result.data || result.data.length === 0) {
    alert('Tidak ada data untuk diekspor.');
    return;
  }

  // Buat header CSV (kolom tanggal, shift, dan semua field numerik)
  const headers = ['Tanggal', 'Shift'];
  const numericKeys = Object.keys(result.data[0]).filter(k => k !== 'tanggal' && k !== 'shift');
  numericKeys.forEach(k => headers.push(k));

  // Buat baris data
  const rows = result.data.map(item => {
    const row = [item.tanggal, item.shift];
    numericKeys.forEach(k => row.push(item[k] || 0));
    return row;
  });

  // Gabungkan menjadi CSV
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  // Download file CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Laporan_${ROOMS[room]?.label || room}_${tahun}_${bulan || 'semua'}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function printPreview() {
  const room = (currentRoom === ADMIN_ROOM && adminRoomSelect.value) ? adminRoomSelect.value : currentRoom;
  if (!room) {
    alert('Pilih ruangan terlebih dahulu!');
    return;
  }

  const tahun = recapYear.value;
  const bulan = recapMonth.value;

  // Panggil API getMonthlyReports untuk mendapatkan data yang lebih detail
  const result = await callApi({ action: 'getMonthlyReports', room: room, bulan: bulan, tahun: tahun });

  if (!result.success || !result.reports || result.reports.length === 0) {
    alert('Tidak ada data untuk dicetak.');
    return;
  }

  // Buat jendela baru untuk preview
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup diblokir. Izinkan popup untuk mencetak.');
    return;
  }

  // Buat HTML tabel
  let html = '<html><head><title>Preview Laporan</title>';
  html += '<style>body{font-family:Arial,sans-serif;padding:20px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ccc;padding:8px;font-size:12px;}th{background:#f0f0f0;}</style>';
  html += '</head><body>';
  html += `<h2>Laporan ${ROOMS[room]?.label || room} - ${tahun} - ${bulan ? MONTHS_ID[bulan-1] : 'Semua Bulan'}</h2>`;
  html += '<table><thead><tr>';

  // Ambil header dari kunci report pertama (kecuali _row)
  const reportKeys = Object.keys(result.reports[0]).filter(k => k !== '_row' && k !== '_sortDate');
  reportKeys.forEach(key => {
    html += `<th>${key}</th>`;
  });

  html += '</tr></thead><tbody>';

  result.reports.forEach(report => {
    html += '<tr>';
    reportKeys.forEach(key => {
      html += `<td>${report[key] || ''}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table></body></html>';

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

// =========================================================
// LOGOUT & EVENTS
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
}

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

  if (Object.keys(roomPasswords).length === 0) await loadPasswords();

  const correctPassword = roomPasswords[room];
  if (correctPassword && password === correctPassword) {
    currentRoom = room;
    sessionStorage.setItem('activeRoom', room);
    showFormScreen();
  } else {
    const result = await callApi({ action: 'login', room: room, password: password });
    if (result.success) {
      currentRoom = room;
      sessionStorage.setItem('activeRoom', room);
      showFormScreen();
    } else {
      loginError.textContent = result.message || 'Password salah.';
      loginError.classList.remove('hidden');
    }
  }
});

logoutBtn.addEventListener('click', handleLogout);

tabInputBtn.addEventListener('click', function () {
  if (currentRoom && currentRoom !== ADMIN_ROOM) {
    formScreen.classList.remove('hidden');
    recapScreen.classList.add('hidden');
    tabInputBtn.classList.add('active');
    tabRecapBtn.classList.remove('active');
  }
});

tabRecapBtn.addEventListener('click', function () {
  recapScreen.classList.remove('hidden');
  formScreen.classList.add('hidden');
  tabRecapBtn.classList.add('active');
  tabInputBtn.classList.remove('active');
  showRecapScreen();
});

// Tambahkan event listener untuk filter rekap (TANPA reset ulang pilihan)
if (recapYear) recapYear.addEventListener('change', refreshRecapData);
if (recapMonth) recapMonth.addEventListener('change', refreshRecapData);
if (adminRoomSelect) adminRoomSelect.addEventListener('change', refreshRecapData);

// Tambahkan event listener untuk export & print
if (exportExcelBtn) exportExcelBtn.addEventListener('click', exportToExcel);
if (printPreviewBtn) printPreviewBtn.addEventListener('click', printPreview);

// Event listener untuk modal
if (modalCloseBtn) modalCloseBtn.addEventListener('click', function() {
  reportModalOverlay.classList.add('hidden');
  modalBody.classList.remove('hidden');
  editFormContainer.classList.add('hidden');
});

// =========================================================
// INIT
// =========================================================
function init() {
  roomSelect.innerHTML = '';
  Object.keys(ROOMS).forEach(roomKey => {
    const opt = document.createElement('option');
    opt.value = roomKey;
    opt.textContent = ROOMS[roomKey].label;
    roomSelect.appendChild(opt);
  });

  const adminOpt = document.createElement('option');
  adminOpt.value = ADMIN_ROOM;
  adminOpt.textContent = 'ADMIN (Lihat Semua Laporan)';
  roomSelect.appendChild(adminOpt);

  // Load data awal (HANYA SEKALI)
  loadPasswords();
  loadStaff();
  initFilters(); // Inisialisasi filter tanpa mereset pilihan

  // Cek session
  const savedRoom = sessionStorage.getItem('activeRoom');
  if (savedRoom && isValidRoom(savedRoom)) {
    currentRoom = savedRoom;
    showFormScreen();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
