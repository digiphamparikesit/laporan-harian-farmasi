// =========================================================
// KONFIGURASI APLIKASI
// =========================================================

// Ganti dengan URL Apps Script Anda yang BENAR
const API_URL = 'https://https://script.google.com/macros/s/AKfycbzx9l0HKXZyV3fzGj3Mfea-0eGUbABi8IhtkN2FTBqxEH8S9Pw0y6U2u9LK9DyTjMD0/exec';

// ROOM ADMIN (untuk melihat semua laporan)
const ADMIN_ROOM = 'admin';

// DAFTAR RUANGAN UNTUK REKAP - PERBAIKI TYPO
const RECAP_ROOM_LIST = [
  'depo_igd',                    // ← PERBAIKI: dari depo_ing
  'depo_ibs',
  'depo_irna1_paviliun',         // ← PERBAIKI: dari depo_inna_pavilion
  'depo_rawat_jalan',
  'depo_rawat_jalan_maternitas',
  'depo_irin_maternitas',
  'depo_cathlab',
  'depo_onkologi_terpadu'        // ← PERBAIKI: dari depo_konkologi_terpadu
];

// WARNA GRAFIK
const ROOM_COLORS = {
  depo_igd: '#0F6E6A',
  depo_ibs: '#D97706',
  depo_irna1_paviliun: '#7C3AED',
  depo_rawat_jalan: '#DC2626',
  depo_rawat_jalan_maternitas: '#059669',
  depo_irin_maternitas: '#2563EB',
  depo_cathlab: '#D946EF',
  depo_onkologi_terpadu: '#EA580C'
};

// NAMA BULAN
const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const MONTHS_ID_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
                         'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// =========================================================
