// =========================================================
// KONFIGURASI APLIKASI
// =========================================================

// Ganti dengan URL Apps Script Anda
const API_URL = 'https://script.google.com/macros/s/AKfycbygy4H-37686KMD_SQhTZv64R9eJDBP-hDxO0sO3ydhNuNMVfutC7TOb1e2ZOp_lNM6/exec';

// ROOM ADMIN
const ADMIN_ROOM = 'admin';

// DAFTAR RUANGAN - PASTIKAN SAMA DENGAN KEY DI ROOMS
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
// KONFIGURASI RUANGAN (KEY SAMA PERSIS DENGAN HEADER SPREADSHEET)
// =========================================================
const ROOMS = {
  // DEPO FARMASI IGD
  depo_igd: {
    label: 'DEPO FARMASI IGD',
    staffColumns: 3,
    fields: [
      { key: 'TANGGAL_INPUT_LAPORAN', label: 'Tanggal Input Laporan', type: 'date' },
      { key: 'JADWAL_SHIFT', label: 'Jadwal Shift', type: 'select', options: ['Pagi', 'Siang', 'Malam'] },
      { key: 'NAMA_PETUGAS_IGD_1', label: 'Nama Petugas IGD 1', type: 'staff' },
      { key: 'NAMA_PETUGAS_IGD_2', label: 'Nama Petugas IGD 2', type: 'staff' },
      { key: 'NAMA_PETUGAS_IGD_3', label: 'Nama Petugas IGD 3', type: 'staff' },
      { key: 'JUMLAH_RESEP_TERLAYANI', label: 'Jumlah Resep Terlayani', type: 'number' },
      { key: 'JUMLAH_RESEP_ELEKTROLIT_PEKAT', label: 'Jumlah Resep Elektrolit Pekat', type: 'number' },
      { key: 'JUMLAH_RESEP_TPN', label: 'Jumlah Resep TPN', type: 'number' },
      { key: 'JUMLAH_RESEP_RACIKAN_PUYER', label: 'Jumlah Resep Racikan (Puyer)', type: 'number' },
      { key: 'JUMLAH_PASIEN_TERTAHAN_DI_IGD', label: 'Jumlah Pasien Tertahan di IGD', type: 'number' },
      { key: 'JUMLAH_PASIEN_PINDAH_RUANG_RAWAT_INAP', label: 'Jumlah Pasien Pindah Ruang Rawat Inap', type: 'number' },
      { key: 'JUMLAH_PASIEN_KODE_MERAH', label: 'Jumlah Pasien Kode Merah', type: 'number' },
      { key: 'JUMLAH_TAMBAHAN_RESEP_RAWAT_INAP', label: 'Jumlah Tambahan Resep Rawat Inap', type: 'number' },
      { key: 'JUMLAH_RESEP_RACIKAN_SALEP_CREAM', label: 'Jumlah Resep Racikan (Salep/Cream)', type: 'number' },
      { key: 'JUMLAH_PASIEN_PULANG', label: 'Jumlah Pasien Pulang', type: 'number' }
    ]
  },
  
  // DEPO FARMASI IBS
  depo_ibs: {
    label: 'DEPO FARMASI IBS',
    staffColumns: 2,
    fields: [
      { key: 'TANGGAL_INPUT_LAPORAN_IBS', label: 'Tanggal Input Laporan IBS', type: 'date' },
      { key: 'JADWAL_SHIFT', label: 'Jadwal Shift', type: 'select', options: ['Pagi', 'Siang', 'Malam'] },
      { key: 'NAMA_PETUGAS_IBS_1', label: 'Nama Petugas IBS 1', type: 'staff' },
      { key: 'NAMA_PETUGAS_IBS_2', label: 'Nama Petugas IBS 2', type: 'staff' },
      { key: 'JUMLAH_OPERASI_ELEKTIF', label: 'Jumlah Operasi Elektif', type: 'number' },
      { key: 'JUMLAH_OPERASI_CITO', label: 'Jumlah Operasi Cito', type: 'number' },
      { key: 'JUMLAH_OPERASI_MATA', label: 'Jumlah Operasi Mata', type: 'number' },
      { key: 'STATUS_PASIEN_BPJS_SHIFT', label: 'Status Pasien BPJS/Shift', type: 'number' },
      { key: 'STATUS_PASIEN_CASH_SHIFT', label: 'Status Pasien Cash/Shift', type: 'number' },
      { key: 'STATUS_PASIEN_PERUSAHAAN', label: 'Status Pasien Perusahaan', type: 'number' }
    ]
  },
  
  // DEPO FARMASI IRNA 1 dan Paviliun
  depo_irna1_paviliun: {
    label: 'DEPO FARMASI IRNA 1 dan Paviliun',
    staffColumns: 2,
    fields: [
      { key: 'TANGGAL_INPUT_LAPORAN', label: 'Tanggal Laporan', type: 'date' },
      { key: 'JADWAL_SHFT', label: 'Jadwal Shift', type: 'select', options: ['Pagi', 'Siang', 'Malam'] },
      { key: 'PETUGAS_PAGI_1', label: 'Petugas Pagi 1', type: 'staff' },
      { key: 'PETUGAS_PAGI_2', label: 'Petugas Pagi 2', type: 'staff' },
      { key: 'PETUGAS_PAGI_3', label: 'Petugas Pagi 3', type: 'staff' },
      { key: 'PETUGAS_PAGI_4', label: 'Petugas Pagi 4', type: 'staff' },
      { key: 'PETUGAS_PAGI_5', label: 'Petugas Pagi 5', type: 'staff' },
      { key: 'PETUGAS_MIDEL_1', label: 'Petugas Midel 1', type: 'staff' },
      { key: 'PETUGAS_MIDEL_2', label: 'Petugas Midel 2', type: 'staff' },
      { key: 'PETUGAS_MIDEL_3', label: 'Petugas Midel 3', type: 'staff' },
      { key: 'PETUGAS_MIDEL_4', label: 'Petugas Midel 4', type: 'staff' },
      { key: 'PETUGAS_MIDEL_5', label: 'Petugas Midel 5', type: 'staff' },
      { key: 'PETUGAS_MIDEL_6', label: 'Petugas Midel 6', type: 'staff' },
      { key: 'JUMLAH_RESEP_PER_SHIFT', label: 'Jumlah Resep Per-Shift', type: 'number' },
      { key: 'JUMLAH_RESEP_RACIKAN_PUYER', label: 'Jumlah Resep Racikan (Puyer)', type: 'number' },
      { key: 'JUMLAH_RESEP_RACIKAN_SALEP_CREAM', label: 'Jumlah Resep Racikan (Salep/Cream)', type: 'number' },
      { key: 'JUMLAH_RESEP_ELEKTROLIT_PEKAT', label: 'Jumlah Resep Elektrolit Pekat', type: 'number' },
      { key: 'JUMLAH_RESEP_TPN_IV_ADMIXTURE_RAWAT_INAP', label: 'Jumlah Resep TPN/IV Admixture Rawat Inap', type: 'number' },
      { key: 'JUMLAH_PASIEN_HEMODEALISA', label: 'Jumlah Pasien Hemodealisa', type: 'number' },
      { key: 'JUMLAH_RESEP_PASIEN_PULANG', label: 'Jumlah Resep Pasien Pulang', type: 'number' },
      { key: 'JUMLAH_PASIEN_KONSELING', label: 'Jumlah Pasien Konseling', type: 'number' }
    ]
  },
  
  // DEPO FARMASI RAWAT JALAN
  depo_rawat_jalan: {
    label: 'DEPO FARMASI RAWAT JALAN',
    staffColumns: 19,
    fields: [
      { key: 'TANGGAL_INPUT_LAPORAN', label: 'Tanggal Laporan', type: 'date' }
    ].concat(
      Array.from({length: 19}, (_, i) => ({ key: `PETUGAS_${i + 1}`, label: `Petugas ${i + 1}`, type: 'staff' })),
      [
        { key: 'JAM_AWAL_RESEP_POLIKLINIK_PAGI', label: 'Jam Awal Resep Poliklinik Pagi', type: 'time' },
        { key: 'JAM_AKHIR_RESEP_POLIKLINIK_PAGI', label: 'Jam Akhir Resep Poliklinik Pagi', type: 'time' },
        { key: 'RESEP_POLIKLINIK_PERTAMA_MASUK', label: 'Resep Poliklinik Pertama Masuk', type: 'time' },
        { key: 'RESEP_POLIKLINIK_TERAKHIR_MASUK', label: 'Resep Poliklinik Terakhir Masuk', type: 'time' },
        { key: 'JUMLAH_KEGIATAN_KONSELING', label: 'Jumlah Kegiatan Konseling', type: 'number' },
        { key: 'JUMLAH_TOTAL_RESEP_HARIAN', label: 'Jumlah Total Resep Harian', type: 'number' },
        { key: 'JUMLAH_RESEP_RACIKAN_POLI_PAGI', label: 'Jumlah Resep Racikan (Poli Pagi)', type: 'number' },
        { key: 'JUMLAH_RESEP_RACIKAN_POLI_SORE', label: 'Jumlah Resep Racikan (Poli Sore)', type: 'number' },
        { key: 'JAM_AWAL_RESEP_POLIKLINIK_SORE', label: 'Jam Awal Resep Poliklinik Sore', type: 'time' },
        { key: 'JAM_AKHIR_RESEP_POLIKLINIK_SORE', label: 'Jam Akhir Resep Poliklinik Sore', type: 'time' },
        { key: 'DAFTAR_OBAT_TIDAK_TERLAYANI', label: 'Daftar Obat Tidak Terlayani', type: 'textarea' }
      ]
    )
  },
  
  // DEPO FARMASI RAWAT JALAN MATERNITAS
  depo_rawat_jalan_maternitas: {
    label: 'DEPO FARMASI RAWAT JALAN MATERNITAS',
    staffColumns: 3,
    fields: [
      { key: 'TANGGAL_INPUT_LAPORAN', label: 'Tanggal Laporan', type: 'date' }
    ].concat(
      Array.from({length: 3}, (_, i) => ({ key: `PETUGAS_${i + 1}`, label: `Petugas ${i + 1}`, type: 'staff' })),
      [
        { key: 'JAM_AWAL_RESEP_POLIKLINIK_PAGI', label: 'Jam Awal Resep Poliklinik Pagi', type: 'time' },
        { key: 'JAM_AKHIR_RESEP_POLIKLINIK_PAGI', label: 'Jam Akhir Resep Poliklinik Pagi', type: 'time' },
        { key: 'RESEP_POLIKLINIK_PERTAMA_MASUK', label: 'Resep Poliklinik Pertama Masuk', type: 'time' },
        { key: 'RESEP_POLIKLINIK_TERAKHIR_MASUK', label: 'Resep Poliklinik Terakhir Masuk', type: 'time' },
        { key: 'JUMLAH_KEGIATAN_KONSELING', label: 'Jumlah Kegiatan Konseling', type: 'number' },
        { key: 'JUMLAH_TOTAL_RESEP_HARIAN', label: 'Jumlah Total Resep Harian', type: 'number' },
        { key: 'JUMLAH_RESEP_RACIKAN_POLI_PAGI', label: 'Jumlah Resep Racikan (Poli Pagi)', type: 'number' },
        { key: 'JUMLAH_RESEP_RACIKAN_POLI_SORE', label: 'Jumlah Resep Racikan (Poli Sore)', type: 'number' },
        { key: 'JAM_AWAL_RESEP_POLIKLINIK_SORE', label: 'Jam Awal Resep Poliklinik Sore', type: 'time' },
        { key: 'JAM_AKHIR_RESEP_POLIKLINIK_SORE', label: 'Jam Akhir Resep Poliklinik Sore', type: 'time' },
        { key: 'DAFTAR_OBAT_TIDAK_TERLAYANI', label: 'Daftar Obat Tidak Terlayani', type: 'textarea' }
      ]
    )
  },
  
  // DEPO FARMASI IRIN DAN MATERNITAS
  depo_irin_maternitas: {
    label: 'DEPO FARMASI IRIN DAN MATERNITAS',
    staffColumns: 8,
    fields: [
      { key: 'TANGGAL_INPUT_LAPORAN', label: 'Tanggal Laporan', type: 'date' },
      { key: 'JADWAL_SHIFT', label: 'Jadwal Shift', type: 'select', options: ['Pagi', 'Siang', 'Malam'] }
    ].concat(
      Array.from({length: 8}, (_, i) => ({ key: `PETUGAS_${i + 1}`, label: `Petugas ${i + 1}`, type: 'staff' })),
      [
        { key: 'JUMLAH_RESEP', label: 'Jumlah Resep', type: 'number' },
        { key: 'RESEP_OBAT_PULANG', label: 'Resep Obat Pulang', type: 'number' },
        { key: 'RESEP_RACIKAN', label: 'Resep Racikan', type: 'number' },
        { key: 'RESEP_ELEKTROLIT_PEKAT', label: 'Resep Elektrolit Pekat', type: 'number' },
        { key: 'JUMLAH_RESEP_TPN', label: 'Jumlah Resep TPN', type: 'number' }
      ]
    )
  },
  
  // DEPO FARMASI CATHLAB
  depo_cathlab: {
    label: 'DEPO FARMASI CATHLAB',
    staffColumns: 1,
    fields: [
      { key: 'TANGGAL_INPUT_LAPORAN', label: 'Tanggal Laporan', type: 'date' },
      { key: 'PETUGAS_1', label: 'Petugas 1', type: 'staff' },
      { key: 'JADWAL_SHIFT', label: 'Jadwal Shift', type: 'select', options: ['Pagi', 'Siang'] },
      { key: 'JUMLAH_PASIEN', label: 'Jumlah Pasien', type: 'number' }
    ]
  },
  
    // DEPO FARMASI ONKOLOGI TERPADU
  depo_onkologi_terpadu: {
    label: 'DEPO FARMASI ONKOLOGI TERPADU',
    staffColumns: 4, // Ubah dari 3 menjadi 4
    fields: [
      { key: 'TANGGAL_INPUT_LAPORAN', label: 'Tanggal Laporan', type: 'date' },
      { key: 'JADWAL_SHIFT', label: 'Jadwal Shift', type: 'select', options: ['Pagi', 'Siang'] },
      { key: 'PETUGAS_1', label: 'Petugas 1', type: 'staff' },
      { key: 'PETUGAS_2', label: 'Petugas 2', type: 'staff' },
      { key: 'PETUGAS_3', label: 'Petugas 3', type: 'staff' },
      { key: 'PETUGAS_4', label: 'Petugas 4', type: 'staff' }, // <-- TAMBAHAN BARU
      { key: 'JUMLAH_PASIEN_KEMOTERAPI', label: 'Jumlah Pasien Kemoterapi', type: 'number' },
      { key: 'JUMLAH_SEDIAAN_IV_ADMIXTURE_SITOSTATIKA', label: 'Jumlah Sediaan IV Admixture Sitostatika', type: 'number' },
      { key: 'JUMLAH_SEDIAAN_IV_ADMIXTURE_TPN', label: 'Jumlah Sediaan IV Admixture TPN', type: 'number' },
      { key: 'JUMLAH_SEDIAAN_IV_ADMIXTURE_ELEKTROLIT_PEKAT', label: 'Jumlah Sediaan IV Admixture Elektrolit Pekat', type: 'number' },
      { key: 'JUMLAH_PASIEN_RUANGAN_PICU', label: 'Jumlah Pasien Ruangan PICU', type: 'number' },
      { key: 'JUMLAH_PASIEN_RUANGAN_PERINATOLOGI', label: 'Jumlah Pasien Ruangan Perinatologi', type: 'number' },
      { key: 'JUMLAH_PASIEN_RUANGAN_ENGGANG_2_ANAK', label: 'Jumlah Pasien Ruangan Enggang 2 Anak', type: 'number' },
      { key: 'JUMLAH_PASIEN_RUANGAN_VIP_PUNAI_1', label: 'Jumlah Pasien Ruangan VIP Punai 1', type: 'number' },
      { key: 'JUMLAH_PASIEN_RUANGAN_INTERMEDIATE_UPSS', label: 'Jumlah Pasien Ruangan Intermediate (UPSS)', type: 'number' }
    ]
  }

// =========================================================
// FUNGSI VALIDASI
// =========================================================
function isValidRoom(roomKey) {
  if (!roomKey) return false;
  if (roomKey === ADMIN_ROOM) return true;
  return ROOMS.hasOwnProperty(roomKey);
}

// DEBUG
console.log('✅ CONFIG LOADED - ROOMS:', Object.keys(ROOMS));
