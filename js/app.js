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
const adminRoomFilterWrap = document.getElementById('adminRoomFilterWrap');
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
    } else if (field.type === 'time') {
      input = document.createElement('input');
      input.className = 'input';
      input.type = 'time';
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

// =========================================================
// FUNGSI SIMPAN LAPORAN (PENTING)
// =========================================================
async function submitReport() {
  if (!currentRoom || currentRoom === ADMIN_ROOM) {
    alert('Anda tidak bisa menyimpan laporan sebagai ADMIN.');
    return;
  }

  const formData = new FormData(reportForm);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  // Konversi tanggal ke format dd/mm/yyyy jika diperlukan
  if (data.tanggal) {
    const parts = data.tanggal.split('-');
    if (parts.length === 3) data.tanggal = `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  console.log('📤 Mengirim data laporan:', data);
  const result = await callApi({ action: 'submitReport', room: currentRoom, data: data });

  if (result.success) {
    alert('Laporan berhasil disimpan!');
    reportForm.reset();
  } else {
    alert('Gagal menyimpan: ' + result.message);
  }
}

// =========================================================
// TAMPILKAN FORM
// =========================================================
function showFormScreen() {
  if (!loginScreen || !formScreen || !recapScreen) return;

  loginScreen.classList.add('hidden');
  logoutBtn.classList.remove('hidden');
  if (tabNav) tabNav.classList.remove('hidden');

  if (currentRoom === ADMIN_ROOM) {
    if (adminRoomFilterWrap) adminRoomFilterWrap.classList.remove('hidden');
  } else {
    if (adminRoomFilterWrap) adminRoomFilterWrap.classList.add('hidden');
  }

  if (currentRoom && currentRoom !== ADMIN_ROOM) {
    formScreen.classList.remove('hidden');
    recapScreen.classList.add('hidden');
    tabInputBtn.classList.add('active');
    tabRecapBtn.classList.remove('active');
    activeRoomBadge.textContent = ROOMS[currentRoom].label;
    activeRoomBadge.classList.remove('hidden');
    renderForm(currentRoom);
  } else {
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
    if (Object.keys(ROOMS).length > 0) adminRoomSelect.value = Object.keys(ROOMS)[0];
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
// KALENDER
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
    statCards.innerHTML = '';
    for (const [key, value] of Object.entries(result.data)) {
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `<div class="stat-value">${value}</div><div class="stat-label">${key}</div>`;
      statCards.appendChild(card);
    }
    drawBarChart(Object.keys(result.data), Object.values(result.data));
  }

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

function drawBarChart(labels, values) {
  if (!barChart) return;
  barChart.innerHTML = '';
  const maxVal = Math.max(...values, 1);
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
    fill.style.backgroundColor = colors[i % colors.length];
    fill.style.width = '0%';
    const valueDiv = document.createElement('div');
    valueDiv.className = 'bar-value';
    valueDiv.textContent = values[i];
    fill.appendChild(valueDiv);
    track.appendChild(fill);
    row.appendChild(labelDiv);
    row.appendChild(track);
    barChart.appendChild(row);
    setTimeout(() => { fill.style.width = Math.min(100, (values[i] / maxVal) * 100) + '%'; }, 50);
  });
}

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
  datasets.forEach(ds => { ds.data.forEach(val => { if (val > maxVal) maxVal = val; }); });
  if (maxVal === 0) maxVal = 10;

  ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(padding.left, padding.top); ctx.lineTo(padding.left, height - padding.bottom); ctx.stroke();
  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const y = padding.top + (chartHeight / yTicks) * i;
    const value = maxVal - (maxVal / yTicks) * i;
    ctx.strokeStyle = '#eee'; ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(width - padding.right, y); ctx.stroke();
    ctx.fillStyle = '#666'; ctx.font = '12px Arial'; ctx.textAlign = 'right'; ctx.fillText(Math.round(value), padding.left - 10, y + 4);
  }
  ctx.strokeStyle = '#ccc'; ctx.beginPath(); ctx.moveTo(padding.left, height - padding.bottom); ctx.lineTo(width - padding.right, height - padding.bottom); ctx.stroke();
  ctx.fillStyle = '#666'; ctx.font = '12px Arial'; ctx.textAlign = 'center';
  labels.forEach((label, i) => { const x = padding.left + (chartWidth / (labels.length - 1)) * i; ctx.fillText(label, x, height - padding.bottom + 20); });
  datasets.forEach(ds => {
    ctx.strokeStyle = ds.color; ctx.lineWidth = 2; ctx.beginPath();
    ds.data.forEach((val, i) => {
      const x = padding.left + (chartWidth / (ds.data.length - 1)) * i;
      const y = padding.top + chartHeight - (val / maxVal) * chartHeight;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ds.data.forEach((val, i) => {
      const x = padding.left + (chartWidth / (ds.data.length - 1)) * i;
      const y = padding.top + chartHeight - (val / maxVal) * chartHeight;
      ctx.fillStyle = ds.color; ctx.beginPath(); ctx.arc(x, y, 4, 0, 2 * Math.PI); ctx.fill();
    });
  });
}

// =========================================================
// MODAL DETAIL & EDIT LAPORAN
// =========================================================
async function showDayReports(room, tanggal, bulan, tahun) {
  const result = await callApi({ action: 'getDayReports', room: room, tanggal: tanggal, bulan: bulan, tahun: tahun });
  if (!result.success) { alert('Gagal memuat data: ' + result.message); return; }

  if (!reportModalOverlay || !modalTitle || !modalBody || !editFormContainer) {
    console.error('❌ Elemen modal tidak ditemukan! Periksa ID di HTML.');
    alert('Terjadi kesalahan pada tampilan modal. Muat ulang halaman.');
    return;
  }

  reportModalOverlay.classList.remove('hidden');
  modalTitle.textContent = `Laporan Tanggal ${tanggal}/${bulan}/${tahun}`;
  modalBody.innerHTML = '';
  editFormContainer.classList.add('hidden');

  if (result.reports.length === 0) { modalBody.innerHTML = '<p>Tidak ada laporan untuk tanggal ini.</p>'; return; }

  result.reports.forEach((report) => {
    try {
      const reportDiv = document.createElement('div');
      reportDiv.className = 'report-item';
      const shiftValue = report.shift || report['JADWAL SHIFT'] || report['JADWAL_SHIFT'] || '-';
      reportDiv.innerHTML = `<div><strong>Shift: ${shiftValue}</strong></div><pre>${JSON.stringify(report, null, 2)}</pre>`;
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit Laporan Ini';
      editBtn.className = 'btn-warning';
      editBtn.style.marginTop = '10px';
      editBtn.onclick = function() { openEditModal(report); };
      reportDiv.appendChild(editBtn);
      modalBody.appendChild(reportDiv);
    } catch (err) { console.error('Error rendering report:', err); }
  });
}

function convertDateForInput(dateStr) {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const parts = dateStr.split('/');
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return dateStr;
}

function openEditModal(report) {
  if (!reportModalOverlay || !modalBody || !editFormContainer || !editReportForm || !saveEditBtn || !cancelEditBtn) {
    alert('Elemen modal tidak ditemukan. Muat ulang halaman.');
    return;
  }

  modalBody.classList.add('hidden');
  editFormContainer.classList.remove('hidden');

  editingReportData = report;
  editingRoom = currentRoom;
  editingReportId = report._row;

  editReportForm.innerHTML = '';
  const room = ROOMS[editingRoom] || ROOMS[adminRoomSelect.value];
  if (!room) { alert('Konfigurasi ruangan tidak ditemukan!'); return; }

  function getValueFromReport(fieldKey) {
    if (!report) return '';
    if (report[fieldKey] !== undefined && report[fieldKey] !== null) return report[fieldKey];
    var possibleKey = fieldKey.replace(/_/g, ' ');
    if (report[possibleKey] !== undefined && report[possibleKey] !== null) return report[possibleKey];
    var upperKey = fieldKey.toUpperCase();
    if (report[upperKey] !== undefined && report[upperKey] !== null) return report[upperKey];
    var searchKey = fieldKey.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    for (var key in report) {
      var cleanKey = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (cleanKey === searchKey || cleanKey.includes(searchKey)) return report[key];
    }
    var parts = searchKey.split('_');
    if (parts.length > 1) {
      for (var key2 in report) {
        var cleanKey2 = key2.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        var allFound = true;
        for (var i = 0; i < parts.length; i++) {
          if (!cleanKey2.includes(parts[i])) { allFound = false; break; }
        }
        if (allFound) return report[key2];
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
    let rawValue = getValueFromReport(field.key);
    if (field.type === 'date') rawValue = convertDateForInput(rawValue);

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
      if (rawValue && field.options.includes(rawValue)) input.value = rawValue;
    } else if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.className = 'input';
      input.name = field.key;
      input.value = rawValue || '';
    } else if (field.type === 'date') {
      input = document.createElement('input');
      input.className = 'input';
      input.type = 'date';
      input.name = field.key;
      input.value = rawValue || '';
    } else if (field.type === 'time') {
      input = document.createElement('input');
      input.className = 'input';
      input.type = 'time';
      input.name = field.key;
      input.value = rawValue || '';
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
      if (rawValue) input.value = rawValue;
    } else {
      input = document.createElement('input');
      input.className = 'input';
      input.type = 'number';
      input.name = field.key;
      input.value = rawValue || '';
    }

    editReportForm.appendChild(input);
  });

  saveEditBtn.onclick = saveEditedReport;
  cancelEditBtn.onclick = closeEditModal;
}

async function saveEditedReport() {
  if (!editingReportData || !editingRoom) return;
  const formData = new FormData(editReportForm);
  const data = {};
  formData.forEach((value, key) => { data[key] = value; });
  if (data.tanggal) {
    const parts = data.tanggal.split('-');
    if (parts.length === 3) data.tanggal = `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const result = await callApi({ action: 'updateReport', room: editingRoom, row: editingReportId, data: data, checkTanggal: editingReportData.tanggal });
  if (result.success) {
    alert('Laporan berhasil diperbarui!');
    closeEditModal();
    refreshRecapData();
  } else {
    alert('Gagal memperbarui: ' + result.message);
  }
}

function closeEditModal() {
  if (reportModalOverlay) reportModalOverlay.classList.add('hidden');
  if (modalBody) modalBody.classList.remove('hidden');
  if (editFormContainer) editFormContainer.classList.add('hidden');
  editingReportId = null;
  editingReportData = null;
}

// =========================================================
// EXPORT EXCEL & CETAK PREVIEW
// =========================================================
async function exportToExcel() {
  const room = (currentRoom === ADMIN_ROOM && adminRoomSelect.value) ? adminRoomSelect.value : currentRoom;
  if (!room) { alert('Pilih ruangan terlebih dahulu!'); return; }
  const tahun = recapYear.value; const bulan = recapMonth.value;
  const result = await callApi({ action: 'getFullReport', room: room, bulan: bulan, tahun: tahun });
  if (!result.success || !result.data || result.data.length === 0) { alert('Tidak ada data untuk diekspor.'); return; }
  const headers = ['Tanggal', 'Shift'];
  const numericKeys = Object.keys(result.data[0]).filter(k => k !== 'tanggal' && k !== 'shift');
  numericKeys.forEach(k => headers.push(k));
  const rows = result.data.map(item => {
    const row = [item.tanggal, item.shift];
    numericKeys.forEach(k => row.push(item[k] || 0));
    return row;
  });
  const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Laporan_${ROOMS[room]?.label || room}_${tahun}_${bulan || 'semua'}.csv`;
  document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
}

async function printPreview() {
  const room = (currentRoom === ADMIN_ROOM && adminRoomSelect.value) ? adminRoomSelect.value : currentRoom;
  if (!room) { alert('Pilih ruangan terlebih dahulu!'); return; }
  const tahun = recapYear.value; const bulan = recapMonth.value;
  const result = await callApi({ action: 'getMonthlyReports', room: room, bulan: bulan, tahun: tahun });
  if (!result.success || !result.reports || result.reports.length === 0) { alert('Tidak ada data untuk dicetak.'); return; }
  const printWindow = window.open('', '_blank');
  if (!printWindow) { alert('Popup diblokir. Izinkan popup untuk mencetak.'); return; }
  let html = '<html><head><title>Preview Laporan</title><style>body{font-family:Arial,sans-serif;padding:20px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ccc;padding:8px;font-size:12px;}th{background:#f0f0f0;}</style></head><body>';
  html += `<h2>Laporan ${ROOMS[room]?.label || room} - ${tahun} - ${bulan ? MONTHS_ID[bulan-1] : 'Semua Bulan'}</h2>`;
  html += '<table><thead><tr>';
  const reportKeys = Object.keys(result.reports[0]).filter(k => k !== '_row' && k !== '_sortDate');
  reportKeys.forEach(key => { html += `<th>${key}</th>`; });
  html += '</tr></thead><tbody>';
  result.reports.forEach(report => {
    html += '<tr>';
    reportKeys.forEach(key => { html += `<td>${report[key] || ''}</td>`; });
    html += '</tr>';
  });
  html += '</tbody></table></body></html>';
  printWindow.document.write(html); printWindow.document.close(); printWindow.print();
}

// =========================================================
// LOGOUT & EVENTS
// =========================================================
function handleLogout() {
  currentRoom = null;
  sessionStorage.removeItem('activeRoom');
  if (loginScreen) loginScreen.classList.remove('hidden');
  if (formScreen) formScreen.classList.add('hidden');
  if (recapScreen) recapScreen.classList.add('hidden');
  if (logoutBtn) logoutBtn.classList.add('hidden');
  if (activeRoomBadge) activeRoomBadge.classList.add('hidden');
  if (tabNav) tabNav.classList.add('hidden');
  if (passwordInput) passwordInput.value = '';
  if (adminRoomFilterWrap) adminRoomFilterWrap.classList.add('hidden');
}

loginBtn.addEventListener('click', async function () {
  const room = roomSelect.value;
  const password = passwordInput.value.trim();
  if (loginError) loginError.classList.add('hidden');
  if (!password) { if (loginError) { loginError.textContent = 'Password wajib diisi.'; loginError.classList.remove('hidden'); } return; }
  if (room !== ADMIN_ROOM && !ROOMS[room]) { if (loginError) { loginError.textContent = 'Ruangan tidak ditemukan.'; loginError.classList.remove('hidden'); } return; }
  if (Object.keys(roomPasswords).length === 0) await loadPasswords();
  const correctPassword = roomPasswords[room];
  if (correctPassword && password === correctPassword) {
    currentRoom = room; sessionStorage.setItem('activeRoom', room); showFormScreen();
  } else {
    const result = await callApi({ action: 'login', room: room, password: password });
    if (result.success) {
      currentRoom = room; sessionStorage.setItem('activeRoom', room); showFormScreen();
    } else {
      if (loginError) { loginError.textContent = result.message || 'Password salah.'; loginError.classList.remove('hidden'); }
    }
  }
});

// ===== EVENT TOMBOL SIMPAN LAPORAN (PENTING) =====
if (submitBtn) {
  submitBtn.addEventListener('click', function(e) {
    e.preventDefault();
    submitReport();
  });
}

logoutBtn.addEventListener('click', handleLogout);

tabInputBtn.addEventListener('click', function () {
  if (currentRoom && currentRoom !== ADMIN_ROOM) {
    if (formScreen) formScreen.classList.remove('hidden');
    if (recapScreen) recapScreen.classList.add('hidden');
    tabInputBtn.classList.add('active'); tabRecapBtn.classList.remove('active');
  }
});

tabRecapBtn.addEventListener('click', function () {
  if (recapScreen) recapScreen.classList.remove('hidden');
  if (formScreen) formScreen.classList.add('hidden');
  tabRecapBtn.classList.add('active'); tabInputBtn.classList.remove('active');
  showRecapScreen();
});

if (recapYear) recapYear.addEventListener('change', refreshRecapData);
if (recapMonth) recapMonth.addEventListener('change', refreshRecapData);
if (adminRoomSelect) adminRoomSelect.addEventListener('change', refreshRecapData);
if (exportExcelBtn) exportExcelBtn.addEventListener('click', exportToExcel);
if (printPreviewBtn) printPreviewBtn.addEventListener('click', printPreview);
if (modalCloseBtn) modalCloseBtn.addEventListener('click', function() {
  if (reportModalOverlay) reportModalOverlay.classList.add('hidden');
  if (modalBody) modalBody.classList.remove('hidden');
  if (editFormContainer) editFormContainer.classList.add('hidden');
});

// =========================================================
// INIT
// =========================================================
function init() {
  if (!roomSelect) { console.error('❌ Elemen #roomSelect tidak ditemukan!'); return; }
  roomSelect.innerHTML = '';
  Object.keys(ROOMS).forEach(roomKey => {
    const opt = document.createElement('option');
    opt.value = roomKey; opt.textContent = ROOMS[roomKey].label; roomSelect.appendChild(opt);
  });
  const adminOpt = document.createElement('option');
  adminOpt.value = ADMIN_ROOM; adminOpt.textContent = 'ADMIN (Lihat Semua Laporan)'; roomSelect.appendChild(adminOpt);
  loadPasswords(); loadStaff(); initFilters();
  const savedRoom = sessionStorage.getItem('activeRoom');
  if (savedRoom && isValidRoom(savedRoom)) { currentRoom = savedRoom; showFormScreen(); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
