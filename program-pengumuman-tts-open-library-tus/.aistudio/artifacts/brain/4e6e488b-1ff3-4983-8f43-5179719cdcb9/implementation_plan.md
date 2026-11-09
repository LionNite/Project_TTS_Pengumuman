# Fitur Multi-Bahasa, Perbaikan Hapus Audio & Branding VoiceAnnounce (Revisi)

Rencana implementasi menyeluruh yang mencakup penambahan opsi pengaturan bahasa (**Bahasa Indonesia** dan **English**) di dalam modal Settings beserta penerapannya ke seluruh antarmuka aplikasi, perbaikan tombol hapus berkas audio dengan konfirmasi inline terintegrasi, perubahan label menjadi **"Audio tersimpan"**, standarisasi tombol **"Save"** & **"Saved"**, serta pembaruan nama brand menjadi **"VoiceAnnounce"**.

## User Review & Critical Decisions

> [!IMPORTANT]
> Penyesuaian berdasarkan masukan revisi pengguna:

- **Opsi Pilihan Bahasa di Modal Settings**: Menambahkan selector bahasa di dalam Settings dengan 2 opsi jelas:
  1. **Bahasa Indonesia** (Default)
  2. **English**
- **Adaptasi Bahasa ke Seluruh Tampilan Aplikasi**: Seluruh label antarmuka (Bilah Sisi Kiri, Workspace Tengah, AudioPlayer, Bilah Sisi Kanan / Audio tersimpan, Scenario Library Modal, dan Settings Modal) akan langsung berubah dinamis sesuai bahasa yang dipilih tanpa perlu memuat ulang halaman, dan pilihan bahasa tersimpan di `localStorage`.
- **Perbaikan Tombol Delete Audio (Konfirmasi Inline)**: Menggantikan fungsi `window.confirm()` yang terblokir di iframe dengan konfirmasi inline langsung pada kartu audio tersimpan (*"Hapus?"* / *"Ya"* / *"Batal"*).
- **Perubahan Label Panel Audio**: Mengganti teks judul panel dari *"Riwayat Audio"* menjadi **"Audio tersimpan"** (atau *"Saved Audio"* dalam mode English).
- **Standarisasi Tombol Simpan**: Mengubah teks tombol simpan audio di AudioPlayer menjadi:
  - Belum tersimpan: **"Save"**
  - Sudah tersimpan: **"Saved"**
- **Pembaruan Branding**: Mengubah nama aplikasi dari *"VoxAnnounce"* menjadi **"VoiceAnnounce"** di bilah navigasi dan header dokumen peramban.

---

## 1. Overview & Core Concept

- **Tujuan Utama**:
  1. Memberikan fleksibilitas dwibahasa (bilingual) bagi staf perpustakaan internasional maupun lokal melalui pengaturan bahasa yang terpusat.
  2. Menyelesaikan kendala teknis kegagalan tombol hapus audio akibat pemblokiran modal dialog di lingkungan iframe.
  3. Memastikan teks antarmuka rapi, konsisten, dan mudah dipahami.
- **Nilai Tambah**: Aksesibilitas lebih luas untuk pengguna berbahasa Inggris atau Indonesia dengan penyimpanan preferensi otomatis.

---

## 2. User Experience & Visual Design

### Alur Pengguna (User Flows)
1. **Mengubah Bahasa via Settings**:
   - Pengguna mengklik menu **Settings** di bilah sisi kiri.
   - Di bagian atas modal Settings, terdapat kartu pilihan bahasa:
     - Tombol opsi **"Bahasa Indonesia"** (ikon bendera/bahasa ID)
     - Tombol opsi **"English"** (ikon bendera/bahasa EN)
   - Memilih salah satu opsi langsung memperbarui seluruh teks pada aplikasi secara instan dan menyimpannya di browser.
