// =========================================================
// KONFIGURASI APLIKASI
// =========================================================

// Ganti dengan URL Apps Script Anda
const API_URL = 'https://script.google.com/macros/s/AKfycbzx9l0HKXZyV3fzGj3Mfea-0eGUbABi8IhtkN2FTBqxEH8S9Pw0y6U2u9LK9DyTjMD0/exec';

// ROOM ADMIN (untuk melihat semua laporan)
const ADMIN_ROOM = 'admin';

// Daftar ruangan yang akan ditampilkan di rekap (khusus admin)
const RECAP_ROOM_LIST = ['farmasi_rajawali', 'farmasi_merak', 'farmasi_kenari'];

// Warna untuk grafik tren
const ROOM_COLORS = {
  farmasi_rajawali: '#0F6E6A',
  farmasi_merak: '#D97706',
  farmasi_kenari: '#7C3AED'
};

// Nama bulan
const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const MONTHS_ID_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
                         'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// =========================================================
// KONFIGURASI RUANGAN
// =========================================================
const ROOMS = {
  // Contoh: Farmasi Rajawali
  farmasi_rajawali: {
    label: 'Farmasi Rajawali',
    staffColumns: 2,
    fields: [
      // Meta fields (tanggal, shift)
      { key: 'tanggal', label: 'Tanggal Laporan', type: 'date' },
      { key: 'JADWAL_SHIFT', label: 'Jadwal Shift', type: 'select', options: ['Pagi', 'Siang', 'Malam'] },
      
      // Staff fields
      { key: 'PETUGAS_PAGI_1', label: 'Petugas Pagi 1', type: 'staff' },
      { key: 'PETUGAS_PAGI_2', label: 'Petugas Pagi 2', type: 'staff' },
      { key: 'PETUGAS_SIANG_1', label: 'Petugas Siang 1', type: 'staff' },
      { key: 'PETUGAS_SIANG_2', label: 'Petugas Siang 2', type: 'staff' },
      { key: 'PETUGAS_MALAM_1', label: 'Petugas Malam 1', type: 'staff' },
      { key: 'PETUGAS_MALAM_2', label: 'Petugas Malam 2', type: 'staff' },
      
      // Numeric fields
      { key: 'JUMLAH_RESEP', label: 'Jumlah Resep', type: 'number' },
      { key: 'RESEP_RACIKAN', label: 'Resep Racikan', type: 'number' },
      { key: 'RESEP_NON_RACIKAN', label: 'Resep Non-Racikan', type: 'number' },
      { key: 'PELAYANAN_INFORMASI', label: 'Pelayanan Informasi', type: 'number' },
      { key: 'KONSULTASI', label: 'Konsultasi', type: 'number' },
      
      // Text area
      { key: 'CATATAN', label: 'Catatan / Kendala', type: 'textarea' }
    ]
  },
  
  // Contoh: Farmasi Merak
  farmasi_merak: {
    label: 'Farmasi Merak',
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
  
  // Contoh: Farmasi Kenari
  farmasi_kenari: {
    label: 'Farmasi Kenari',
    staffColumns: 2,
    fields: [
      { key: 'tanggal', label: 'Tanggal Laporan', type: 'date' },
      { key: 'JADWAL_SHIFT', label: 'Jadwal Shift', type: 'select', options: ['Pagi', 'Siang', 'Malam'] },
      
      { key: 'PETUGAS_1', label: 'Petugas 1', type: 'staff' },
      { key: 'PETUGAS_2', label: 'Petugas 2', type: 'staff' },
      
      { key: 'JUMLAH_RESEP', label: 'Jumlah Resep', type: 'number' },
      { key: 'RESEP_RACIKAN', label: 'Resep Racikan', type: 'number' },
      { key: 'RESEP_NON_RACIKAN', label: 'Resep Non-Racikan', type: 'number' },
      
      { key: 'CATATAN', label: 'Catatan / Kendala', type: 'textarea' }
    ]
  }
};
