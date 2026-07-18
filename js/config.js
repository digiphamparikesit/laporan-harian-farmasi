// =============================================================
// GANTI dengan URL Web App hasil deploy Apps Script kamu
// (Deploy > New deployment > Web app > copy "Web app URL")
// =============================================================
const API_URL = 'https://script.google.com/macros/s/AKfycbzx9l0HKXZyV3fzGj3Mfea-0eGUbABi8IhtkN2FTBqxEH8S9Pw0y6U2u9LK9DyTjMD0/exec';

// Opsi jadwal shift. Sesuaikan dengan istilah yang dipakai di lapangan.
const SHIFT_OPTIONS = ['Pagi', 'Middle', 'Sore', 'Malam'];

// Tipe field yang didukung: 'date', 'text', 'number', 'select', 'staff'
// 'staff'  -> dropdown otomatis diisi dari sheet DATA STAFF
// 'select' -> dropdown, opsi diambil dari properti "options"

const ROOMS = {
  'IGD': {
    label: 'IGD',
    fields: [
      { key: 'TANGGAL INPUT LAPORAN', label: 'Tanggal Input Laporan', type: 'date' },
      { key: 'JADWAL SHIFT', label: 'Jadwal Shift', type: 'select', options: SHIFT_OPTIONS },
      { key: 'NAMA PETUGAS IGD 1', label: 'Nama Petugas IGD 1', type: 'staff' },
      { key: 'NAMA PETUGAS IGD 2', label: 'Nama Petugas IGD 2', type: 'staff' },
      { key: 'JUMLAH RESEP TERLAYANI', label: 'Jumlah Resep Terlayani', type: 'number' },
      { key: 'JUMLAH RESEP ELEKTROLIT PEKAT', label: 'Jumlah Resep Elektrolit Pekat', type: 'number' },
      { key: 'JUMLAH RESEP TPN', label: 'Jumlah Resep TPN', type: 'number' },
      { key: 'JUMLAH RESEP RACIKAN (PUYER)', label: 'Jumlah Resep Racikan (Puyer)', type: 'number' },
      { key: 'JUMLAH PASIEN TERTAHAN DI IGD', label: 'Jumlah Pasien Tertahan di IGD', type: 'number' },
      { key: 'JUMLAH PASIEN PINDAH RUANG RAWAT INAP', label: 'Jumlah Pasien Pindah Ruang Rawat Inap', type: 'number' },
      { key: 'JUMLAH PASIEN KODE MERAH', label: 'Jumlah Pasien Kode Merah', type: 'number' },
      { key: 'JUMLAH TAMBAHAN RESEP RAWAT INAP', label: 'Jumlah Tambahan Resep Rawat Inap', type: 'number' },
      { key: 'JUMLAH RESEP RACIKAN (SALEP/CREAM)', label: 'Jumlah Resep Racikan (Salep/Cream)', type: 'number' },
      { key: 'JUMLAH PASIEN PULANG', label: 'Jumlah Pasien Pulang', type: 'number' }
    ]
  },

  'IBS': {
    label: 'IBS',
    fields: [
      { key: 'TANGGAL INPUT LAPORAN IBS', label: 'Tanggal Input Laporan IBS', type: 'date' },
      { key: 'JADWAL SHIFT', label: 'Jadwal Shift', type: 'select', options: SHIFT_OPTIONS },
      { key: 'NAMA PETUGAS IBS 1', label: 'Nama Petugas IBS 1', type: 'staff' },
      { key: 'NAMA PETUGAS IBS 2', label: 'Nama Petugas IBS 2', type: 'staff' },
      { key: 'JUMLAH OPERASI ELEKTIF', label: 'Jumlah Operasi Elektif', type: 'number' },
      { key: 'JUMLAH OPERASI CITO', label: 'Jumlah Operasi Cito', type: 'number' },
      { key: 'JUMLAH OPERASI MATA', label: 'Jumlah Operasi Mata', type: 'number' },
      { key: 'STATUS PASIEN BPJS/SHIFT', label: 'Status Pasien BPJS/Shift', type: 'number' },
      { key: 'STATUS PASIEN CASH/SHIFT', label: 'Status Pasien Cash/Shift', type: 'number' },
      { key: 'STATUS PASIEN PERUSAHAAN', label: 'Status Pasien Perusahaan', type: 'number' }
    ]
  },

  'DEPO RAWAT INAP': {
    label: 'Depo Rawat Inap',
    fields: [
      { key: 'TANGGAL INPUT LAPORAN', label: 'Tanggal Input Laporan', type: 'date' },
      { key: 'JADWAL SHFT', label: 'Jadwal Shift', type: 'select', options: SHIFT_OPTIONS },
      { key: 'PETUGAS PAGI 1', label: 'Petugas Pagi 1', type: 'staff' },
      { key: 'PETUGAS PAGI 2', label: 'Petugas Pagi 2', type: 'staff' },
      { key: 'PETUGAS PAGI 3', label: 'Petugas Pagi 3', type: 'staff' },
      { key: 'PETUGAS PAGI 4', label: 'Petugas Pagi 4', type: 'staff' },
      { key: 'PETUGAS PAGI 5', label: 'Petugas Pagi 5', type: 'staff' },
      { key: 'PETUGAS MIDEL 1', label: 'Petugas Midel 1', type: 'staff' },
      { key: 'PETUGAS MIDEL 2', label: 'Petugas Midel 2', type: 'staff' },
      { key: 'PETUGAS MIDEL 3', label: 'Petugas Midel 3', type: 'staff' },
      { key: 'PETUGAS MIDEL 4', label: 'Petugas Midel 4', type: 'staff' },
      { key: 'PETUGAS MIDEL 5', label: 'Petugas Midel 5', type: 'staff' },
      { key: 'PETUGAS MIDEL 6', label: 'Petugas Midel 6', type: 'staff' },
      { key: 'JUMLAH RESEP PER-SHIFT', label: 'Jumlah Resep per-Shift', type: 'number' },
      { key: 'JUMLAH RESEP RACIKAN (PUYER)', label: 'Jumlah Resep Racikan (Puyer)', type: 'number' },
      { key: 'JUMLAH RESEP RACIKAN (SALEP/CREAM)', label: 'Jumlah Resep Racikan (Salep/Cream)', type: 'number' },
      { key: 'JUMLAH RESEP ELEKTROLIT PEKAT', label: 'Jumlah Resep Elektrolit Pekat', type: 'number' },
      { key: 'JUMLAH RESEP TPN/IV ADMIXTURE RAWAT INAP', label: 'Jumlah Resep TPN/IV Admixture Rawat Inap', type: 'number' },
      { key: 'JUMLAH PASIEN HEMODEALISA', label: 'Jumlah Pasien Hemodealisa', type: 'number' },
      { key: 'JUMLAH RESEP PASIEN PULANG', label: 'Jumlah Resep Pasien Pulang', type: 'number' },
      { key: 'JUMLAH PASIEN KONSELING', label: 'Jumlah Pasien Konseling', type: 'number' }
    ]
  },

  'UPSS': {
    label: 'UPSS',
    fields: [
      { key: 'TANGGAL INPUT LAPORAN', label: 'Tanggal Input Laporan', type: 'date' },
      { key: 'JADWAL SHIFT', label: 'Jadwal Shift', type: 'select', options: SHIFT_OPTIONS },
      { key: 'PETUGAS 1', label: 'Petugas 1', type: 'staff' },
      { key: 'PETUGAS 2', label: 'Petugas 2', type: 'staff' },
      { key: 'JUMLAH PASIEN KEMOTERAPI', label: 'Jumlah Pasien Kemoterapi', type: 'number' },
      { key: 'JUMLAH SEDIAAN IV ADMIXTURE SITOSTATIKA', label: 'Jumlah Sediaan IV Admixture Sitostatika', type: 'number' },
      { key: 'JUMLAH SEDIAAN IV ADMIXTURE TPN', label: 'Jumlah Sediaan IV Admixture TPN', type: 'number' },
      { key: 'JUMLAH SEDIAAN IV ADMIXTURE ELEKTROLIT PEKAT', label: 'Jumlah Sediaan IV Admixture Elektrolit Pekat', type: 'number' },
      { key: 'JUMLAH PASIEN RUANGAN PICU', label: 'Jumlah Pasien Ruangan PICU', type: 'number' },
      { key: 'JUMLAH PASIEN RUANGAN PERINATOLOGI', label: 'Jumlah Pasien Ruangan Perinatologi', type: 'number' },
      { key: 'JUMLAH PASIEN RUANGAN ENGGANG 2 ANAK', label: 'Jumlah Pasien Ruangan Enggang 2 Anak', type: 'number' },
      { key: 'JUMLAH PASIEN RUANGAN VIP PUNAI 1', label: 'Jumlah Pasien Ruangan VIP Punai 1', type: 'number' },
      { key: 'JUMLAH PASIEN RUANGAN INTERMEDIATE(UPSS)', label: 'Jumlah Pasien Ruangan Intermediate (UPSS)', type: 'number' }
    ]
  },

  // TODO: lengkapi field-nya begitu header DEPO TERPADU RAWAT JALAN dikirim.
  // Sementara ruangan ini akan muncul di daftar tapi ditandai "Segera Hadir".
  'DEPO TERPADU RAWAT JALAN': {
    label: 'Depo Terpadu Rawat Jalan',
    fields: []
  }
};