// KONFIGURASI RUANGAN (DEPO FARMASI)
// =========================================================
const ROOMS = {
  // PERBAIKI: depo_igd (bukan depo_ing)
  depo_igd: {
    label: 'DEPO FARMASI IGD',
    staffColumns: 2,
    fields: [
      { key: 'tanggal', label: 'Tanggal Laporan', type: 'date' },
      { key: 'JADWAL_SHIFT', label: 'Jadwal Shift', type: 'select', options: ['Pagi', 'Siang', 'Malam'] },
      { key: 'PETUGAS_1', label: 'Petugas 1', type: 'staff' },
      { key: 'PETUGAS_2', label: 'Petugas 2', type: 'staff' },
      { key: 'JUMLAH_RESEP', label: 'Jumlah Resep', type: 'number' },
      { key: 'RESEP_RACIKAN', label: 'Resep Racikan', type: 'number' },
      { key: 'RESEP_NON_RACIKAN', label: 'Resep Non-Racikan', type: 'number' },
      { key: 'PELAYANAN_INFORMASI', label: 'Pelayanan Informasi', type: 'number' },
      { key: 'CATATAN', label: 'Catatan / Kendala', type: 'textarea' }
    ]
  },
  
  depo_ibs: {
    label: 'DEPO FARMASI IBS',
    staffColumns: 2,
    fields: [
      { key: 'tanggal', label: 'Tanggal Laporan', type: 'date' },
      { key: 'JADWAL_SHIFT', label: 'Jadwal Shift', type: 'select', options: ['Pagi', 'Siang', 'Malam'] },
      { key: 'PETUGAS_1', label: 'Petugas 1', type: 'staff' },
      { key: 'PETUGAS_2', label: 'Petugas 2', type: 'staff' },
      { key: 'JUMLAH_RESEP', label: 'Jumlah Resep', type: 'number' },
      { key: 'RESEP_RACIKAN', label: 'Resep Racikan', type: 'number' },
      { key: 'RESEP_NON_RACIKAN', label: 'Resep Non-Racikan', type: 'number' },
      { key: 'PELAYANAN_INFORMASI', label: 'Pelayanan Informasi', type: 'number' },
      { key: 'CATATAN', label: 'Catatan / Kendala', type: 'textarea' }
    ]
  },
  
  // PERBAIKI: depo_irna1_paviliun (bukan depo_inna_pavilion)
  depo_irna1_paviliun: {
    label: 'DEPO FARMASI IRNA 1 dan Paviliun',
    staffColumns: 2,
    fields: [
      { key: 'tanggal', label: 'Tanggal Laporan', type: 'date' },
      { key: 'JADWAL_SHIFT', label: 'Jadwal Shift', type: 'select', options: ['Pagi', 'Siang', 'Malam'] },
      { key: 'PETUGAS_1', label: 'Petugas 1', type: 'staff' },
      { key: 'PETUGAS_2', label: 'Petugas 2', type: 'staff' },
      { key: 'PETUGAS_3', label: 'Petugas 3', type: 'staff' },
      { key: 'JUMLAH_RESEP', label: 'Jumlah Resep', type: 'number' },
      { key: 'RESEP_RACIKAN', label: 'Resep Racikan', type: 'number' },
      { key: 'RESEP_NON_RACIKAN', label: 'Resep Non-Racikan', type: 'number' },
      { key: 'PELAYANAN_INFORMASI', label: 'Pelayanan Informasi', type: 'number' },
      { key: 'KONSULTASI', label: 'Konsultasi', type: 'number' },
      { key: 'CATATAN', label: 'Catatan / Kendala', type: 'textarea' }
    ]
  },
  
  depo_rawat_jalan: {
    label: 'DEPO FARMASI RAWAT JALAN',
    staffColumns: 2,
    fields: [
      { key: 'tanggal', label: 'Tanggal Laporan', type: 'date' },
      { key: 'JADWAL_SHIFT', label: 'Jadwal Shift', type: 'select', options: ['Pagi', 'Siang'] },
      { key: 'PETUGAS_1', label: 'Petugas 1', type: 'staff' },
      { key: 'PETUGAS_2', label: 'Petugas 2', type: 'staff' },
      { key: 'PETUGAS_3', label: 'Petugas 3', type: 'staff' },
      { key: 'PETUGAS_4', label: 'Petugas 4', type: 'staff' },
      { key: 'JUMLAH_RESEP', label: 'Jumlah Resep', type: 'number' },
      { key: 'RESEP_RACIKAN', label: 'Resep Racikan', type: 'number' },
      { key: 'RESEP_NON_RACIKAN', label: 'Resep Non-Racikan', type: 'number' },
      { key: 'PELAYANAN_INFORMASI', label: 'Pelayanan Informasi', type: 'number' },
      { key: 'KONSULTASI', label: 'Konsultasi', type: 'number' },
      { key: 'CATATAN', label: 'Catatan / Kendala', type: 'textarea' }
    ]
  },
  
  depo_rawat_jalan_maternitas: {
    label: 'DEPO FARMASI RAWAT JALAN MATERNITAS',
    staffColumns: 2,
    fields: [
      { key: 'tanggal', label: 'Tanggal Laporan', type: 'date' },
      { key: 'JADWAL_SHIFT', label: 'Jadwal Shift', type: 'select', options: ['Pagi', 'Siang'] },
      { key: 'PETUGAS_1', label: 'Petugas 1', type: 'staff' },
      { key: 'PETUGAS_2', label: 'Petugas 2', type: 'staff' },
      { key: 'JUMLAH_RESEP', label: 'Jumlah Resep', type: 'number' },
      { key: 'RESEP_RACIKAN', label: 'Resep Racikan', type: 'number' },
      { key: 'RESEP_NON_RACIKAN', label: 'Resep Non-Racikan', type: 'number' },
      { key: 'PELAYANAN_INFORMASI', label: 'Pelayanan Informasi', type: 'number' },
      { key: 'CATATAN', label: 'Catatan / Kendala', type: 'textarea' }
    ]
  },
  
  depo_irin_maternitas: {
    label: 'DEPO FARMASI IRIN DAN MATERNITAS',
    staffColumns: 2,
    fields: [
      { key: 'tanggal', label: 'Tanggal Laporan', type: 'date' },
      { key: 'JADWAL_SHIFT', label: 'Jadwal Shift', type: 'select', options: ['Pagi', 'Siang', 'Malam'] },
      { key: 'PETUGAS_1', label: 'Petugas 1', type: 'staff' },
      { key: 'PETUGAS_2', label: 'Petugas 2', type: 'staff' },
      { key: 'JUMLAH_RESEP', label: 'Jumlah Resep', type: 'number' },
      { key: 'RESEP_RACIKAN', label: 'Resep Racikan', type: 'number' },
      { key: 'RESEP_NON_RACIKAN', label: 'Resep Non-Racikan', type: 'number' },
      { key: 'PELAYANAN_INFORMASI', label: 'Pelayanan Informasi', type: 'number' },
      { key: 'CATATAN', label: 'Catatan / Kendala', type: 'textarea' }
    ]
  },
  
  depo_cathlab: {
    label: 'DEPO FARMASI CATHLAB',
    staffColumns: 2,
    fields: [
      { key: 'tanggal', label: 'Tanggal Laporan', type: 'date' },
      { key: 'JADWAL_SHIFT', label: 'Jadwal Shift', type: 'select', options: ['Pagi', 'Siang'] },
      { key: 'PETUGAS_1', label: 'Petugas 1', type: 'staff' },
      { key: 'PETUGAS_2', label: 'Petugas 2', type: 'staff' },
      { key: 'JUMLAH_RESEP', label: 'Jumlah Resep', type: 'number' },
      { key: 'RESEP_RACIKAN', label: 'Resep Racikan', type: 'number' },
      { key: 'RESEP_NON_RACIKAN', label: 'Resep Non-Racikan', type: 'number' },
      { key: 'PELAYANAN_INFORMASI', label: 'Pelayanan Informasi', type: 'number' },
      { key: 'CATATAN', label: 'Catatan / Kendala', type: 'textarea' }
    ]
  },
  
  // PERBAIKI: depo_onkologi_terpadu (bukan depo_konkologi_terpadu)
  depo_onkologi_terpadu: {
    label: 'DEPO FARMASI ONKOLOGI TERPADU',
    staffColumns: 2,
    fields: [
      { key: 'tanggal', label: 'Tanggal Laporan', type: 'date' },
      { key: 'JADWAL_SHIFT', label: 'Jadwal Shift', type: 'select', options: ['Pagi', 'Siang'] },
      { key: 'PETUGAS_1', label: 'Petugas 1', type: 'staff' },
      { key: 'PETUGAS_2', label: 'Petugas 2', type: 'staff' },
      { key: 'JUMLAH_RESEP', label: 'Jumlah Resep', type: 'number' },
      { key: 'RESEP_RACIKAN', label: 'Resep Racikan', type: 'number' },
      { key: 'RESEP_NON_RACIKAN', label: 'Resep Non-Racikan', type: 'number' },
      { key: 'PELAYANAN_INFORMASI', label: 'Pelayanan Informasi', type: 'number' },
      { key: 'KEMOTERAPI', label: 'Kemoterapi', type: 'number' },
      { key: 'TERAPI_TARGET', label: 'Terapi Target', type: 'number' },
      { key: 'IMUNOTERAPI', label: 'Imunoterapi', type: 'number' },
      { key: 'HORMONTERAPI', label: 'Hormonterapi', type: 'number' },
      { key: 'CATATAN', label: 'Catatan / Kendala', type: 'textarea' }
    ]
  }
};

// =========================================================
// FUNGSI VALIDASI RUANGAN
// =========================================================
function isValidRoom(roomKey) {
  if (!roomKey) return false;
  if (roomKey === ADMIN_ROOM) return true;
  return ROOMS.hasOwnProperty(roomKey);
}

function getRoomLabel(roomKey) {
  if (roomKey === ADMIN_ROOM) return 'ADMIN';
  return ROOMS[roomKey] ? ROOMS[roomKey].label : 'Unknown';
}

console.log('✅ CONFIG LOADED - ROOMS:', Object.keys(ROOMS));
console.log('✅ RECAP_ROOM_LIST:', RECAP_ROOM_LIST);

// Cek konsistensi RECAP_ROOM_LIST dengan ROOMS
RECAP_ROOM_LIST.forEach(function(room) {
  if (!ROOMS[room]) {
    console.error('❌ ERROR: Room "' + room + '" ada di RECAP_ROOM_LIST tapi tidak ada di ROOMS!');
  } else {
    console.log('✅ Room "' + room + '" valid');
  }
});
