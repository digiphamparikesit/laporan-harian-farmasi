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
// FILTER & RECAP LOGIC
// =========================================================
function initFilters() {
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
    MONTHS_ID.forEach((month, i) => {
      const opt = document.createElement('option');
      opt.value = i + 1;
      opt.textContent = month;
      recapMonth.appendChild(opt);
    });
  }

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

function refreshRecapData() {
  const tahun = recapYear.value;
  const bulan = recapMonth.value;

  if (currentRoom && currentRoom !== ADMIN_ROOM && bulan) {
    dailyRoomLabel.textContent = ROOMS[currentRoom].label;
    loadDailyCalendar(currentRoom, bulan, tahun);
  } else if (currentRoom === ADMIN_ROOM && adminRoomSelect.value && bulan) {
    dailyRoomLabel.textContent = ROOMS[adminRoomSelect.value].label;
    loadDailyCalendar(adminRoomSelect.value, bulan, tahun);
  } else {
    dailyCalendar.innerHTML = '<p style="padding:20px;text-align:center;">Pilih bulan untuk melihat kelengkapan laporan.</p>';
  }

  loadRecapData(tahun, bulan);
}

function showRecapScreen() {
  console.log('📊 Menampilkan layar rekap');
  refreshRecapData();
}

// =========================================================
// KALENDER DENGAN JUMLAH LAPORAN
// =========================================================
async function loadDailyCalendar(room, bulan, tahun) {
  const result = await callApi({ action: 'getDailyStatus', room: room, bulan: bulan, tahun: tahun });
  if (result.success) {
    dailyCalendar.innerHTML = '';
    for (let day = 1; day <= result.daysInMonth; day++) {
      const hasReport = result.data[day] > 0;
      const count = result.data[day];

      const cell = document.createElement('div');
      cell.className = 'day-cell' + (hasReport ? ' has-report' : ' missing');

      const dayNum = document.createElement('div');
      dayNum.className = 'day-number';
      dayNum.textContent = day;
      cell.appendChild(dayNum);

      if (hasReport) {
        const countLabel = document.createElement('div');
        countLabel.className = 'day-count';
        countLabel.textContent = count;
        cell.appendChild(countLabel);
      }

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

// =========================================================
// LOAD DATA REKAP & GRAFIK
// =========================================================
async function loadRecapData(tahun, bulan) {
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

    // GRAFIK NILAI PELAYANAN (BAR CHART) - PER JENIS LAYANAN
    drawBarChart(Object.keys(result.data), Object.values(result.data));
  }

  // GRAFIK TREN SEMUA UNIT (LINE CHART) - HANYA UNTUK ADMIN
  if (currentRoom === ADMIN_ROOM) {
    const trendResult = await callApi({ action: 'getYearlyTrend', tahun: tahun });
    if (trendResult.success) {
      let datasets = [];
      for (const [roomKey, monthlyData] of Object.entries(trendResult.data)) {
        datasets.push({
          label: ROOMS[roomKey]?.label || roomKey,
          data: monthlyData,
          color: ROOM_COLORS[roomKey] || '#000'
        });
      }
      drawLineChart(datasets, MONTHS_ID_SHORT);
    }
  }
}

// =========================================================
// GRAFIK BATANG (BAR CHART) - PER JENIS LAYANAN
// =========================================================
function drawBarChart(labels, values) {
  if (!barChart) return;
  barChart.innerHTML = '';
  
  const maxVal = Math.max(...values, 1);
  
  // Palet warna untuk setiap jenis layanan
  const colors = ['#0F6E6A', '#D97706', '#7C3AED', '#DC2626', '#059669', '#2563EB', '#D946EF', '#EA580C', '#0B5350', '#C026D3'];
  
  labels.forEach((label, i) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'bar-label';
    labelDiv.textContent = label;
    
    const track = document.createElement('div');
    track.className = 'bar-track';
    
    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.backgroundColor = colors[i % colors.length]; // warna bergantian
    fill.style.width = '0%';
    
    const valueDiv = document.createElement('div');
    valueDiv.className = 'bar-value';
    valueDiv.textContent = values[i];
    
    fill.appendChild(valueDiv);
    track.appendChild(fill);
    row.appendChild(labelDiv);
    row.appendChild(track);
    barChart.appendChild(row);
    
    // Animasi muncul
    setTimeout(() => {
      fill.style.width = Math.min(100, (values[i] / maxVal) * 100) + '%';
    }, 50);
  });
}

// =========================================================
// GRAFIK GARIS (LINE CHART) - TREN TAHUNAN
// =========================================================
function drawLineChart(datasets, labels) {
  if (!lineChart) return;
  lineChart.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '300px';
  lineChart.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.offsetWidth;
  const height = canvas.height = canvas.offsetHeight;

  const padding = { top: 30, right: 30, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  let maxVal = 0;
  datasets.forEach(ds => {
    ds.data.forEach(val => {
      if (val > maxVal) maxVal = val;
    });
  });
  if (maxVal === 0) maxVal = 10;

  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.stroke();

  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const y = padding.top + (chartHeight / yTicks) * i;
    const value = maxVal - (maxVal / yTicks) * i;
    ctx.strokeStyle = '#eee';
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(value), padding.left - 10, y + 4);
  }

  ctx.strokeStyle = '#ccc';
  ctx.beginPath();
  ctx.moveTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.stroke();

  ctx.fillStyle = '#666';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  labels.forEach((label, i) => {
    const x = padding.left + (chartWidth / (labels.length - 1)) * i;
    ctx.fillText(label, x, height - padding.bottom + 20);
  });

  datasets.forEach(ds => {
    ctx.strokeStyle = ds.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ds.data.forEach((val, i) => {
      const x = padding.left + (chartWidth / (ds.data.length - 1)) * i;
      const y = padding.top + chartHeight - (val / maxVal) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ds.data.forEach((val, i) => {
      const x = padding.left + (chartWidth / (ds.data.length - 1)) * i;
      const y = padding.top + chartHeight - (val / maxVal) * chartHeight;
      ctx.fillStyle = ds.color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  });
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

  reportModalOverlay.classList.remove('hidden');
  modalTitle.textContent = `Laporan Tanggal ${tanggal}/${bulan}/${tahun}`;
  modalBody.innerHTML = '';
  modalActions.classList.add('hidden');
  editFormContainer.classList.add('hidden');
  
  if (result.reports.length === 0) {
    modalBody.innerHTML = '<p>Tidak ada laporan untuk tanggal ini.</p>';
    return;
  }

  result.reports.forEach((report, index) => {
    const reportDiv = document.createElement('div');
    reportDiv.className = 'report-item';
    reportDiv.innerHTML = `
      <div><strong>Shift: ${report.shift || '-'}</strong></div>
      <pre>${JSON.stringify(report, null, 2)}</pre>
    `;
    
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
  modalBody.classList.add('hidden');
  modalActions.classList.add('hidden');
  editFormContainer.classList.remove('hidden');

  editingReportData = report;
  editingRoom = currentRoom;
  editingReportId = report._row;

  editReportForm.innerHTML = '';
  const room = ROOMS[editingRoom] || ROOMS[adminRoomSelect.value];
  if (!room) return;

  // Helper untuk mencari nilai berdasarkan key config.js, karena header di spreadsheet bisa berbeda
  function getValueFromReport(fieldKey) {
    // 1. Coba langsung dengan key
    if (report[fieldKey] !== undefined) return report[fieldKey];
    
    // 2. Coba dengan mengubah key menjadi format header spreadsheet
    // Contoh: 'JUMLAH_RESEP' -> 'JUMLAH RESEP'
    var possibleKey = fieldKey.replace(/_/g, ' ');
    if (report[possibleKey] !== undefined) return report[possibleKey];

    // 3. Coba dengan pencarian fleksibel (mengabaikan spasi, kapital, dan garis bawah)
    var searchKey = fieldKey.replace(/[_\s]/g, '').toLowerCase();
    for (var key in report) {
      var cleanKey = key.replace(/[_\s]/g, '').toLowerCase();
      if (cleanKey === searchKey) {
        return report[key];
      }
    }
    return '';
  }

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
      // Set nilai saat ini menggunakan helper
      input.value = getValueFromReport(field.key);
    } else if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.className = 'input';
      input.name = field.key;
      input.value = getValueFromReport(field.key);
    } else if (field.type === 'date') {
      input = document.createElement('input');
      input.className = 'input';
      input.type = 'date';
      input.name = field.key;
      input.value = getValueFromReport(field.key);
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
      input.value = getValueFromReport(field.key);
    } else {
      input = document.createElement('input');
      input.className = 'input';
      input.type = 'number';
      input.name = field.key;
      input.value = getValueFromReport(field.key);
    }

    editReportForm.appendChild(input);
  });

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

  const result = await callApi({ action: 'getFullReport', room: room, bulan: bulan, tahun: tahun });

  if (!result.success || !result.data || result.data.length === 0) {
    alert('Tidak ada data untuk diekspor.');
    return;
  }

  const headers = ['Tanggal', 'Shift'];
  const numericKeys = Object.keys(result.data[0]).filter(k => k !== 'tanggal' && k !== 'shift');
  numericKeys.forEach(k => headers.push(k));

  const rows = result.data.map(item => {
    const row = [item.tanggal, item.shift];
    numericKeys.forEach(k => row.push(item[k] || 0));
    return row;
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

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

  const result = await callApi({ action: 'getMonthlyReports', room: room, bulan: bulan, tahun: tahun });

  if (!result.success || !result.reports || result.reports.length === 0) {
    alert('Tidak ada data untuk dicetak.');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup diblokir. Izinkan popup untuk mencetak.');
    return;
  }

  let html = '<html><head><title>Preview Laporan</title>';
  html += '<style>body{font-family:Arial,sans-serif;padding:20px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ccc;padding:8px;font-size:12px;}th{background:#f0f0f0;}</style>';
  html += '</head><body>';
  html += `<h2>Laporan ${ROOMS[room]?.label || room} - ${tahun} - ${bulan ? MONTHS_ID[bulan-1] : 'Semua Bulan'}</h2>`;
  html += '<table><thead><tr>';

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

if (recapYear) recapYear.addEventListener('change', refreshRecapData);
if (recapMonth) recapMonth.addEventListener('change', refreshRecapData);
if (adminRoomSelect) adminRoomSelect.addEventListener('change', refreshRecapData);

if (exportExcelBtn) exportExcelBtn.addEventListener('click', exportToExcel);
if (printPreviewBtn) printPreviewBtn.addEventListener('click', printPreview);

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

  loadPasswords();
  loadStaff();
  initFilters();

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
