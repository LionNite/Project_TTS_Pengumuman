import { VoiceOption, ToneStyle, PresetAnnouncement } from './types';

export const INITIAL_ANNOUNCEMENT = `Perhatian kepada seluruh pengunjung perpustakaan. Diberitahukan bahwa layanan perpustakaan akan ditutup dalam waktu 5 menit lagi, sehubungan dengan adanya kegiatan yang akan berlangsung. Bagi para pengunjung, dimohon untuk dapat mulai merapikan barang bawaan serta fasilitas yang digunakan. Kami memohon maaf yang sebesar-besarnya atas ketidaknyamanan ini. Terima kasih atas pengertian dan kerja sama Anda.`;

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Wanita',
    toneDesc: 'Suara lembut, sejuk, dan santun. Pilihan terbaik untuk suasana hening perpustakaan.',
    badge: 'Disarankan',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Pria',
    toneDesc: 'Suara hangat, bersahabat, dan menenangkan dengan artikulasi ramah.',
    badge: 'Populer',
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Pria',
    toneDesc: 'Suara segar, ramah, dan energetik untuk pengumuman santai & interaktif.',
    badge: 'Energetik',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Pria',
    toneDesc: 'Suara dalam, berwibawa, dan resmi untuk pengumuman protokoler & formal.',
    badge: 'Formal',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Netral',
    toneDesc: 'Suara netral, jernih, dan tenang dengan intonasi objektif & profesional.',
    badge: 'Jernih',
  },
];

export const TONE_STYLES: ToneStyle[] = [
  {
    id: 'formal',
    label: 'Formal',
    description: 'Baku, jelas, tertata rapi, dan berwibawa standar protokol resmi.',
    promptStyle:
      'Formal, jelas, santun, berwibawa, anggun, dengan jeda yang rapi dan teratur untuk pengumuman resmi',
  },
  {
    id: 'casual',
    label: 'Casual (Santai & Ramah)',
    description: 'Akrab, bersahabat, seperti menyapa rekan kerja atau mahasiswa.',
    promptStyle:
      'Hangat, kasual, ramah tersenyum, bersahabat, artikulasi jelas, merdu dan menyejukkan hati',
  },
  {
    id: 'energetic',
    label: 'Energetic (Ceria & Bersemangat)',
    description: 'Penuh antusiasme, tempo dinamis, memikat perhatian pendengar.',
    promptStyle:
      'Energetik, bersemangat, ceria, dinamis, jelas, dan memikat perhatian pengunjung dengan sopan',
  },
  {
    id: 'professional',
    label: 'Professional (Sopan & Lembut)',
    description: 'Intonasi santun, teduh, tempo tenang dan penuh empati perpustakaan.',
    promptStyle:
      'Sopan, sangat lembut, tenang, profesional, santun, ramah, dan penuh empati untuk perpustakaan',
  },
  {
    id: 'calm_whisper',
    label: 'Calm & Gentle (Bisikan Hening)',
    description: 'Volume lirih nan halus menjaga kesunyian ruang baca yang khusyuk.',
    promptStyle:
      'Lirih, sangat tenang dan halus, berbisik santun dan menjaga kesunyian ruang baca perpustakaan',
  },
];

export const PRESET_ANNOUNCEMENTS: PresetAnnouncement[] = [
  {
    id: 'library-closing-5min',
    title: 'Penutupan 5 Menit',
    category: 'Penutupan Layanan',
    text: INITIAL_ANNOUNCEMENT,
    recommendedVoice: 'Kore',
    recommendedStyle: 'professional',
  },
  {
    id: 'keep-quiet',
    title: 'Ketenangan Ruang Baca',
    category: 'Tata Tertib',
    text: `Selamat siang pengunjung perpustakaan yang terhormat. Demi kenyamanan bersama dalam membaca dan mencari referensi, kami mengimbau seluruh pengunjung untuk tetap menjaga ketenangan serta menyetel perangkat komunikasi dalam mode senyap. Terima kasih atas kerja sama dan kepedulian Anda.`,
    recommendedVoice: 'Kore',
    recommendedStyle: 'professional',
  },
  {
    id: 'borrowing-closing',
    title: 'Penutupan Sirkulasi',
    category: 'Sirkulasi & Peminjaman',
    text: `Pemberitahuan kepada seluruh pengunjung perpustakaan. Layanan sirkulasi peminjaman dan perpanjangan buku akan segera ditutup dalam 15 menit. Bagi Anda yang ingin meminjam buku untuk dibawa pulang, dimohon segera menuju loket sirkulasi utama. Terima kasih.`,
    recommendedVoice: 'Zephyr',
    recommendedStyle: 'casual',
  },
  {
    id: 'lost-and-found',
    title: 'Barang Tertinggal',
    category: 'Informasi Umum',
    text: `Perhatian kepada seluruh pengunjung perpustakaan. Telah ditemukan sebuah dompet kartu di area meja baca lantai dua. Bagi pengunjung yang merasa kehilangan, dipersilakan untuk mendatangi meja resepsionis dengan membawa bukti identitas. Terima kasih.`,
    recommendedVoice: 'Kore',
    recommendedStyle: 'formal',
  },
  {
    id: 'workshop-event',
    title: 'Undangan Workshop Literasi',
    category: 'Event & Kegiatan',
    text: `Halo rekan-rekan mahasiswa dan pengunjung perpustakaan. Workshop penulisan karya ilmiah dan sitasi digital akan segera dimulai dalam 10 menit di Ruang Multimedia lantai tiga. Peserta yang telah mendaftar dipersilakan memasuki ruangan.`,
    recommendedVoice: 'Puck',
    recommendedStyle: 'energetic',
  },
];
