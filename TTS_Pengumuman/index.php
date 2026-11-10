<?php
require_once __DIR__ . '/config.php';
$config = get_app_config();
$hasKey = !empty(trim(isset($config['gemini_api_key']) ? $config['gemini_api_key'] : ''));
$initialLang = isset($config['language']) ? $config['language'] : 'id';
$currentStorageDir = get_saved_audio_dir();
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($initialLang) ?>">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VoiceAnnounce - Universal Voice Announcement System</title>
  
  <!-- Google Fonts: Space Grotesk & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Space+Grotesk:wght@500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              red: '#B11116',
              redHover: '#8F0E12',
              yellow: '#FFC800',
              yellowHover: '#E5B400',
              pink: '#FF94B8',
              lavender: '#A594F9',
              green: '#A3E635',
              dark: '#121212',
            }
          },
          fontFamily: {
            sans: ['"Space Grotesk"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          },
          boxShadow: {
            'brutal-sm': '2px 2px 0px #000000',
            'brutal': '4px 4px 0px #000000',
            'brutal-lg': '6px 6px 0px #000000',
            'brutal-xl': '8px 8px 0px #000000',
          }
        }
      }
    }
  </script>
  
  <style>
    /* Neo-Brutalist Grid Background */
    body {
      background-color: #F8F6F0;
      background-image: 
        linear-gradient(to right, rgba(0, 0, 0, 0.07) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.07) 1px, transparent 1px);
      background-size: 26px 26px;
    }
    
    .brutal-btn {
      transition: all 0.12s ease-in-out;
    }
    .brutal-btn:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0px #000000;
    }
    .brutal-btn:active {
      transform: translate(2px, 2px);
      box-shadow: 1px 1px 0px #000000;
    }

    .brutal-card {
      transition: all 0.15s ease-in-out;
    }

    .custom-scroll::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    .custom-scroll::-webkit-scrollbar-track {
      background: #FFFFFF;
      border-left: 2px solid #000000;
    }
    .custom-scroll::-webkit-scrollbar-thumb {
      background: #FFC800;
      border: 2px solid #000000;
    }
    .custom-scroll::-webkit-scrollbar-thumb:hover {
      background: #B11116;
    }
  </style>
