import React, { useState, useRef, useEffect } from 'react';
import {
  Bookmark,
  Play,
  Pause,
  RotateCcw,
  Download,
  Trash2,
  Edit2,
  Check,
  Search,
  Volume2,
  Calendar,
  Radio,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SavedAnnouncement } from '../types';
import { base64ToBlobUrl, formatTime } from '../utils/audio';

interface SavedAnnouncementsPanelProps {
  savedAnnouncements: SavedAnnouncement[];
  onLoadToMainPlayer: (item: SavedAnnouncement) => void;
  onDeleteAnnouncement: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  activePlayingAudioId: string | null;
  onSetActivePlayingAudioId: (id: string | null) => void;
}

export const SavedAnnouncementsPanel: React.FC<SavedAnnouncementsPanelProps> = ({
  savedAnnouncements,
  onLoadToMainPlayer,
  onDeleteAnnouncement,
  onUpdateTitle,
  activePlayingAudioId,
  onSetActivePlayingAudioId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Active playing audio state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPlayTime, setCurrentPlayTime] = useState<number>(0);
  const [playDuration, setPlayDuration] = useState<number>(0);
  const [activeItem, setActiveItem] = useState<SavedAnnouncement | null>(null);
  const [activeBlobUrl, setActiveBlobUrl] = useState<string | null>(null);

  const categories = [
    'Semua',
    ...Array.from(new Set(savedAnnouncements.map((a) => a.category || 'Umum'))),
  ];

  const filtered = savedAnnouncements.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.voice.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === 'Semua' || (item.category || 'Umum') === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleTogglePlayItem = (item: SavedAnnouncement) => {
    if (activeItem?.id === item.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      // Switch item
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
      const url = base64ToBlobUrl(item.audioBase64, item.mimeType || 'audio/wav');
      setActiveBlobUrl(url);
      setActiveItem(item);
      onSetActivePlayingAudioId(item.id);
      setCurrentPlayTime(0);

      // Play after state change
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
          setIsPlaying(true);
        }
      }, 50);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentPlayTime(0);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentPlayTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setPlayDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentPlayTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleDownload = (item: SavedAnnouncement) => {
    const blobUrl = base64ToBlobUrl(item.audioBase64, item.mimeType || 'audio/wav');
    const a = document.createElement('a');
    a.href = blobUrl;
    const safeTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `pengumuman-${safeTitle}-${item.voice.toLowerCase()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  const startEditTitle = (item: SavedAnnouncement) => {
    setEditingId(item.id);
    setEditedTitle(item.title);
  };

  const saveEditedTitle = (id: string) => {
    if (editedTitle.trim()) {
      onUpdateTitle(id, editedTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
      {/* Hidden audio element for inline playback */}
      {activeBlobUrl && (
        <audio
          ref={audioRef}
          src={activeBlobUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />
      )}

      {/* Header */}
      <div className="bg-[#B11116] text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFC800] text-[#B11116] flex items-center justify-center font-bold shadow-xs shrink-0">
            <Bookmark className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Koleksi Pengumuman Tersimpan & Rekaman
              </h3>
              <span className="bg-[#FFC800] text-stone-900 font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                {savedAnnouncements.length} Tersimpan
              </span>
            </div>
            <p className="text-xs text-white/80 mt-0.5">
              Putar ulang kapan saja rekaman pengumuman perpustakaan tanpa perlu generate ulang
            </p>
          </div>
        </div>

        {/* Global Inline Active Player bar if playing */}
        {activeItem && (
          <div className="bg-black/30 border border-white/20 rounded-xl p-2.5 px-3 flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleTogglePlayItem(activeItem)}
              className="w-8 h-8 rounded-lg bg-[#FFC800] hover:bg-[#E6B400] text-stone-900 flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-xs"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-white truncate max-w-[180px]">
                {activeItem.title}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-mono">
                <span>{formatTime(currentPlayTime)}</span>
                <span>/</span>
                <span>{formatTime(playDuration)}</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={playDuration || 100}
              step={0.1}
              value={currentPlayTime}
              onChange={handleSeek}
              className="w-24 accent-[#FFC800] h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 border-b border-stone-100 bg-stone-50/70 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari rekaman pengumuman berdasarkan judul, teks, atau suara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#B11116]"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap border transition-all ${
                selectedCategory === cat
                  ? 'bg-[#B11116] text-white border-[#B11116] font-semibold shadow-xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="p-4 sm:p-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-stone-200 rounded-xl bg-stone-50/40">
            <div className="w-12 h-12 rounded-2xl bg-[#B11116]/10 text-[#B11116] mx-auto flex items-center justify-center mb-3">
              <Bookmark className="w-6 h-6 text-[#B11116]" />
            </div>
            <h4 className="text-sm font-bold text-stone-800">Belum Ada Pengumuman Tersimpan</h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 leading-relaxed">
              Setelah menghasilkan audio di atas, klik tombol{' '}
              <strong className="text-[#B11116]">"Simpan ke Koleksi"</strong> pada pemutar untuk
              menyimpan rekaman audio suara secara permanen di web ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map((item) => {
              const isThisPlaying = activeItem?.id === item.id && isPlaying;
              const isThisActive = activeItem?.id === item.id;
              const isExpanded = expandedId === item.id;

              return (
                <div
                  key={item.id}
                  className={`border rounded-xl p-4 sm:p-4.5 transition-all bg-white ${
                    isThisActive
                      ? 'border-[#B11116] ring-2 ring-[#B11116]/20 shadow-md'
                      : 'border-stone-200 hover:border-[#B11116]/40 hover:shadow-sm'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Left: Play button + Title and metadata */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleTogglePlayItem(item)}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm ${
                          isThisPlaying
                            ? 'bg-[#B11116] text-[#FFC800] animate-pulse ring-2 ring-[#B11116]'
                            : 'bg-[#FFC800] hover:bg-[#E6B400] text-stone-900 ring-1 ring-[#E6B400]'
                        }`}
                        title={isThisPlaying ? 'Jeda Audio' : 'Putar Audio Sekarang'}
                      >
                        {isThisPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        {editingId === item.id ? (
                          <div className="flex items-center gap-2 mb-1">
                            <input
                              type="text"
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              className="px-2.5 py-1 text-sm border border-[#B11116] rounded-lg font-bold text-stone-900 focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => saveEditedTitle(item.id)}
                              className="p-1 rounded bg-[#B11116] text-white hover:bg-[#8A0A0E]"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-stone-900 truncate">
                              {item.title}
                            </h4>
                            <button
                              type="button"
                              onClick={() => startEditTitle(item)}
                              className="text-stone-400 hover:text-stone-700 p-0.5 rounded transition-colors"
                              title="Ubah judul pengumuman"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                          <span className="font-semibold text-[11px] px-2 py-0.5 rounded-md bg-[#FFC800]/20 text-[#8A0A0E] border border-[#FFC800]/40">
                            {item.category || 'Umum'}
                          </span>
                          <span className="flex items-center gap-1 text-stone-600">
                            <Volume2 className="w-3 h-3 text-[#B11116]" />
                            {item.voice}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-stone-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {/* Load to main player button */}
                      <button
                        type="button"
                        onClick={() => onLoadToMainPlayer(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-[#B11116] hover:text-white text-stone-700 transition-colors"
                        title="Buka pengumuman ini di pemutar utama"
                      >
                        <Radio className="w-3.5 h-3.5 text-[#B11116] group-hover:text-white" />
                        <span>Buka di Konsol</span>
                      </button>

                      {/* Download WAV */}
                      <button
                        type="button"
                        onClick={() => handleDownload(item)}
                        className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:text-[#B11116] hover:border-[#B11116] hover:bg-[#B11116]/5 transition-colors"
                        title="Unduh file suara .wav"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus rekaman "${item.title}" dari koleksi?`)) {
                            onDeleteAnnouncement(item.id);
                          }
                        }}
                        className="p-2 rounded-xl border border-stone-200 text-stone-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors"
                        title="Hapus rekaman"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Expand / Collapsed details */}
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="p-2 rounded-xl text-stone-400 hover:text-stone-700 transition-colors"
                        title={isExpanded ? 'Tutup teks' : 'Lihat naskah'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Scrubber if active */}
                  {isThisActive && (
                    <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-3">
                      <span className="text-[10px] font-mono text-stone-500">
                        {formatTime(currentPlayTime)}
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={playDuration || 100}
                        step={0.1}
                        value={currentPlayTime}
                        onChange={handleSeek}
                        className="flex-1 accent-[#B11116] h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-stone-500">
                        {formatTime(playDuration)}
                      </span>
                    </div>
                  )}

                  {/* Expanded text content */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-stone-100 bg-stone-50/70 p-3 rounded-lg text-xs text-stone-700 leading-relaxed font-sans">
                      <strong className="block text-stone-800 mb-1 font-semibold">
                        Naskah Pengumuman:
                      </strong>
                      <p className="italic">"{item.text}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
