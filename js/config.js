// =========================================================
// KONFIGURASI APLIKASI
// =========================================================

// Ganti dengan URL Apps Script Anda
const API_URL = 'https://script.google.com/macros/s/AKfycbzx9l0HKXZyV3fzGj3Mfea-0eGUbABi8IhtkN2FTBqxEH8S9Pw0y6U2u9LK9DyTjMD0/exec';

// ROOM ADMIN (untuk melihat semua laporan)
const ADMIN_ROOM = 'admin';

// Daftar ruangan yang akan ditampilkan di rekap (khusus admin)
const RECAP_ROOM_LIST = [
  'depo_igd',
  'depo_ibs',
  'depo_irna1_paviliun',
  'depo_rawat_jalan',
  'depo_rawat_jalan_maternitas',
  'depo_irin_maternitas',
  'depo_cathlab',
  'depo_onkologi_terpadu'
];

// Warna untuk grafik tren
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

// Nama bulan
const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const MONTHS_ID_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
                         'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// =========================================================
// KONFIGURASI RUANGAN (DEPO FARMASI)
// =========================================================
const ROOMS = {
  // DEPO FARMASI IGD
  depo_igd: {
    label: 'DEPO FARMASI IGD',
    password: 'igd123',
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
    password: 'ibs123',
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
    password: 'irna123',
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
    password: 'rj123',
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
    password: 'rjm123',
    staffColumns: 2,
    fields: [
      { key: 'tanggal', label: 'Tanggal Laporan', type: 'date' },
      { key: 'JADWAL_SHIFT', label: 'Jadwal Shift', type: 'select', options: ['Pagi', 'Siang'] },
      { key: 'PETUGAS_1', label: 'Petugas 1', type: 'staff' },
      { key: 'PETUGAS_2', label: 'Pet