2. **Kamus Bahasa Terstruktur (i18n Dictionary)**:
   - Membuat modul terjemahan terpadu (`src/utils/translations.ts`) yang mencakup semua bagian:
     - *Sidebar Kiri*: Navigasi (TTS Studio, Scenario Library, Settings), status koneksi AI, informasi branding.
     - *Center Workspace*: Judul studio, template skenario cepat, form naskah, tombol aksi (Rapikan AI, Simpan Naskah, Salin), konfigurasi suara & intonasi, tombol generate suara & reset.
     - *Audio Player*: Status siaran on-air, lonceng pembuka (*Opening Chime*), kontrol pemutar, tombol **Save** / **Saved**, dan unduh.
     - *Bilah Kanan*: Judul panel **Audio tersimpan** (*Saved Audio*), pencarian, status kosong, pemutar mini, dan konfirmasi hapus.
     - *Scenario Library*: Judul modal, tombol **Tambah Skenario**, pencarian, filter, dan tombol **Gunakan Template**.
3. **Penghapusan Audio Tersimpan**:
   - Mengklik ikon hapus pada salah satu audio tersimpan akan memunculkan konfirmasi inline:
     - Mode ID: *"Hapus?"* -> Tombol merah *"Ya"* & Tombol *"Batal"*
     - Mode EN: *"Delete?"* -> Tombol merah *"Yes"* & Tombol *"Cancel"*
   - Audio yang sedang diputar akan berhenti otomatis saat item tersebut dihapus.

---

## 3. Technical Architecture & Data Strategy

### Struktur Modul & Alur Data Bahasa

```
                       ┌───────────────────────────────┐
                       │     src/utils/storage.ts      │
                       │   (getStoredLanguage / set)   │
                       └───────────────┬───────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                   App.tsx                                   │
│            State: language ('id' | 'en') & helper t = translations[lang]    │
├─────────────────────┬───────────────────────────────┬───────────────────────┤
│     LeftSidebar     │        CenterWorkspace        │      RightSidebar     │
│  - VoiceAnnounce    │  - Announcement Studio        │  - Audio tersimpan    │
│  - TTS Studio       │  - Script Editor              │  - Inline Delete:     │
│  - Scenario Library │  - AudioPlayer: Save / Saved  │    "Hapus?" "Ya" "Btl"│
│  - Settings         │                               │                       │
└─────────────────────┴───────────────┬───────────────┴───────────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
┌───────────────────────────┐                   ┌───────────────────────────┐
│     SettingsModal.tsx     │                   │  ScenarioLibraryModal.tsx │
│  ┌──────────────────────┐ │                   │  - Tambah Skenario        │
│  │ [Bahasa ID] [English]│ │                   │  - Gunakan Template       │
│  ├──────────────────────┤ │                   │  - Filter Dinamis         │
│  │ Manajemen Kategori   │ │                   └───────────────────────────┘
│  └──────────────────────┘ │
└───────────────────────────┘
```

### Rincian Modifikasi File:

1. `src/utils/translations.ts` (File Baru):
   - Kamus kamus dwibahasa lengkap untuk `id` dan `en`.
2. `src/utils/storage.ts`:
   - Tambahkan `getStoredLanguage(): 'id' | 'en'` dan `saveStoredLanguage(lang: 'id' | 'en')`.
3. `src/components/SettingsModal.tsx`:
   - Tambahkan segmen pilihan bahasa (Bahasa Indonesia & English) dengan highlight aktif merah/kuning.
   - Sesuaikan label modal sesuai bahasa aktif.
4. `src/components/RightSidebar.tsx`:
   - Ganti judul header menjadi **"Audio tersimpan"** (atau *"Saved Audio"* jika mode English).
   - Terapkan konfirmasi inline: `pendingDeleteId` untuk menghapus item tanpa `confirm()`.
5. `src/components/AudioPlayer.tsx`:
   - Gunakan teks **"Save"** (saat belum disimpan) dan **"Saved"** (saat tersimpan).
6. `src/components/LeftSidebar.tsx`:
   - Ubah branding aplikasi menjadi **"VoiceAnnounce"**.
   - Sesuaikan teks menu dan status dengan kamus bahasa.
7. `src/components/CenterWorkspace.tsx` & `src/components/ScenarioLibraryModal.tsx`:
   - Hubungkan semua teks, tombol, tooltip, dan pesan dengan terjemahan bahasa aktif.
8. `src/App.tsx`:
   - Hubungkan state bahasa dan teruskan objek terjemahan atau pengubah bahasa ke seluruh komponen terkait.
9. `index.html`:
   - Sinkronkan `<title>` menjadi `"VoiceAnnounce - TTS Announcement Generator Dashboard"`.
