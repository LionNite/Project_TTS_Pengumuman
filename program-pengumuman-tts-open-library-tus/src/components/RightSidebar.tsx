import React, { useState, useRef } from 'react';
import {
  Bookmark,
  Play,
  Pause,
  Download,
  Trash2,
  Edit2,
  Check,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SavedAnnouncement } from '../types';
import { base64ToBlobUrl, formatTime } from '../utils/audio';
import { Language, translations } from '../utils/translations';

interface RightSidebarProps {
  savedAnnouncements: SavedAnnouncement[];
  onLoadToWorkspace: (item: SavedAnnouncement) => void;
  onDeleteAnnouncement: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  activePlayingId: string | null;
  onSetActivePlayingId: (id: string | null) => void;
  language?: Language;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  savedAnnouncements,
  onLoadToWorkspace,
  onDeleteAnnouncement,
  onUpdateTitle,
  activePlayingId,
  onSetActivePlayingId,
  language = 'id',
}) => {
  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Audio player state for inline item playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [activeItem, setActiveItem] = useState<SavedAnnouncement | null>(null);
  const [activeBlobUrl, setActiveBlobUrl] = useState<string | null>(null);

  const categories = [
    'All',
    ...Array.from(new Set(savedAnnouncements.map((a) => a.category || 'General'))),
  ];

  const filtered = savedAnnouncements.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.voice.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      filterCategory === 'All' || (item.category || 'General') === filterCategory;
    return matchesSearch && matchesCat;
  });

  const handleTogglePlay = (item: SavedAnnouncement) => {
    if (activeItem?.id === item.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
      const url = base64ToBlobUrl(item.audioBase64, item.mimeType || 'audio/wav');
      setActiveBlobUrl(url);
      setActiveItem(item);
      onSetActivePlayingId(item.id);
      setCurrentTime(0);

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
          setIsPlaying(true);
        }
      }, 50);
    }
  };

  const handleConfirmDelete = (item: SavedAnnouncement) => {
    // If the active item being played is deleted, pause and reset audio
    if (activeItem?.id === item.id) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setActiveItem(null);
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
        setActiveBlobUrl(null);
      }
      onSetActivePlayingId(null);
    }
    onDeleteAnnouncement(item.id);
    setPendingDeleteId(null);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleDownload = (item: SavedAnnouncement) => {
    const blobUrl = base64ToBlobUrl(item.audioBase64, item.mimeType || 'audio/wav');
    const a = document.createElement('a');
    a.href = blobUrl;
    const cleanTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `pengumuman-${cleanTitle}-${item.voice.toLowerCase()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  const startEdit = (item: SavedAnnouncement) => {
    setEditingId(item.id);
    setEditedTitle(item.title);
  };

  const saveEdit = (id: string) => {
    if (editedTitle.trim()) {
      onUpdateTitle(id, editedTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className="w-80 lg:w-96 flex flex-col bg-white border-l border-stone-200 shadow-xs shrink-0 select-none z-20">
      {/* Hidden audio element for inline playback */}
      {activeBlobUrl && (
        <audio
          ref={audioRef}
          src={activeBlobUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}

      {/* Top Header - Named "Audio tersimpan" */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-[#B11116] flex items-center justify-center font-bold">
            <Bookmark className="w-4 h-4 fill-current text-[#B11116]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-800">
              {t.savedAudioTitle}
            </h2>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-[#B11116] border border-red-100">
          {savedAnnouncements.length} {t.filesCount}
        </span>
      </div>

      {/* Search & Category Filter */}
      <div className="p-4 border-b border-stone-100 space-y-2.5 bg-stone-50/50">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchAudioPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#B11116]/20 focus:border-[#B11116]"
          />
        </div>

        {/* Categories */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-[#B11116] text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {cat === 'All' ? t.allCategories : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active player preview widget in Solid Red #B11116 and Yellow #FFC800 */}
      {activeItem && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-[#B11116] text-white shadow-md border border-[#8F0D11] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold truncate max-w-[190px]">{activeItem.title}</span>
            <span className="text-[10px] font-mono text-white/90">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTogglePlay(activeItem)}
              className="w-7 h-7 rounded-lg bg-[#FFC800] text-stone-900 flex items-center justify-center shrink-0 shadow-xs hover:bg-[#E6B400] transition-colors font-bold cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 accent-[#FFC800] h-1.5 bg-white/30 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* List of Audio Items */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B11116] mx-auto flex items-center justify-center mb-3">
              <Bookmark className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-stone-700">{t.noSavedAudio}</h4>
            <p className="text-[11px] text-stone-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
              {t.noSavedAudioDesc}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isThisPlaying = activeItem?.id === item.id && isPlaying;
            const isThisActive = activeItem?.id === item.id;
            const isExpanded = expandedId === item.id;
            const isPendingDelete = pendingDeleteId === item.id;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all bg-white ${
                  isThisActive
                    ? 'border-[#B11116]/60 ring-2 ring-red-50 shadow-xs'
                    : 'border-stone-100 hover:border-stone-200 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Play & Info */}
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleTogglePlay(item)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-xs cursor-pointer ${
                        isThisPlaying
                          ? 'bg-[#B11116] text-[#FFC800] animate-pulse'
                          : 'bg-[#FFC800] text-stone-900 hover:bg-[#E6B400]'
                      }`}
                      title={isThisPlaying ? t.pause : t.playAudio}
                    >
                      {isThisPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-1.5 mb-1">
                          <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className="px-2 py-0.5 text-xs border border-[#B11116] rounded-md font-bold text-stone-800 focus:outline-none w-full"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => saveEdit(item.id)}
                            className="p-1 rounded bg-[#B11116] text-white cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h4 className="text-xs font-bold text-stone-800 truncate">
                            {item.title}
                          </h4>
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="text-stone-300 hover:text-stone-600 p-0.5 rounded transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-stone-400">
                        <span className="font-semibold text-[#B11116] bg-red-50 px-1.5 py-0.2 rounded border border-red-100">
                          {item.voice}
                        </span>
                        <span>•</span>
                        <span>{item.style}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Inline Delete Confirmation (No window.confirm) */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isPendingDelete ? (
                      <div className="flex items-center gap-1 animate-fadeIn bg-rose-50 p-1 rounded-xl border border-rose-200">
                        <span className="text-[10px] text-rose-700 font-bold px-1">
                          {t.deleteConfirm}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(item)}
                          className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                          title={t.confirmYes}
                        >
                          {t.confirmYes}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(null)}
                          className="px-1.5 py-0.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-[10px] transition-colors cursor-pointer"
                          title={t.confirmCancel}
                        >
                          {t.confirmCancel}
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDownload(item)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-[#B11116] hover:bg-red-50 transition-colors cursor-pointer"
                          title={t.downloadWavShort}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(item.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title={t.deleteShort}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                          title={isExpanded ? t.hideScript : t.viewScript}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded text & Load to Workspace button */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-stone-100 text-[11px] text-stone-600 space-y-2">
                    <p className="italic bg-stone-50 p-2 rounded-xl text-stone-600 leading-relaxed border border-stone-100">
                      "{item.text}"
                    </p>
                    <button
                      type="button"
                      onClick={() => onLoadToWorkspace(item)}
                      className="w-full py-1.5 px-3 rounded-xl bg-red-50 hover:bg-[#B11116] hover:text-white text-[#B11116] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{t.loadIntoWorkspace}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