</head>
<body class="text-brand-dark min-h-screen flex flex-col font-sans selection:bg-brand-yellow selection:text-black">

  <!-- TOP NEO-BRUTALIST NAVBAR -->
  <header class="bg-white border-b-3 border-black sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      
      <!-- Brand Logo / Badge (Neo-Brutalist: VOICE-ANNOUNCE badge) -->
      <div class="flex items-center space-x-3">
        <div class="px-3.5 py-1.5 bg-brand-yellow border-2 border-black shadow-brutal-sm font-mono font-extrabold text-sm tracking-tight flex items-center space-x-2">
          <span class="text-brand-red font-black">&lt;/&gt;</span>
          <span data-i18n="logoTag" class="font-extrabold tracking-wide">VOICE-ANNOUNCE</span>
        </div>
        <div class="hidden sm:flex flex-col justify-center">
          <p class="text-xs font-mono text-slate-600 font-medium" data-i18n="appSubtitle">Sistem Generator Pengumuman Suara Otomatis</p>
        </div>
      </div>

      <!-- Right Header Actions (Language Toggle, Status Badge, Settings Button) -->
      <div class="flex items-center space-x-3">
        
        <!-- Quick Language Toggle Pill -->
        <div class="flex items-center border-2 border-black bg-white shadow-brutal-sm overflow-hidden font-bold text-xs">
          <button 
            type="button" 
            onclick="switchLanguage('id')" 
            id="langBtn-id" 
            class="px-2.5 py-1.5 transition font-mono <?= $initialLang === 'id' ? 'bg-brand-red text-white' : 'text-black hover:bg-slate-100' ?>"
          >
            🇮🇩 ID
          </button>
          <div class="w-[2px] h-6 bg-black"></div>
          <button 
            type="button" 
            onclick="switchLanguage('en')" 
            id="langBtn-en" 
            class="px-2.5 py-1.5 transition font-mono <?= $initialLang === 'en' ? 'bg-brand-red text-white' : 'text-black hover:bg-slate-100' ?>"
          >
            🇬🇧 EN
          </button>
        </div>

        <!-- Status API Badge -->
        <div id="statusBadge" class="hidden md:flex items-center space-x-2 px-3 py-1.5 border-2 border-black shadow-brutal-sm font-mono text-xs font-bold bg-white">
          <span class="w-2.5 h-2.5 border border-black rounded-full <?= $hasKey ? 'bg-brand-green' : 'bg-brand-yellow' ?>"></span>
          <span id="statusBadgeText"><?= $hasKey ? 'AI SIAP' : 'KEY KOSONG' ?></span>
        </div>

        <!-- Tombol Pengaturan (Settings Button) -->
        <button 
          onclick="openSettingsModal()" 
          class="brutal-btn px-4 py-2 bg-brand-yellow hover:bg-brand-yellowHover text-black border-2 border-black shadow-brutal font-bold text-xs uppercase flex items-center space-x-2 cursor-pointer"
        >
          <i data-lucide="settings" class="w-4 h-4"></i>
          <span data-i18n="settingsBtn">Pengaturan</span>
        </button>

      </div>
    </div>
  </header>

  <!-- MAIN APP CONTAINER -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">

    <!-- LEFT & CENTER COLUMN (EDITOR & VOICE CONTROLS) -->
    <div class="lg:col-span-8 space-y-8">

      <!-- BANNER JIKA API KEY KOSONG -->
      <div id="apiKeyBanner" class="<?= $hasKey ? 'hidden' : '' ?> bg-brand-yellow border-3 border-black shadow-brutal p-5 flex items-start space-x-4">
        <div class="w-8 h-8 bg-brand-red text-white border-2 border-black flex items-center justify-center shrink-0">
          <i data-lucide="alert-triangle" class="w-5 h-5"></i>
        </div>
        <div class="flex-1 text-sm">
          <h4 class="font-extrabold uppercase text-black" data-i18n="apiKeyBannerTitle">Google Gemini API Key Belum Dikonfigurasi</h4>
          <p class="text-xs font-medium text-slate-800 mt-1" data-i18n="apiKeyBannerDesc">Untuk menghasilkan suara pengumuman, silakan masukkan API Key Gemini Anda di menu Pengaturan.</p>
          <button onclick="openSettingsModal()" class="mt-3 px-3 py-1.5 bg-black text-white hover:bg-slate-800 border-2 border-black font-mono font-bold text-xs uppercase brutal-btn cursor-pointer" data-i18n="apiKeyBannerBtn">
            Buka Pengaturan Sekarang &rarr;
          </button>
        </div>
      </div>

      <!-- MAIN SCRIPT EDITOR CARD -->
      <div class="bg-white border-3 border-black shadow-brutal-lg">
        
        <!-- Header Strip on Card -->
        <div class="bg-brand-red text-white p-3.5 border-b-3 border-black flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="w-3 h-3 bg-brand-yellow border border-black inline-block"></span>
            <span class="font-extrabold text-sm uppercase tracking-wider font-mono" data-i18n="editorHeader">Naskah Pengumuman Suara</span>
          </div>
          <button onclick="clearText()" class="text-xs font-mono font-bold bg-white text-black hover:bg-brand-yellow px-2.5 py-1 border-2 border-black shadow-brutal-sm cursor-pointer" data-i18n="resetBtn">
            RESET
          </button>
        </div>

        <!-- Template Strip With Customization / CRUD Button -->
        <div class="p-3.5 bg-[#FAF9F6] border-b-2 border-black flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-mono font-extrabold uppercase text-slate-700 mr-1" data-i18n="quickTemplates">TEMPLATE:</span>
            <div id="presetPillsContainer" class="flex flex-wrap gap-2">
              <!-- Dynamic Preset Buttons -->
            </div>
          </div>

          <!-- Tombol Kelola Template -->
          <button 
            type="button" 
            onclick="openTemplateManagerModal()" 
            class="px-2.5 py-1 bg-white hover:bg-brand-yellow text-black border-2 border-black shadow-brutal-sm font-mono text-xs font-bold uppercase flex items-center space-x-1.5 cursor-pointer"
          >
            <i data-lucide="folder-plus" class="w-3.5 h-3.5 text-brand-red"></i>
            <span data-i18n="manageTemplatesBtn">Kelola Template</span>
          </button>
        </div>

        <!-- Textarea Input Area -->
        <div class="p-5 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <label for="announcementText" class="text-xs font-extrabold uppercase font-mono tracking-wide text-black flex items-center space-x-1.5">
              <i data-lucide="edit-3" class="w-4 h-4 text-brand-red"></i>
              <span data-i18n="scriptLabel">Teks Naskah Pengumuman</span>
            </label>

            <div class="flex items-center space-x-2">
              <!-- Tombol Jadikan Template (Langsung buka popup kelola template dengan naskah, suara & intonasi terisi) -->
              <button 
                type="button" 
                id="makeTemplateBtn" 
                onclick="createTemplateFromCurrentScript()" 
                class="brutal-btn px-3 py-1 bg-white hover:bg-slate-100 text-black border-2 border-black shadow-brutal-sm font-bold text-xs uppercase flex items-center space-x-1.5 cursor-pointer"
                title="Simpan teks naskah saat ini langsung menjadi template skenario baru"
              >
                <i data-lucide="bookmark-plus" class="w-3.5 h-3.5 text-black"></i>
                <span data-i18n="makeTemplateBtn">Jadikan Template</span>
              </button>

              <!-- Tombol Sempurnakan dengan AI (Universal Prompt) -->
              <button 
                id="refineBtn" 
                type="button"
                onclick="refineTextWithAI()" 
                class="brutal-btn px-3 py-1 bg-brand-yellow hover:bg-brand-yellowHover text-black border-2 border-black shadow-brutal-sm font-bold text-xs uppercase flex items-center space-x-1.5 cursor-pointer"
              >
                <i data-lucide="sparkles" class="w-3.5 h-3.5 text-brand-red"></i>
                <span id="refineBtnText" data-i18n="polishWithAi">Sempurnakan dengan AI</span>
              </button>
            </div>
          </div>

          <textarea 
            id="announcementText" 
            rows="6" 
            class="w-full bg-[#FFFFFF] border-2 border-black p-4 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-[#FFFDF5] focus:ring-2 focus:ring-brand-red leading-relaxed resize-y"
            oninput="updateTextStats()"
            placeholder="Ketik teks pengumuman di sini..."
          ></textarea>

          <!-- Word & Time Statistics Counter -->
          <div class="flex flex-wrap items-center justify-between text-xs font-mono font-bold pt-2 border-t-2 border-black/10 gap-2">
            <div class="flex items-center space-x-4">
              <span><span id="charCount" class="text-brand-red font-extrabold">0</span> <span data-i18n="charsLabel">Karakter</span></span>
              <span>•</span>
              <span><span id="wordCount" class="text-brand-red font-extrabold">0</span> <span data-i18n="wordsLabel">Kata</span></span>
              <span>•</span>
              <span class="flex items-center space-x-1">
                <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-500"></i>
                <span>Est: <strong id="estDuration" class="text-brand-red font-extrabold">~0s</strong></span>
              </span>
            </div>
            <div class="px-2 py-0.5 bg-black text-white text-[11px] font-mono uppercase" id="currentLangBadge">
              BAHASA INDONESIA
            </div>
          </div>
        </div>

        <!-- VOICE AND TONE SELECTION SECTION -->
        <div class="p-5 bg-[#FAF9F6] border-t-3 border-black space-y-5">
          
          <!-- Pilihan Karakter Suara Penyiar -->
          <div>
            <div class="flex items-center justify-between mb-2.5">
              <label class="text-xs font-extrabold font-mono uppercase tracking-wider text-black flex items-center space-x-1.5">
                <i data-lucide="mic" class="w-4 h-4 text-brand-red"></i>
                <span data-i18n="selectVoice">PILIH SUARA PENYIAR (GEMINI VOICE)</span>
              </label>
              <span class="text-[11px] font-mono text-slate-500 font-semibold" data-i18n="voiceModelBadge">Model: gemini-flash-tts</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3" id="voiceCardsContainer">
              <!-- Voice Cards inserted via JS -->
            </div>
          </div>

          <!-- Pilihan Gaya Suara (Tone Style) -->
          <div>
            <label class="block text-xs font-extrabold font-mono uppercase tracking-wider text-black mb-2 flex items-center space-x-1.5">
              <i data-lucide="sliders" class="w-4 h-4 text-brand-red"></i>
              <span data-i18n="selectTone">GAYA INTONASI & SUASANA</span>
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2" id="toneCardsContainer">
              <!-- Tone buttons inserted via JS -->
            </div>
          </div>

          <!-- Opsi Bell Chime (Auto Integrated into Audio) -->
          <div class="pt-3 border-t-2 border-black flex flex-wrap items-center justify-between gap-4">
            <label class="flex items-center space-x-2.5 cursor-pointer select-none">
              <input type="checkbox" id="includeBellToggle" checked class="w-4 h-4 accent-brand-red border-2 border-black cursor-pointer">
              <span class="text-xs font-bold font-mono text-black flex items-center space-x-1">
                <i data-lucide="bell" class="w-4 h-4 text-brand-red"></i>
                <span data-i18n="chimeLabel">Nada Bell Pengumuman Otomatis di Awal File Audio</span>
              </span>
            </label>

            <button type="button" onclick="testChimeSoundOnly()" class="text-xs font-mono font-bold text-brand-red hover:underline cursor-pointer" data-i18n="testChimeBtn">
              [Tes Nada Bell]
            </button>
          </div>

        </div>

        <!-- GENERATE BUTTON FOOTER -->
        <div class="p-5 bg-white border-t-3 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-xs font-mono text-slate-600 font-bold hidden sm:block">
            <span>Engine: </span><span class="bg-brand-yellow px-1.5 py-0.5 border border-black text-black">Google Gemini Audio API</span>
          </div>

          <button 
            id="generateBtn" 
            onclick="generateTTS()"
            class="w-full sm:w-auto px-8 py-3.5 bg-brand-red hover:bg-brand-redHover text-white border-2 border-black shadow-brutal font-mono font-extrabold text-sm uppercase flex items-center justify-center space-x-3 brutal-btn cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i data-lucide="volume-2" class="w-5 h-5"></i>
            <span id="generateBtnText" data-i18n="generateSpeechBtn">HASILKAN SUARA PENGUMUMAN (TTS)</span>
          </button>
        </div>

      </div>

      <!-- AUDIO PLAYER PANEL (CLEANED UP: REDUNDANT SAVE BUTTON REMOVED, DEDICATED DOWNLOAD BUTTON) -->
      <div id="audioPlayerCard" class="bg-white border-3 border-black shadow-brutal-lg p-5 space-y-4">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-black pb-3 gap-3">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-brand-yellow border-2 border-black flex items-center justify-center text-black font-extrabold shadow-brutal-sm shrink-0">
              <i data-lucide="play" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0">
              <h3 id="currentAudioTitle" class="text-sm font-extrabold uppercase font-mono text-black truncate" data-i18n="playerReady">Pratinjau Pengumuman Siap Diputar</h3>
              <p id="currentAudioSubtitle" class="text-xs font-mono text-slate-500 truncate" data-i18n="playerSub">Klik "Hasilkan Suara" untuk memulai</p>
            </div>
          </div>

          <!-- DEDICATED PROMINENT DOWNLOAD BUTTON -->
          <div class="flex items-center">
            <button 
              id="downloadAudioBtn" 
              onclick="downloadCurrentAudio()" 
              disabled 
              class="brutal-btn w-full sm:w-auto px-4 py-2 bg-brand-yellow hover:bg-brand-yellowHover text-black border-2 border-black shadow-brutal font-mono font-bold text-xs uppercase flex items-center justify-center space-x-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
            >
              <i data-lucide="download" class="w-4 h-4 text-brand-red"></i>
              <span data-i18n="downloadBtnText">DOWNLOAD AUDIO (WAV)</span>
            </button>
          </div>
        </div>

        <!-- Slider Bar -->
        <div class="space-y-1.5 pt-1">
          <div class="flex items-center justify-between text-xs font-mono font-bold text-black">
            <span id="currentTimeDisplay">00:00</span>
            <span id="totalDurationDisplay">00:00</span>
          </div>
          
          <input 
            type="range" 
            id="audioSeekBar" 
            min="0" 
            max="100" 
            value="0" 
            class="w-full h-3 bg-white border-2 border-black appearance-none cursor-pointer accent-brand-red"
            oninput="onSeekAudio(this.value)"
          >
        </div>

        <!-- Player Controls (Play/Pause, Repeat, Speeds, Volume) -->
        <div class="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div class="flex items-center space-x-3">
            <button 
              id="mainPlayBtn" 
              onclick="togglePlayPause()" 
              disabled
              class="w-12 h-12 bg-brand-red hover:bg-brand-redHover disabled:bg-slate-200 text-white border-2 border-black shadow-brutal flex items-center justify-center brutal-btn cursor-pointer disabled:cursor-not-allowed"
            >
              <i data-lucide="play" id="mainPlayIcon" class="w-6 h-6 ml-0.5"></i>
            </button>

            <button onclick="restartAudio()" class="p-2.5 bg-white hover:bg-slate-100 text-black border-2 border-black shadow-brutal-sm cursor-pointer" title="Ulangi dari Awal">
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
            </button>
          </div>

          <div class="flex items-center space-x-3">
            <!-- Speed Selector -->
            <div class="flex items-center border-2 border-black bg-white shadow-brutal-sm font-mono text-xs font-bold">
              <button onclick="setPlaybackSpeed(0.85)" class="speed-btn px-2.5 py-1 text-black hover:bg-slate-100 transition cursor-pointer" data-speed="0.85">0.85x</button>
              <div class="w-[2px] h-6 bg-black"></div>
              <button onclick="setPlaybackSpeed(1.0)" class="speed-btn px-2.5 py-1 bg-brand-yellow text-black font-extrabold transition cursor-pointer" data-speed="1.0">1.0x</button>
              <div class="w-[2px] h-6 bg-black"></div>
              <button onclick="setPlaybackSpeed(1.15)" class="speed-btn px-2.5 py-1 text-black hover:bg-slate-100 transition cursor-pointer" data-speed="1.15">1.15x</button>
            </div>

            <!-- Volume Control -->
            <div class="hidden sm:flex items-center space-x-1.5 border-2 border-black bg-white shadow-brutal-sm px-2.5 py-1">
              <i data-lucide="volume-2" class="w-4 h-4 text-black"></i>
              <input type="range" id="volumeSlider" min="0" max="1" step="0.05" value="1" class="w-16 h-2 bg-slate-200 appearance-none cursor-pointer accent-brand-red" oninput="setAudioVolume(this.value)">
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- RIGHT COLUMN (SAVED AUDIO ARCHIVES) -->
    <div class="lg:col-span-4 space-y-6">
      
      <!-- SAVED ANNOUNCEMENTS LIST CARD -->
      <div class="bg-white border-3 border-black shadow-brutal-lg flex flex-col h-[740px]">
        
        <!-- Header -->
        <div class="p-4 bg-brand-yellow border-b-3 border-black flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <i data-lucide="archive" class="w-5 h-5 text-black"></i>
            <h3 class="font-extrabold text-sm uppercase font-mono text-black" data-i18n="archiveTitle">ARSIP AUDIO TERSIMPAN</h3>
          </div>
          <button onclick="loadSavedAudioList()" class="p-1 bg-white hover:bg-slate-100 border-2 border-black shadow-brutal-sm cursor-pointer" title="Muat Ulang">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-black"></i>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="p-3 border-b-2 border-black bg-[#FAF9F6]">
          <div class="relative">
            <i data-lucide="search" class="w-4 h-4 text-black absolute left-3 top-3"></i>
            <input 
              type="text" 
              id="searchSavedInput" 
              placeholder="Cari berkas suara..." 
              class="w-full pl-9 pr-3 py-1.5 text-xs font-mono font-medium border-2 border-black bg-white focus:outline-none focus:bg-[#FFFDF5]"
              oninput="filterSavedList()"
            >
          </div>
        </div>

        <!-- File List (Scrollable) -->
        <div id="savedAudioListContainer" class="flex-1 overflow-y-auto custom-scroll p-3 space-y-2.5 bg-white">
          <!-- Audio Item Cards inserted via JS -->
        </div>

        <!-- Storage Directory Info Footer (Dynamically Displays Configured Directory) -->
        <div class="p-3 bg-[#FAF9F6] border-t-3 border-black text-xs font-mono text-black flex items-center justify-between font-bold">
          <div class="flex items-center space-x-1.5 truncate max-w-[220px]" title="<?= htmlspecialchars($currentStorageDir) ?>">
            <i data-lucide="folder" class="w-4 h-4 text-brand-red shrink-0"></i>
            <span id="currentStorageFolderDisplay" class="truncate"><?= htmlspecialchars(basename($currentStorageDir)) ?></span>
          </div>
          <span id="savedCountBadge" class="bg-black text-white px-2 py-0.5 text-[11px] shrink-0">0 BERKAS</span>
        </div>

      </div>

    </div>

  </main>

  <!-- MODAL PENGATURAN (SETTINGS MODAL: API KEY, LANGUAGE, STORAGE FOLDER) -->
  <div id="settingsModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white border-4 border-black max-w-lg w-full shadow-brutal-xl overflow-hidden transform transition-all">
      
      <!-- Modal Header -->
      <div class="p-4 bg-brand-yellow border-b-3 border-black flex items-center justify-between">
        <div class="flex items-center space-x-2.5">
          <div class="w-7 h-7 bg-brand-red text-white border-2 border-black flex items-center justify-center font-bold">
            <i data-lucide="sliders" class="w-4 h-4"></i>
          </div>
          <h3 class="font-extrabold uppercase font-mono text-black text-sm" data-i18n="settingsModalTitle">PENGATURAN SISTEM</h3>
        </div>
        <button onclick="closeSettingsModal()" class="w-7 h-7 bg-white hover:bg-brand-red hover:text-white border-2 border-black flex items-center justify-center font-extrabold cursor-pointer">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 space-y-5 text-sm max-h-[80vh] overflow-y-auto custom-scroll">
        
        <!-- SECTION 1: PILIHAN BAHASA -->
        <div class="space-y-2">
          <label class="block text-xs font-extrabold font-mono uppercase text-black" data-i18n="langSectionTitle">
            1. Pilihan Bahasa Antarmuka
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button 
              type="button" 
              onclick="setModalLanguage('id')" 
              id="modalLangBtn-id" 
              class="p-3 border-2 border-black text-left flex items-center space-x-3 transition cursor-pointer font-mono font-bold text-xs"
            >
              <span class="text-xl">🇮🇩</span>
              <div>
                <div class="font-extrabold">Bahasa Indonesia</div>
                <div class="text-[10px] text-slate-500 font-normal">Naskah lokal Indonesia</div>
              </div>
            </button>

            <button 
              type="button" 
              onclick="setModalLanguage('en')" 
              id="modalLangBtn-en" 
              class="p-3 border-2 border-black text-left flex items-center space-x-3 transition cursor-pointer font-mono font-bold text-xs"
            >
              <span class="text-xl">🇬🇧</span>
              <div>
                <div class="font-extrabold">English</div>
                <div class="text-[10px] text-slate-500 font-normal">English announcements</div>
              </div>
            </button>
          </div>
        </div>

        <div class="border-t-2 border-black/10"></div>

        <!-- SECTION 2: GOOGLE GEMINI API KEY -->
        <div class="space-y-2">
          <label class="block text-xs font-extrabold font-mono uppercase text-black" data-i18n="apiKeySectionTitle">
            2. Google Gemini API Key
          </label>
          <p class="text-xs text-slate-600 font-mono" data-i18n="apiKeyHelpText">
            Mendukung format resmi dari Google AI Studio (baik awalan <code>AIzaSy...</code> maupun <code>AQ.Ab8...</code>).
          </p>

          <div class="relative">
            <input 
              type="password" 
              id="apiKeyInput" 
              placeholder="Masukkan API Key Google Gemini..." 
              class="w-full border-2 border-black p-3 text-xs font-mono pr-10 focus:outline-none focus:bg-[#FFFDF5] focus:ring-2 focus:ring-brand-red"
            >
            <button type="button" onclick="togglePasswordVisibility()" class="absolute right-3 top-3 text-black hover:text-brand-red cursor-pointer">
              <i data-lucide="eye" id="eyeIcon" class="w-4 h-4"></i>
            </button>
          </div>

          <div class="pt-0.5 flex items-center justify-between text-xs font-mono">
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" class="text-brand-red font-bold hover:underline flex items-center space-x-1">
              <span>Dapatkan API Key Gratis di Google AI Studio</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>

        <div class="border-t-2 border-black/10"></div>

        <!-- SECTION 3: PENGATURAN FOLDER TUJUAN PENYIMPANAN AUDIO -->
        <div class="space-y-2">
          <label class="block text-xs font-extrabold font-mono uppercase text-black flex items-center space-x-1.5" data-i18n="storageFolderTitle">
            <i data-lucide="folder" class="w-4 h-4 text-brand-red"></i>
            <span>3. Lokasi Folder Penyimpanan File Audio</span>
          </label>
          <p class="text-xs text-slate-600 font-mono" data-i18n="storageFolderDesc">
            Tentukan direktori folder lokal di server tempat file suara WAV akan disimpan saat tombol Download ditekan.
          </p>
          <input 
            type="text" 
            id="storageDirInput" 
            value="<?= htmlspecialchars($currentStorageDir) ?>"
            placeholder="Contoh: saved_audio atau D:/Pengumuman_Audio" 
            class="w-full border-2 border-black p-3 text-xs font-mono focus:outline-none focus:bg-[#FFFDF5] focus:ring-2 focus:ring-brand-red"
          >
          <p class="text-[11px] font-mono text-slate-500">
            *Biarkan kosong atau isi <code class="bg-slate-100 px-1 border border-black text-black">saved_audio</code> untuk folder bawaan aplikasi.
          </p>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="p-4 bg-[#FAF9F6] border-t-3 border-black flex items-center justify-end space-x-3">
        <button onclick="closeSettingsModal()" class="px-4 py-2 border-2 border-black bg-white hover:bg-slate-100 font-mono font-bold text-xs uppercase cursor-pointer" data-i18n="cancelBtn">
          Batal
        </button>
        <button onclick="saveAllSettings()" id="saveSettingsBtn" class="brutal-btn px-5 py-2 bg-brand-red hover:bg-brand-redHover text-white border-2 border-black shadow-brutal font-mono font-bold text-xs uppercase flex items-center space-x-1.5 cursor-pointer">
          <i data-lucide="check" class="w-4 h-4"></i>
          <span data-i18n="saveSettingsBtn">Simpan Pengaturan</span>
        </button>
      </div>

    </div>
  </div>

  <!-- MODAL KELOLA TEMPLATE SKENARIO PENGUMUMAN (CRUD TEMPLATES) -->
  <div id="templateManagerModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white border-4 border-black max-w-2xl w-full shadow-brutal-xl overflow-hidden transform transition-all flex flex-col max-h-[85vh]">
      
      <!-- Header -->
      <div class="p-4 bg-brand-yellow border-b-3 border-black flex items-center justify-between">
        <div class="flex items-center space-x-2.5">
          <div class="w-7 h-7 bg-brand-red text-white border-2 border-black flex items-center justify-center font-bold">
            <i data-lucide="layers" class="w-4 h-4"></i>
          </div>
          <h3 class="font-extrabold uppercase font-mono text-black text-sm" data-i18n="manageModalTitle">KELOLA TEMPLATE PENGUMUMAN</h3>
        </div>
        <button onclick="closeTemplateManagerModal()" class="w-7 h-7 bg-white hover:bg-brand-red hover:text-white border-2 border-black flex items-center justify-center font-extrabold cursor-pointer">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body: List & Form -->
      <div class="p-6 space-y-6 overflow-y-auto custom-scroll flex-1">
        
        <!-- Action bar to open Add Form -->
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold uppercase text-slate-700" data-i18n="tplListHeader">Daftar Skenario Template Tersedia</span>
          <button 
            type="button" 
            onclick="showTemplateForm()" 
            class="brutal-btn px-3 py-1.5 bg-brand-yellow hover:bg-brand-yellowHover text-black border-2 border-black shadow-brutal-sm font-mono text-xs font-bold uppercase flex items-center space-x-1 cursor-pointer"
          >
            <i data-lucide="plus" class="w-3.5 h-3.5 text-black"></i>
            <span data-i18n="addTplBtn">Tambah Template</span>
          </button>
        </div>

        <!-- Form Tambah / Edit Template (Hidden by default) -->
        <div id="templateFormContainer" class="p-4 border-3 border-black bg-[#FAF9F6] shadow-brutal-sm space-y-3 hidden">
          <div class="flex items-center justify-between border-b-2 border-black pb-2">
            <h4 id="templateFormTitle" class="font-mono font-extrabold text-xs uppercase text-brand-red">FORM TEMPLATE BARU</h4>
            <button type="button" onclick="hideTemplateForm()" class="text-xs font-mono font-bold text-slate-500 hover:text-black">[Tutup]</button>
          </div>

          <input type="hidden" id="editTemplateId" value="">

          <div>
            <label class="block text-xs font-mono font-bold uppercase mb-1" data-i18n="tplTitleLabel">Judul Template:</label>
            <input type="text" id="tplTitleInput" class="w-full border-2 border-black p-2 text-xs font-mono focus:outline-none focus:bg-white" placeholder="Contoh: Panggilan Antrian Loket">
          </div>

          <div>
            <label class="block text-xs font-mono font-bold uppercase mb-1" data-i18n="tplTextLabel">Naskah Pengumuman:</label>
            <textarea id="tplTextInput" rows="4" class="w-full border-2 border-black p-2 text-xs font-mono focus:outline-none focus:bg-white" placeholder="Ketik naskah pengumuman untuk template ini..."></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-mono font-bold uppercase mb-1" data-i18n="tplVoiceLabel">Rekomendasi Suara:</label>
              <select id="tplVoiceInput" class="w-full border-2 border-black p-2 text-xs font-mono bg-white focus:outline-none">
                <option value="Kore">Kore (Wanita - Lembut & Ramah)</option>
                <option value="Zephyr">Zephyr (Pria - Hangat & Bersahabat)</option>
                <option value="Puck">Puck (Pria - Ceria & Energetik)</option>
                <option value="Fenrir">Fenrir (Pria - Formal & Berwibawa)</option>
                <option value="Charon">Charon (Netral - Jernih & Objektif)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-mono font-bold uppercase mb-1" data-i18n="tplToneLabel">Gaya Intonasi:</label>
              <select id="tplToneInput" class="w-full border-2 border-black p-2 text-xs font-mono bg-white focus:outline-none">
                <option value="professional">Sopan & Lembut</option>
                <option value="formal">Resmi & Baku</option>
                <option value="casual">Santai & Ramah</option>
                <option value="energetic">Ceria & Semangat</option>
                <option value="calm_whisper">Bisikan Hening</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end space-x-2 pt-2">
            <button type="button" onclick="hideTemplateForm()" class="px-3 py-1.5 border-2 border-black bg-white font-mono text-xs font-bold uppercase">Batal</button>
            <button type="button" onclick="saveTemplateItem()" class="brutal-btn px-4 py-1.5 bg-brand-red text-white border-2 border-black shadow-brutal-sm font-mono text-xs font-bold uppercase">Simpan Template</button>
          </div>
        </div>

        <!-- List of Templates -->
        <div id="templateManagerListContainer" class="space-y-2.5">
          <!-- Dynamically populated -->
        </div>

      </div>

      <!-- Footer -->
      <div class="p-4 bg-[#FAF9F6] border-t-3 border-black flex justify-end">
        <button onclick="closeTemplateManagerModal()" class="px-5 py-2 border-2 border-black bg-white hover:bg-slate-100 font-mono font-bold text-xs uppercase cursor-pointer">
          Tutup
        </button>
      </div>

    </div>
  </div>

  <!-- TOAST NOTIFICATION CONTAINER -->
  <div id="toastContainer" class="fixed bottom-6 right-6 z-50 space-y-3 pointer-events-none"></div>

  <!-- HIDDEN AUDIO ELEMENT -->
  <audio id="nativeAudioPlayer" class="hidden"></audio>

  <!-- JAVASCRIPT APPLICATION CORE (GENERALIZED & UPGRADED) -->
  <script>
    // -------------------------------------------------------------
    // MULTILINGUAL DICTIONARY (ID & EN)
    // -------------------------------------------------------------
    const I18N = {
      id: {
        logoTag: 'VOICE-ANNOUNCE',
        appTitle: 'VOICE-ANNOUNCE',
        appSubtitle: 'Sistem Generator Pengumuman Suara Otomatis',
        settingsBtn: 'Pengaturan',
        apiKeyBannerTitle: 'Google Gemini API Key Belum Dikonfigurasi',
        apiKeyBannerDesc: 'Untuk menghasilkan suara pengumuman, silakan masukkan API Key Gemini Anda di menu Pengaturan.',
        apiKeyBannerBtn: 'Buka Pengaturan Sekarang →',
        editorHeader: 'Naskah Pengumuman Suara',
        resetBtn: 'RESET',
        quickTemplates: 'TEMPLATE:',
        manageTemplatesBtn: 'Kelola Template',
        scriptLabel: 'Teks Naskah Pengumuman',
        makeTemplateBtn: 'Jadikan Template',
        polishWithAi: 'Sempurnakan dengan AI',
        charsLabel: 'Karakter',
        wordsLabel: 'Kata',
        selectVoice: 'PILIH SUARA PENYIAR (GEMINI VOICE)',
        voiceModelBadge: 'Model: gemini-flash-tts',
        selectTone: 'GAYA INTONASI & SUASANA',
        chimeLabel: 'Nada Bell Pengumuman Otomatis di Awal File Audio',
        testChimeBtn: '[Tes Nada Bell]',
        generateSpeechBtn: 'HASILKAN SUARA PENGUMUMAN (TTS)',
        generatingSpeech: 'MEMPROSES SUARA GEMINI AI...',
        loadingAudio: 'MEMUAT AUDIO...',
        playerReady: 'Pratinjau Pengumuman Siap Diputar',
        playerSub: 'Klik "Hasilkan Suara" untuk memulai',
        downloadBtnText: 'DOWNLOAD AUDIO (WAV)',
        archiveTitle: 'ARSIP AUDIO TERSIMPAN',
        settingsModalTitle: 'PENGATURAN SISTEM',
        langSectionTitle: '1. Pilihan Bahasa Antarmuka',
        apiKeySectionTitle: '2. Google Gemini API Key',
        apiKeyHelpText: 'Mendukung format resmi dari Google AI Studio (baik awalan AIzaSy... maupun AQ.Ab8...).',
        storageFolderTitle: '3. Lokasi Folder Penyimpanan File Audio',
        storageFolderDesc: 'Tentukan direktori folder lokal di server tempat file suara WAV akan disimpan saat tombol Download ditekan.',
        cancelBtn: 'Batal',
        saveSettingsBtn: 'Simpan Pengaturan',
        langBadgeText: 'BAHASA INDONESIA',
        emptyArchiveText: 'Belum ada pengumuman yang tersimpan.',
        toastSaved: 'Pengaturan berhasil disimpan!',
        toastGenerated: 'Suara pengumuman berhasil dibuat!',
        toastDownloaded: 'Audio berhasil diunduh dan disimpan ke arsip!',
        manageModalTitle: 'KELOLA TEMPLATE PENGUMUMAN',
        tplListHeader: 'Daftar Skenario Template Tersedia',
        addTplBtn: 'Tambah Template',
        tplTitleLabel: 'Judul Template:',
        tplTextLabel: 'Naskah Pengumuman:',
        tplVoiceLabel: 'Rekomendasi Suara:',
        tplToneLabel: 'Gaya Intonasi:'
      },
      en: {
        logoTag: 'VOICE-ANNOUNCE',
        appTitle: 'VOICE-ANNOUNCE',
        appSubtitle: 'Automated Voice Announcement System',
        settingsBtn: 'Settings',
        apiKeyBannerTitle: 'Google Gemini API Key Not Configured',
        apiKeyBannerDesc: 'To synthesize announcement voice, please enter your Gemini API Key in the Settings menu.',
        apiKeyBannerBtn: 'Open Settings Now →',
        editorHeader: 'Voice Announcement Script',
        resetBtn: 'RESET',
        quickTemplates: 'TEMPLATES:',
        manageTemplatesBtn: 'Manage Templates',
        scriptLabel: 'Announcement Script Text',
        makeTemplateBtn: 'Save as Template',
        polishWithAi: 'Polish with AI',
        charsLabel: 'Characters',
        wordsLabel: 'Words',
        selectVoice: 'SELECT VOICE TALENT (GEMINI VOICE)',
        voiceModelBadge: 'Model: gemini-flash-tts',
        selectTone: 'TONE STYLE & MOOD',
        chimeLabel: 'Automatic Announcement Bell Prepended to Audio File',
        testChimeBtn: '[Test Bell Sound]',
        generateSpeechBtn: 'GENERATE ANNOUNCEMENT SPEECH (TTS)',
        generatingSpeech: 'PROCESSING GEMINI AI VOICE...',
        loadingAudio: 'LOADING AUDIO...',
        playerReady: 'Announcement Preview Ready',
        playerSub: 'Click "Generate Speech" to begin',
        downloadBtnText: 'DOWNLOAD AUDIO (WAV)',
        archiveTitle: 'SAVED AUDIO ARCHIVES',
        settingsModalTitle: 'SYSTEM SETTINGS',
        langSectionTitle: '1. Interface Language',
        apiKeySectionTitle: '2. Google Gemini API Key',
        apiKeyHelpText: 'Supports official Google AI Studio keys (including AIzaSy... and AQ.Ab8... formats).',
        storageFolderTitle: '3. Audio File Storage Directory',
        storageFolderDesc: 'Specify the local server folder directory where WAV audio files will be stored upon clicking Download.',
        cancelBtn: 'Cancel',
        saveSettingsBtn: 'Save Settings',
        langBadgeText: 'ENGLISH (EN)',
        emptyArchiveText: 'No saved announcements yet.',
        toastSaved: 'Settings saved successfully!',
        toastGenerated: 'Announcement speech generated successfully!',
        toastDownloaded: 'Audio downloaded and archived successfully!',
        manageModalTitle: 'MANAGE ANNOUNCEMENT TEMPLATES',
        tplListHeader: 'Available Template Scenarios',
        addTplBtn: 'Add Template',
        tplTitleLabel: 'Template Title:',
        tplTextLabel: 'Announcement Script:',
        tplVoiceLabel: 'Recommended Voice:',
        tplToneLabel: 'Tone Style:'
      }
    };

    // -------------------------------------------------------------
    // VOICES & TONES CONSTANTS (GENERALIZED)
    // -------------------------------------------------------------
    const VOICES = [
      { id: 'Kore', name: 'Kore', gender: 'Wanita / Female', badge: 'Disarankan / Recommended', desc: 'Lembut, santun, ramah, dan artikulatif untuk pengumuman umum.' },
      { id: 'Zephyr', name: 'Zephyr', gender: 'Pria / Male', badge: 'Populer / Popular', desc: 'Hangat, bersahabat, artikulasi ramah & menenangkan.' },
      { id: 'Puck', name: 'Puck', gender: 'Pria / Male', badge: 'Energetik / Energetic', desc: 'Segar, ceria, interaktif untuk panggilan, retail, & event.' },
      { id: 'Fenrir', name: 'Fenrir', gender: 'Pria / Male', badge: 'Formal / Authoritative', desc: 'Suara dalam, berwibawa, dan resmi untuk protokol & peringatan.' },
      { id: 'Charon', name: 'Charon', gender: 'Netral / Neutral', badge: 'Jernih / Clear', desc: 'Netral, tenang, jernih dengan intonasi objektif & profesional.' }
    ];

    const TONES = [
      { id: 'professional', label: 'Sopan & Lembut', labelEn: 'Polite & Gentle', desc: 'Sopan, santun, tenang, profesional, dan artikulatif' },
      { id: 'formal', label: 'Resmi & Baku', labelEn: 'Formal & Crisp', desc: 'Formal, jelas, santun, berwibawa, anggun, dengan jeda yang teratur' },
      { id: 'casual', label: 'Santai & Ramah', labelEn: 'Casual & Friendly', desc: 'Hangat, kasual, ramah tersenyum, bersahabat, merdu dan menyejukkan' },
      { id: 'energetic', label: 'Ceria & Semangat', labelEn: 'Lively & Energetic', desc: 'Energetik, bersemangat, ceria, dinamis, memikat perhatian pendengar' },
      { id: 'calm_whisper', label: 'Bisikan Hening', labelEn: 'Calm Whisper', desc: 'Lirih, sangat tenang dan halus, berbisik santun dan teduh' }
    ];

    // -------------------------------------------------------------
    // APP STATE
    // -------------------------------------------------------------
    let currentLang = '<?= htmlspecialchars($initialLang) ?>' || 'id';
    let modalSelectedLang = currentLang;
    let currentVoice = 'Kore';
    let currentTone = 'professional';
    let currentAudioBase64 = null;
    let currentAudioBlobUrl = null;
    let currentAudioTitle = 'Pengumuman Suara';
    let savedAudioList = [];
    let customTemplates = [];

    const nativeAudio = document.getElementById('nativeAudioPlayer');

    // -------------------------------------------------------------
    // SAFE LUCIDE RENDERER
    // -------------------------------------------------------------
    function safeLucide() {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        try { window.lucide.createIcons(); } catch (e) {}
      }
    }

    // -------------------------------------------------------------
    // WEB AUDIO API REAL-TIME CHIME BELL SYNTHESIS (PREVIEW TEST)
    // -------------------------------------------------------------
    let audioCtx = null;
    function getAudioContext() {
      if (!audioCtx) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioCtxClass();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function playAnnouncementChime() {
      return new Promise((resolve) => {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.28, now + 0.04);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.9);

        const note2Start = now + 0.32;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(783.99, note2Start);
        gain2.gain.setValueAtTime(0, note2Start);
        gain2.gain.linearRampToValueAtTime(0.25, note2Start + 0.04);
        gain2.gain.exponentialRampToValueAtTime(0.0001, note2Start + 1.1);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(note2Start);
        osc2.stop(note2Start + 1.2);

        setTimeout(() => resolve(), 1200);
      });
    }

    function testChimeSoundOnly() {
      playAnnouncementChime();
      showToast(currentLang === 'id' ? 'Memutar nada lonceng pengumuman...' : 'Playing announcement bell chime...', 'info');
    }

    // Fast, non-blocking Base64 to Blob URL
    async function base64ToBlobUrl(base64, mimeType = 'audio/wav') {
      try {
        const res = await fetch(`data:${mimeType};base64,${base64}`);
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      } catch (e) {
        const bin = atob(base64);
        const len = bin.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
        const blob = new Blob([bytes], { type: mimeType });
        return URL.createObjectURL(blob);
      }
    }

    // -------------------------------------------------------------
    // TEMPLATES MANAGEMENT (CRUD)
    // -------------------------------------------------------------
    async function loadTemplates() {
      try {
        const res = await fetch('api.php?action=get_templates');
        const data = await res.json();
        if (data.success && Array.isArray(data.templates)) {
          customTemplates = data.templates;
        }
      } catch (e) {
        console.error('Failed to load templates:', e);
      }
      renderTemplatePills();
      renderTemplateManagerList();
    }

    function renderTemplatePills() {
      const container = document.getElementById('presetPillsContainer');
      if (!customTemplates || customTemplates.length === 0) {
        container.innerHTML = `<span class="text-xs font-mono text-slate-400">[Belum ada template]</span>`;
        return;
      }

      container.innerHTML = customTemplates.map(t => {
        const title = (currentLang === 'en' && t.title_en) ? t.title_en : t.title;
        return `
          <button 
            type="button"
            onclick="applyTemplate('${t.id}')" 
            class="px-3 py-1 text-xs font-mono font-bold bg-white text-black border-2 border-black shadow-brutal-sm hover:bg-brand-yellow transition cursor-pointer"
          >
            ${title}
          </button>
        `;
      }).join('');
    }

    function applyTemplate(id) {
      const t = customTemplates.find(item => item.id === id);
      if (!t) return;
      const text = (currentLang === 'en' && t.text_en) ? t.text_en : t.text;
      const title = (currentLang === 'en' && t.title_en) ? t.title_en : t.title;
      
      document.getElementById('announcementText').value = text;
      if (t.voice) selectVoice(t.voice);
      if (t.tone) selectTone(t.tone);
      updateTextStats();
      currentAudioTitle = title;
      showToast(`Template "${title}" diterapkan!`, 'info');
    }

    function openTemplateManagerModal() {
      document.getElementById('templateManagerModal').classList.remove('hidden');
      renderTemplateManagerList();
      hideTemplateForm();
    }

    function closeTemplateManagerModal() {
      document.getElementById('templateManagerModal').classList.add('hidden');
    }

    function renderTemplateManagerList() {
      const container = document.getElementById('templateManagerListContainer');
      if (!customTemplates || customTemplates.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-xs font-mono text-slate-500">Belum ada template yang tersimpan. Klik "Tambah Template" untuk membuat.</div>`;
        return;
      }

      container.innerHTML = customTemplates.map(t => {
        const title = (currentLang === 'en' && t.title_en) ? t.title_en : t.title;
        const text = (currentLang === 'en' && t.text_en) ? t.text_en : t.text;
        return `
          <div class="p-3 border-2 border-black bg-white shadow-brutal-sm flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2">
                <span class="font-mono font-bold text-xs uppercase text-black">${title}</span>
                <span class="px-1.5 py-0.5 bg-brand-yellow border border-black text-[10px] font-mono font-bold">${t.voice || 'Kore'}</span>
              </div>
              <p class="text-xs font-mono text-slate-600 truncate mt-1">${text}</p>
            </div>
            <div class="flex items-center space-x-1.5 shrink-0">
              <button onclick="editTemplateItem('${t.id}')" class="px-2 py-1 bg-white hover:bg-slate-100 border border-black font-mono text-xs font-bold" title="Edit">
                Edit
              </button>
              <button onclick="deleteTemplateItem('${t.id}')" class="px-2 py-1 bg-white hover:bg-brand-red hover:text-white border border-black font-mono text-xs font-bold" title="Hapus">
                Hapus
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    function showTemplateForm(id = null) {
      document.getElementById('templateFormContainer').classList.remove('hidden');
      const titleEl = document.getElementById('templateFormTitle');
      const idInput = document.getElementById('editTemplateId');
      const titleInput = document.getElementById('tplTitleInput');
      const textInput = document.getElementById('tplTextInput');
      const voiceInput = document.getElementById('tplVoiceInput');
      const toneInput = document.getElementById('tplToneInput');

      if (id) {
        const item = customTemplates.find(t => t.id === id);
        if (item) {
          titleEl.textContent = 'EDIT TEMPLATE SKENARIO';
          idInput.value = item.id;
          titleInput.value = item.title;
          textInput.value = item.text;
          voiceInput.value = item.voice || 'Kore';
          toneInput.value = item.tone || 'professional';
          return;
        }
      }

      titleEl.textContent = 'BUAT TEMPLATE BARU';
      idInput.value = '';
      titleInput.value = '';
      textInput.value = '';
      voiceInput.value = 'Kore';
      toneInput.value = 'professional';
    }

    function hideTemplateForm() {
      document.getElementById('templateFormContainer').classList.add('hidden');
    }

    // -------------------------------------------------------------
    // CREATE TEMPLATE DIRECTLY FROM CURRENT ANNOUNCEMENT SCRIPT
    // -------------------------------------------------------------
    function createTemplateFromCurrentScript() {
      const scriptText = document.getElementById('announcementText').value.trim();
      if (!scriptText) {
        showToast(
          currentLang === 'en' 
            ? 'Please write announcement script text first before converting it to a template.' 
            : 'Tulis naskah pengumuman terlebih dahulu sebelum menjadikannya template.', 
          'warning'
        );
        document.getElementById('announcementText').focus();
        return;
      }

      // 1. Open the Manage Templates popup modal
      openTemplateManagerModal();

      // 2. Open the form inside the popup modal
      showTemplateForm();

      // 3. Pre-populate with current script, active voice, and active tone
      const titleEl = document.getElementById('templateFormTitle');
      const idInput = document.getElementById('editTemplateId');
      const titleInput = document.getElementById('tplTitleInput');
      const textInput = document.getElementById('tplTextInput');
      const voiceInput = document.getElementById('tplVoiceInput');
      const toneInput = document.getElementById('tplToneInput');

      titleEl.textContent = (currentLang === 'en') ? 'SAVE SCRIPT AS NEW TEMPLATE' : 'JADIKAN NASKAH SEBAGAI TEMPLATE BARU';
      idInput.value = '';
      textInput.value = scriptText;
      voiceInput.value = currentVoice || 'Kore';
      toneInput.value = currentTone || 'professional';

      // Auto-suggest a clean short title from first few words
      const words = scriptText.replace(/[\r\n\t]+/g, ' ').trim().split(/\s+/).filter(Boolean);
      let suggested = words.slice(0, 4).join(' ');
      if (suggested.length > 28) suggested = suggested.slice(0, 28);
      titleInput.value = suggested;

      // Scroll form to view smoothly and focus title input
      const formEl = document.getElementById('templateFormContainer');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      setTimeout(() => {
        titleInput.focus();
        titleInput.select();
      }, 150);
    }

    function editTemplateItem(id) {
      showTemplateForm(id);
    }

    async function deleteTemplateItem(id) {
      if (!confirm('Hapus template ini?')) return;
      customTemplates = customTemplates.filter(t => t.id !== id);
      await saveTemplatesToServer();
      renderTemplatePills();
      renderTemplateManagerList();
      showToast('Template berhasil dihapus.', 'info');
    }

    async function saveTemplateItem() {
      const idInput = document.getElementById('editTemplateId').value;
      const title = document.getElementById('tplTitleInput').value.trim();
      const text = document.getElementById('tplTextInput').value.trim();
      const voice = document.getElementById('tplVoiceInput').value;
      const tone = document.getElementById('tplToneInput').value;

      if (!title || !text) {
        showToast('Judul dan naskah template tidak boleh kosong!', 'warning');
        return;
      }

      if (idInput) {
        // Update existing
        const idx = customTemplates.findIndex(t => t.id === idInput);
        if (idx !== -1) {
          customTemplates[idx].title = title;
          customTemplates[idx].text = text;
          customTemplates[idx].voice = voice;
          customTemplates[idx].tone = tone;
        }
      } else {
        // Create new
        const newId = 'tpl_' + Date.now();
        customTemplates.push({
          id: newId,
          title: title,
          text: text,
          voice: voice,
          tone: tone
        });
      }

      await saveTemplatesToServer();
      hideTemplateForm();
      renderTemplatePills();
      renderTemplateManagerList();
      showToast('Template berhasil disimpan!', 'success');
    }

    async function saveTemplatesToServer() {
      try {
        await fetch('api.php?action=save_templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templates: customTemplates })
        });
      } catch (e) {
        console.error('Failed to save templates:', e);
      }
    }

    // -------------------------------------------------------------
    // LANGUAGE SWITCHING LOGIC
    // -------------------------------------------------------------
    function switchLanguage(lang) {
      currentLang = lang;
      modalSelectedLang = lang;
      
      document.getElementById('langBtn-id').className = `px-2.5 py-1.5 transition font-mono ${lang === 'id' ? 'bg-brand-red text-white' : 'text-black hover:bg-slate-100'}`;
      document.getElementById('langBtn-en').className = `px-2.5 py-1.5 transition font-mono ${lang === 'en' ? 'bg-brand-red text-white' : 'text-black hover:bg-slate-100'}`;
      document.getElementById('currentLangBadge').textContent = I18N[lang].langBadgeText;

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[lang] && I18N[lang][key]) {
          el.textContent = I18N[lang][key];
        }
      });

      document.getElementById('announcementText').placeholder = lang === 'id' 
        ? 'Ketik teks pengumuman di sini...' 
        : 'Type announcement script here...';
      document.getElementById('searchSavedInput').placeholder = lang === 'id'
        ? 'Cari berkas suara...'
        : 'Search audio files...';

      renderTemplatePills();
      renderVoiceCards();
      renderToneCards();
      updateModalLangButtons();

      showToast(lang === 'id' ? 'Bahasa beralih ke Bahasa Indonesia' : 'Language switched to English', 'info');
    }

    function setModalLanguage(lang) {
      modalSelectedLang = lang;
      updateModalLangButtons();
    }

    function updateModalLangButtons() {
      const btnId = document.getElementById('modalLangBtn-id');
      const btnEn = document.getElementById('modalLangBtn-en');
      if (modalSelectedLang === 'id') {
        btnId.className = 'p-3 border-2 border-black bg-brand-yellow text-black font-extrabold shadow-brutal-sm text-left flex items-center space-x-3 transition cursor-pointer font-mono text-xs';
        btnEn.className = 'p-3 border-2 border-black bg-white hover:bg-slate-50 text-black text-left flex items-center space-x-3 transition cursor-pointer font-mono text-xs';
      } else {
        btnId.className = 'p-3 border-2 border-black bg-white hover:bg-slate-50 text-black text-left flex items-center space-x-3 transition cursor-pointer font-mono text-xs';
        btnEn.className = 'p-3 border-2 border-black bg-brand-yellow text-black font-extrabold shadow-brutal-sm text-left flex items-center space-x-3 transition cursor-pointer font-mono text-xs';
      }
    }

    function clearText() {
      document.getElementById('announcementText').value = '';
      updateTextStats();
    }

    function renderVoiceCards() {
      const container = document.getElementById('voiceCardsContainer');
      container.innerHTML = VOICES.map(v => {
        const isSelected = v.id === currentVoice;
        return `
          <div 
            onclick="selectVoice('${v.id}')"
            class="brutal-card p-3 border-2 border-black transition cursor-pointer ${
              isSelected 
                ? 'bg-brand-yellow shadow-brutal font-extrabold' 
                : 'bg-white hover:bg-[#FFFDF5] shadow-brutal-sm'
            }"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="font-extrabold text-sm uppercase font-mono text-black">${v.name}</span>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 border border-black ${
                isSelected ? 'bg-black text-white' : 'bg-white text-black'
              }">${v.badge.split('/')[currentLang === 'id' ? 0 : 1] || v.badge}</span>
            </div>
            <div class="text-[11px] font-mono text-slate-700 leading-snug">
              <span>${v.gender.split('/')[currentLang === 'id' ? 0 : 1] || v.gender}</span> • <span>${v.desc}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    function selectVoice(id) {
      currentVoice = id;
      renderVoiceCards();
    }

    function renderToneCards() {
      const container = document.getElementById('toneCardsContainer');
      container.innerHTML = TONES.map(t => {
        const isSelected = t.id === currentTone;
        const label = currentLang === 'en' ? t.labelEn : t.label;
        return `
          <button 
            type="button"
            onclick="selectTone('${t.id}')"
            class="p-2 border-2 border-black transition cursor-pointer text-xs font-mono font-bold text-center ${
              isSelected 
                ? 'bg-brand-red text-white shadow-brutal-sm' 
                : 'bg-white hover:bg-slate-100 text-black'
            }"
          >
            ${label}
          </button>
        `;
      }).join('');
    }

    function selectTone(id) {
      currentTone = id;
      renderToneCards();
    }

    function updateTextStats() {
      const text = document.getElementById('announcementText').value;
      const chars = text.length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const estSec = Math.ceil(words / 2.1);

      document.getElementById('charCount').textContent = chars;
      document.getElementById('wordCount').textContent = words;
      document.getElementById('estDuration').textContent = `~${estSec}s`;
    }

    // -------------------------------------------------------------
    // AI TEXT REFINEMENT (UNIVERSAL PROMPT ON ANY INPUT TEXT)
    // -------------------------------------------------------------
    async function refineTextWithAI() {
      const text = document.getElementById('announcementText').value.trim();
      if (!text) {
        showToast(currentLang === 'id' ? 'Ketik naskah terlebih dahulu!' : 'Please enter announcement script first!', 'warning');
        return;
      }

      const btn = document.getElementById('refineBtn');
      const btnText = document.getElementById('refineBtnText');
      btn.disabled = true;
      btnText.textContent = currentLang === 'id' ? 'Menyempurnakan...' : 'Polishing...';

      const activeToneObj = TONES.find(t => t.id === currentTone);

      try {
        const res = await fetch('api.php?action=refine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text,
            tone: activeToneObj ? activeToneObj.label : 'sopan, jelas, dan ramah'
          })
        });

        const data = await res.json();
        if (data.success && data.refinedText) {
          document.getElementById('announcementText').value = data.refinedText;
          updateTextStats();
          showToast(currentLang === 'id' ? 'Naskah berhasil disempurnakan!' : 'Script polished with AI successfully!', 'success');
        } else {
          showToast(data.error || 'Gagal menyempurnakan naskah.', 'error');
        }
      } catch (err) {
        showToast('Koneksi gagal: ' + err.message, 'error');
      } finally {
        btn.disabled = false;
        btnText.textContent = I18N[currentLang].polishWithAi;
      }
    }

    // -------------------------------------------------------------
    // GENERATE TTS AUDIO (WITH AUTOMATIC BELL INCLUDED)
    // NO AUTO-SAVE TO DISK: SAVES ONLY WHEN USER CLICKS DOWNLOAD
    // -------------------------------------------------------------
    async function generateTTS() {
      const text = document.getElementById('announcementText').value.trim();
      if (!text) {
        showToast(currentLang === 'id' ? 'Masukkan teks naskah pengumuman!' : 'Please enter announcement text!', 'warning');
        return;
      }

      const generateBtn = document.getElementById('generateBtn');
      const generateBtnText = document.getElementById('generateBtnText');
      const activeToneObj = TONES.find(t => t.id === currentTone);
      const includeBell = document.getElementById('includeBellToggle').checked;

      generateBtn.disabled = true;
      generateBtnText.textContent = I18N[currentLang].generatingSpeech;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      try {
        const res = await fetch('api.php?action=tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            text: text,
            voice: currentVoice,
            style: activeToneObj ? activeToneObj.desc : 'Sopan, jelas, dan ramah untuk pengumuman umum',
            include_bell: includeBell
          })
        });
        clearTimeout(timeoutId);

        let data;
        try {
          data = await res.json();
        } catch (jsonErr) {
          throw new Error('Respon server tidak valid (HTTP ' + res.status + '). Periksa status Apache.');
        }

        if (!data.success || !data.audioBase64) {
          throw new Error(data.error || 'Gagal menghasilkan suara dari server.');
        }

        generateBtnText.textContent = I18N[currentLang].loadingAudio;
        const finalBlobUrl = await base64ToBlobUrl(data.audioBase64, 'audio/wav');

        currentAudioBase64 = data.audioBase64;
        currentAudioBlobUrl = finalBlobUrl;
        currentAudioTitle = text.slice(0, 35).replace(/[\r\n]+/g, ' ') + '...';

        // Load into player
        loadAudioIntoPlayer(finalBlobUrl, currentAudioTitle, `Voice: ${currentVoice} • Tone: ${activeToneObj.label}`);

        showToast(I18N[currentLang].toastGenerated, 'success');

        // Play the audio (which ALREADY has the bell integrated at the start!)
        playAudio();

      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        generateBtn.disabled = false;
        generateBtnText.textContent = I18N[currentLang].generateSpeechBtn;
      }
    }

    // -------------------------------------------------------------
    // AUDIO PLAYER LOGIC
    // -------------------------------------------------------------
    function setupAudioEvents() {
      nativeAudio.addEventListener('timeupdate', () => {
        const cur = nativeAudio.currentTime;
        const dur = nativeAudio.duration || 0;
        document.getElementById('currentTimeDisplay').textContent = formatSeconds(cur);
        if (dur > 0) {
          document.getElementById('totalDurationDisplay').textContent = formatSeconds(dur);
          document.getElementById('audioSeekBar').value = (cur / dur) * 100;
        }
      });

      nativeAudio.addEventListener('ended', () => {
        document.getElementById('mainPlayIcon').setAttribute('data-lucide', 'play');
        safeLucide();
      });

      nativeAudio.addEventListener('loadedmetadata', () => {
        document.getElementById('totalDurationDisplay').textContent = formatSeconds(nativeAudio.duration);
      });
    }

    function loadAudioIntoPlayer(url, title, subtitle) {
      nativeAudio.src = url;
      nativeAudio.load();
      document.getElementById('currentAudioTitle').textContent = title;
      document.getElementById('currentAudioSubtitle').textContent = subtitle;
      document.getElementById('mainPlayBtn').disabled = false;
      document.getElementById('downloadAudioBtn').disabled = false;
    }

    function togglePlayPause() {
      if (nativeAudio.paused) {
        playAudio();
      } else {
        pauseAudio();
      }
    }

    function playAudio() {
      nativeAudio.play().then(() => {
        document.getElementById('mainPlayIcon').setAttribute('data-lucide', 'pause');
        safeLucide();
      }).catch(err => console.error(err));
    }

    function pauseAudio() {
      nativeAudio.pause();
      document.getElementById('mainPlayIcon').setAttribute('data-lucide', 'play');
      safeLucide();
    }

    function restartAudio() {
      nativeAudio.currentTime = 0;
      playAudio();
    }

    function onSeekAudio(pct) {
      if (nativeAudio.duration) {
        nativeAudio.currentTime = (pct / 100) * nativeAudio.duration;
      }
    }

    function setPlaybackSpeed(speed) {
      nativeAudio.playbackRate = speed;
      document.querySelectorAll('.speed-btn').forEach(b => {
        if (parseFloat(b.getAttribute('data-speed')) === speed) {
          b.className = 'speed-btn px-2.5 py-1 bg-brand-yellow text-black font-extrabold transition cursor-pointer';
        } else {
          b.className = 'speed-btn px-2.5 py-1 text-black hover:bg-slate-100 transition cursor-pointer';
        }
      });
    }

    function setAudioVolume(vol) {
      nativeAudio.volume = vol;
    }

    // -------------------------------------------------------------
    // DEDICATED DOWNLOAD ACTION
    // DOWNLOADS TO PC AND SAVES TO LOCAL SERVER STORAGE SIMULTANEOUSLY
    // -------------------------------------------------------------
    async function downloadCurrentAudio() {
      if (!currentAudioBlobUrl || !currentAudioBase64) return;
      
      const fileName = `announcement_${Date.now()}.wav`;

      // 1. Trigger browser file download to user PC
      const a = document.createElement('a');
      a.href = currentAudioBlobUrl;
      a.download = fileName;
      a.click();

      // 2. Save file copy to the configured local server directory & update archive list
      const text = document.getElementById('announcementText').value;
      const activeToneObj = TONES.find(t => t.id === currentTone);

      try {
        const res = await fetch('api.php?action=save_audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: currentAudioBase64,
            title: currentAudioTitle,
            text: text,
            voice: currentVoice,
            style: activeToneObj ? activeToneObj.label : 'Normal'
          })
        });
        const data = await res.json();
        if (data.success) {
          loadSavedAudioList();
        }
      } catch (err) {
        console.error('Failed to archive audio to server folder:', err);
      }

      showToast(I18N[currentLang].toastDownloaded, 'success');
    }

    function formatSeconds(sec) {
      if (isNaN(sec) || sec < 0) return '00:00';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // -------------------------------------------------------------
    // SAVED AUDIO DISK MANAGEMENT
    // -------------------------------------------------------------
    async function loadSavedAudioList() {
      try {
        const res = await fetch('api.php?action=list_audio');
        const data = await res.json();
        savedAudioList = data.files || [];
        renderSavedList(savedAudioList);

        if (data.directory) {
          const folderBase = data.directory.split(/[\/\\]/).pop();
          document.getElementById('currentStorageFolderDisplay').textContent = folderBase || data.directory;
          document.getElementById('currentStorageFolderDisplay').parentElement.title = data.directory;
        }
      } catch (err) {
        console.error('Gagal memuat arsip audio:', err);
      }
    }

    function renderSavedList(files) {
      const container = document.getElementById('savedAudioListContainer');
      const badge = document.getElementById('savedCountBadge');
      badge.textContent = `${files.length} ${currentLang === 'id' ? 'BERKAS' : 'FILES'}`;

      if (files.length === 0) {
        container.innerHTML = `
          <div class="text-center py-16 text-xs font-mono text-slate-500">
            <i data-lucide="archive" class="w-8 h-8 mx-auto mb-2 text-slate-400"></i>
            <span>${I18N[currentLang].emptyArchiveText}</span>
          </div>
        `;
        safeLucide();
        return;
      }

      container.innerHTML = files.map(f => `
        <div class="p-3 border-2 border-black bg-white hover:bg-[#FFFDF5] shadow-brutal-sm transition text-left">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <h4 class="text-xs font-extrabold uppercase font-mono text-black truncate">${f.title}</h4>
              <p class="text-[10px] font-mono text-slate-600 truncate mt-1">
                <span class="bg-brand-yellow px-1 border border-black">${f.voice}</span> • ${f.size_formatted} • ${f.created_at.slice(11, 16)}
              </p>
            </div>
            <div class="flex items-center space-x-1 shrink-0">
              <button onclick="playSavedFile('${f.filename}', '${f.title}', '${f.voice}')" class="p-1.5 bg-brand-yellow hover:bg-brand-yellowHover text-black border border-black shadow-brutal-sm cursor-pointer" title="Putar">
                <i data-lucide="play" class="w-3.5 h-3.5"></i>
              </button>
              <a href="api.php?action=stream_audio&file=${encodeURIComponent(f.filename)}" download="${f.filename}" class="p-1.5 bg-white hover:bg-slate-100 text-black border border-black shadow-brutal-sm" title="Unduh">
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
              </a>
              <button onclick="deleteSavedFile('${f.filename}')" class="p-1.5 bg-white hover:bg-brand-red hover:text-white text-black border border-black shadow-brutal-sm cursor-pointer" title="Hapus">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');
      safeLucide();
    }

    function filterSavedList() {
      const q = document.getElementById('searchSavedInput').value.toLowerCase();
      const filtered = savedAudioList.filter(f => 
        f.title.toLowerCase().includes(q) || 
        f.voice.toLowerCase().includes(q) ||
        (f.text && f.text.toLowerCase().includes(q))
      );
      renderSavedList(filtered);
    }

    function playSavedFile(filename, title, voice) {
      const streamUrl = `api.php?action=stream_audio&file=${encodeURIComponent(filename)}`;
      loadAudioIntoPlayer(streamUrl, title, `Saved File • Voice: ${voice}`);
      playAudio();
    }

    async function deleteSavedFile(filename) {
      const confirmMsg = currentLang === 'id' 
        ? `Hapus file "${filename}" dari komputer?` 
        : `Delete file "${filename}" from disk?`;
      if (!confirm(confirmMsg)) return;

      try {
        const res = await fetch('api.php?action=delete_audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: filename })
        });
        const data = await res.json();
        if (data.success) {
          showToast(currentLang === 'id' ? 'Berkas berhasil dihapus.' : 'File deleted successfully.', 'info');
          loadSavedAudioList();
        } else {
          showToast(data.error || 'Gagal menghapus file.', 'error');
        }
      } catch (err) {
        showToast('Gagal menghapus: ' + err.message, 'error');
      }
    }

    // -------------------------------------------------------------
    // SETTINGS MODAL (API KEY, LANGUAGE, STORAGE DIRECTORY)
    // -------------------------------------------------------------
    function openSettingsModal() {
      document.getElementById('settingsModal').classList.remove('hidden');
      modalSelectedLang = currentLang;
      updateModalLangButtons();
      document.getElementById('apiKeyInput').focus();
    }

    function closeSettingsModal() {
      document.getElementById('settingsModal').classList.add('hidden');
    }

    function togglePasswordVisibility() {
      const input = document.getElementById('apiKeyInput');
      const icon = document.getElementById('eyeIcon');
      if (input.type === 'password') {
        input.type = 'text';
        icon.setAttribute('data-lucide', 'eye-off');
      } else {
        input.type = 'password';
        icon.setAttribute('data-lucide', 'eye');
      }
      safeLucide();
    }

    async function saveAllSettings() {
      const key = document.getElementById('apiKeyInput').value.trim();
      const storageDir = document.getElementById('storageDirInput').value.trim();
      const btn = document.getElementById('saveSettingsBtn');
      btn.disabled = true;

      const payload = { 
        language: modalSelectedLang,
        saved_audio_dir: storageDir
      };
      if (key) {
        payload.api_key = key;
      }

      try {
        const res = await fetch('api.php?action=save_settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast(I18N[currentLang].toastSaved, 'success');
          closeSettingsModal();
          if (modalSelectedLang !== currentLang) {
            switchLanguage(modalSelectedLang);
          }
          checkKeyHealth();
          loadSavedAudioList();
        } else {
          showToast(data.error || 'Gagal menyimpan pengaturan.', 'error');
        }
      } catch (err) {
        showToast('Gagal menghubungi server: ' + err.message, 'error');
      } finally {
        btn.disabled = false;
      }
    }

    // -------------------------------------------------------------
    // TOAST NOTIFICATIONS (NEO-BRUTALIST TOAST)
    // -------------------------------------------------------------
    function showToast(message, type = 'info') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      
      let bg = 'bg-black text-white';
      let icon = 'info';
      if (type === 'success') { bg = 'bg-brand-green text-black'; icon = 'check-circle'; }
      if (type === 'error') { bg = 'bg-brand-red text-white'; icon = 'alert-octagon'; }
      if (type === 'warning') { bg = 'bg-brand-yellow text-black'; icon = 'alert-triangle'; }

      toast.className = `${bg} px-4 py-3 border-2 border-black shadow-brutal font-mono font-bold text-xs flex items-center space-x-2.5 pointer-events-auto transform transition-all duration-200 translate-y-2 opacity-0`;
      toast.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 shrink-0"></i><span>${message}</span>`;
      container.appendChild(toast);
      safeLucide();

      setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      }, 30);

      setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 250);
      }, 3500);
    }

    // -------------------------------------------------------------
    // CHECK API KEY HEALTH
    // -------------------------------------------------------------
    function checkKeyHealth() {
      fetch('api.php?action=check_key')
        .then(r => r.json())
        .then(data => {
          const badge = document.getElementById('statusBadge');
          const badgeText = document.getElementById('statusBadgeText');
          const banner = document.getElementById('apiKeyBanner');

          if (data.has_key) {
            badge.className = 'hidden md:flex items-center space-x-2 px-3 py-1.5 border-2 border-black shadow-brutal-sm font-mono text-xs font-bold bg-white';
            badgeText.textContent = `AI SIAP (${data.key_preview})`;
            banner.classList.add('hidden');
          } else {
            badge.className = 'hidden md:flex items-center space-x-2 px-3 py-1.5 border-2 border-black shadow-brutal-sm font-mono text-xs font-bold bg-brand-yellow text-black';
            badgeText.textContent = 'KEY KOSONG';
            banner.classList.remove('hidden');
          }

          if (data.audio_dir) {
            const folderBase = data.audio_dir.split(/[\/\\]/).pop();
            document.getElementById('currentStorageFolderDisplay').textContent = folderBase || data.audio_dir;
            document.getElementById('currentStorageFolderDisplay').parentElement.title = data.audio_dir;
            document.getElementById('storageDirInput').value = data.audio_dir;
          }
        })
        .catch(err => console.error('Status check error:', err));
    }

    // -------------------------------------------------------------
    // INITIALIZATION ON DOM READY
    // -------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', async () => {
      safeLucide();
      renderVoiceCards();
      renderToneCards();
      await loadTemplates();
      if (customTemplates && customTemplates.length > 0) {
        applyTemplate(customTemplates[0].id);
      }
      loadSavedAudioList();
      checkKeyHealth();
      setupAudioEvents();
    });
  </script>
</body>
</html>
