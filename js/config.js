// =========================================================
// KONFIGURASI APLIKASI
// =========================================================

// Ganti dengan URL Apps Script Anda
const API_URL = 'https://script.google.com/macros/s/AKfycbzx9l0HKXZyV3fzGj3Mfea-0eGUbABi8IhtkN2FTBqxEH8S9Pw0y6U2u9LK9DyTjMD0/exec';

// ROOM ADMIN
const ADMIN_ROOM = 'admin';

// DAFTAR RUANGAN - PASTIKAN SAMA DENGAN KEY DI ROOMS
const RECAP_ROOM_LIST = [
  'depo_igd',
  'depo_ibs',
  'depo_irna1_paviliun',      // ← PERBAIKI: paviliun (bukan pavilion)
  'depo_rawat_jalan',
  'depo_rawat_jalan_maternitas',
  'depo_irin_maternitas',      // ← PERBAIKI: irin (bukan irn)
  'depo_cathlab',
  'depo_onkologi_terpadu'      // ← PERBAIKI: onkologi (bukan konkologi)
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
// KONFIGURASI RUANGAN
// PASTIKAN KEY SAMA PERSIS DENGAN RECAP_ROOM_LIST
// =========================================================
const ROOMS = {
  // DEPO FARMASI IGD
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
  
  // DEPO FARMASI IBS
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
  
  // DEPO FARMASI IRNA 1 dan Paviliun
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
  
  // DEPO FARMASI RAWAT JALAN
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
  
  // DEPO FARMASI RAWAT JALAN MATERNITAS
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
  
  // DEPO FARMASI IRIN DAN MATERNITAS
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
  
  // DEPO FARMASI CATHLAB
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
  
  // DEPO FARMASI ONKOLOGI TERPADU
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
// FUNGSI VALIDASI
// =========================================================
function isValidRoom(roomKey) {
  if (!roomKey) return false;
  if (roomKey === ADMIN_ROOM) return true;
  return ROOMS.hasOwnProperty(roomKey);
}

// =========================================================
// DEBUG - CEK KONSISTENSI
// =========================================================
console.log('✅ CONFIG LOADED - ROOMS:', Object.keys(ROOMS));
console.log('✅ RECAP_ROOM_LIST:', RECAP_ROOM_LIST);

// Cek konsistensi
RECAP_ROOM_LIST.forEach(function(room) {
  if (ROOMS[room]) {
    console.log('✅ Room "' + room + '" valid ->', ROOMS[room].label);
  } else {
    console.error('❌ ERROR: Room "' + room + '" ada di RECAP_ROOM_LIST tapi TIDAK ADA di ROOMS!');
  }
});

// Cek apakah ada ROOMS yang tidak ada di RECAP_ROOM_LIST
Object.keys(ROOMS).forEach(function(room) {
  if (!RECAP_ROOM_LIST.includes(room)) {
    console.warn('⚠️ Room "' + room + '" ada di ROOMS tapi TIDAK ADA di RECAP_ROOM_LIST');
  }
});
