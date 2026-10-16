import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Radio,
  Volume2,
  Maximize2,
  Minimize2,
  Bookmark,
  FileText,
  VolumeX,
} from 'lucide-react';

interface HeaderProps {
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  savedCount?: number;
  dialogCount?: number;
  onOpenDialogLibrary?: () => void;
  onScrollToSaved?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleFullscreen,
  isFullscreen = false,
  savedCount = 0,
  dialogCount = 0,
  onOpenDialogLibrary,
  onScrollToSaved,
}) => {
  return (
    <header className="border-b border-[#B11116]/20 bg-white sticky top-0 z-40 shadow-xs">
      {/* Top brand accent bar in yellow & red */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#B11116] via-[#FFC800] to-[#B11116]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand info */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#B11116] text-[#FFC800] flex items-center justify-center shadow-sm shrink-0 border border-[#8A0A0E]">
            <BookOpen className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-stone-900 flex items-center gap-2">
                <span>Penyiar Suara Perpustakaan</span>
                <span className="hidden lg:inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-[#B11116]/10 text-[#B11116] border border-[#B11116]/20">
                  Open Library Surabaya
                </span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live TTS
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Pengubah teks pengumuman menjadi suara santun, merdu & berwibawa khas petugas perpustakaan
            </p>
          </div>
        </div>

        {/* Action buttons & Fullscreen Toggle */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Quick button to open Dialog Library */}
          {onOpenDialogLibrary && (
            <button
              type="button"
              onClick={onOpenDialogLibrary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
              title="Buka Pustaka Naskah Dialog"
            >
              <FileText className="w-3.5 h-3.5 text-[#B11116]" />
              <span>Naskah Dialog ({dialogCount})</span>
            </button>
          )}

          {/* Quick jump to Saved Announcements */}
          {onScrollToSaved && (
            <button
              type="button"
              onClick={onScrollToSaved}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FFC800]/20 hover:bg-[#FFC800]/30 text-[#8A0A0E] border border-[#FFC800]/60 transition-colors"
              title="Lihat Rekaman Pengumuman Tersimpan"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#B11116] fill-current" />
              <span>Koleksi Suara ({savedCount})</span>
            </button>
          )}

          {/* Fullscreen toggle button */}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isFullscreen
                  ? 'bg-[#B11116] text-[#FFC800] ring-2 ring-[#B11116]/40'
                  : 'bg-white hover:bg-stone-50 text-stone-800 border border-stone-300'
              }`}
              title={isFullscreen ? 'Keluar dari Layar Penuh (Esc)' : 'Tampilkan Layar Penuh (Full Screen)'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Keluar Layar Penuh</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#B11116]" />
                  <span>Layar Penuh (Full Screen)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
