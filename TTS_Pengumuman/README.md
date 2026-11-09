# VoiceAnnounce - Pengumuman Suara Perpustakaan (PHP XAMPP Edition)

Aplikasi Web Text-to-Speech (TTS) berbasis **PHP Murni + Google Gemini AI** yang dirancang khusus untuk berjalan langsung di **XAMPP (Apache)** tanpa perlu menginstal Node.js atau membuka terminal!

---

## 🚀 Fitur Lengkap

1. **🎙️ Google Gemini TTS Audio**: Suara penyiar alami berbahasa Indonesia dengan 5 karakter suara:
   - **Kore** (Wanita - Lembut, sejuk, santun, disarankan untuk perpustakaan)
   - **Zephyr** (Pria - Hangat & bersahabat)
   - **Puck** (Pria - Ceria & energetik)
   - **Fenrir** (Pria - Berwibawa & formal)
   - **Charon** (Netral - Jernih & objektif)
2. **🔔 Chime Lonceng Ding-Dong Perpustakaan**: Suara lonceng pembuka khas pengumuman perpustakaan (Web Audio API real-time synthesis) yang digabungkan langsung secara otomatis ke file audio WAV!
3. **✨ AI Text Refine (Sempurnakan Naskah)**: Memperbaiki dan menyelaraskan naskah pengumuman secara otomatis menggunakan Google Gemini AI sesuai gaya nada yang dipilih.
4. **📋 Template Naskah Cepat**: Pilihan preset naskah siap pakai (Penutupan 5 Menit, Ketenangan Ruang Baca, Penutupan Sirkulasi, Barang Tertinggal, Undangan Workshop).
5. **🎛️ Pemutar Audio Lengkap**:
   - Play, Pause, Seek bar interaktif, pengatur kecepatan putar (0.85x, 1.0x, 1.15x), dan volume slider.
6. **💾 Arsip & Riwayat Audio Tersimpan**:
   - File WAV disimpan secara otomatis ke folder `/saved_audio` di komputer Anda.
   - Panel riwayat lengkap dengan fitur putar langsung, unduh file WAV, dan hapus.
7. **⚙️ Pengaturan API Key dari Tampilan Web**:
   - Anda dapat memasukkan Gemini API Key langsung melalui modal pengaturan di web tanpa perlu mengedit kode program secara manual.

---

## 🛠️ Cara Menjalankan di XAMPP

### Langkah 1: Pindahkan / Salin Folder ke `htdocs`
Salin seluruh isi folder `php-version` ini ke dalam folder `htdocs` XAMPP Anda:
```
C:\xampp\htdocs\Project_TTS_Pengumuman
```
*(Sehingga di dalam `C:\xampp\htdocs\Project_TTS_Pengumuman` terdapat file `index.php`, `api.php`, `config.php`, dan folder `saved_audio`).*

### Langkah 2: Nyalakan Apache di XAMPP
1. Buka aplikasi **XAMPP Control Panel**.
2. Klik tombol **Start** pada baris **Apache** (hingga indikator berwarna hijau).

### Langkah 3: Buka di Browser
Buka browser favorit Anda (Google Chrome, Microsoft Edge, dll) dan akses:
👉 **http://localhost/Project_TTS_Pengumuman/**

### Langkah 4: Masukkan Gemini API Key
1. Klik tombol **Pengaturan API** di pojok kanan atas aplikasi.
2. Masukkan API Key Anda (dapat diperoleh secara gratis di [Google AI Studio](https://aistudio.google.com/apikey)).
3. Klik **Simpan Pengaturan**.

Selesai! Aplikasi siap digunakan secara penuh.

