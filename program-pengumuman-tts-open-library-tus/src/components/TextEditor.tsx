import React, { useState } from 'react';
import {
  FileText,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Wand2,
  Clock,
  BookOpen,
  PlusCircle,
  BookmarkPlus,
  Layers,
  Trash2,
} from 'lucide-react';
import { INITIAL_ANNOUNCEMENT } from '../constants';
import { PresetAnnouncement } from '../types';

interface TextEditorProps {
  text: string;
  onChangeText: (newText: string) => void;
  scenarios: PresetAnnouncement[];
  onSelectPreset: (preset: PresetAnnouncement) => void;
  selectedPresetId: string | null;
  onRefineWithAI: () => void;
  isRefining: boolean;
  disabled?: boolean;
  onOpenSaveDialogModal: () => void;
  onOpenAddScenarioModal: () => void;
  onOpenDialogLibraryModal: () => void;
  onDeleteCustomScenario?: (id: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  onChangeText,
  scenarios,
  onSelectPreset,
  selectedPresetId,
  onRefineWithAI,
  isRefining,
  disabled = false,
  onOpenSaveDialogModal,
  onOpenAddScenarioModal,
  onOpenDialogLibraryModal,
  onDeleteCustomScenario,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('Semua');

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const estimatedSeconds = Math.max(2, Math.round(wordCount / 2.2)); // ~130 wpm for polite announcement

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetOriginal = () => {
    onChangeText(INITIAL_ANNOUNCEMENT);
  };

  const categories = ['Semua', ...Array.from(new Set(scenarios.map((s) => s.category)))];

  const filteredScenarios = scenarios.filter(
    (s) => filterCategory === 'Semua' || s.category === filterCategory
  );

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 space-y-4">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#B11116]/10 text-[#B11116] border border-[#B11116]/20">
            <FileText className="w-4 h-4 text-[#B11116]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              Naskah Pengumuman Perpustakaan
            </h2>
            <span className="text-xs text-stone-500">
              Ketik naskah bebas, pilih skenario, atau simpan sebagai dialog tetap
            </span>
          </div>
        </div>

        {/* Action buttons: Save Dialog, Dialog Library, AI Refine */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Simpan Dialog Ini */}
          <button
            type="button"
            onClick={onOpenSaveDialogModal}
            disabled={!text.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FFC800] hover:bg-[#E6B400] text-stone-900 border border-[#E6B400] transition-colors disabled:opacity-50 shadow-xs"
            title="Simpan naskah teks saat ini ke Pustaka Dialog"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-[#B11116]" />
            <span>Simpan Dialog</span>
          </button>

          {/* Pustaka Dialog */}
          <button
            type="button"
            onClick={onOpenDialogLibraryModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
            title="Lihat naskah dialog tersimpan"
          >
            <Layers className="w-3.5 h-3.5 text-stone-600" />
            <span>Pustaka Dialog</span>
          </button>

          {/* AI Refine */}
          <button
            type="button"
            onClick={onRefineWithAI}
            disabled={disabled || isRefining || !text.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#B11116]/10 hover:bg-[#B11116]/15 text-[#B11116] border border-[#B11116]/20 transition-colors disabled:opacity-50"
            title="Gunakan AI untuk memoles pilihan kata agar lebih santun dan halus"
          >
            <Wand2 className={`w-3.5 h-3.5 text-[#B11116] ${isRefining ? 'animate-spin' : ''}`} />
            <span>{isRefining ? 'Menghaluskan...' : 'Perhalus Kata (AI)'}</span>
          </button>

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-50 transition-colors"
            title="Salin naskah"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin</span>
              </>
            )}
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={handleResetOriginal}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-50 transition-colors"
            title="Kembalikan ke naskah penutupan awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Scenarios Section with Add Scenario button */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#B11116]" />
              Pilih Skenario Siaran:
            </span>
            {categories.length > 2 && (
              <div className="flex items-center gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors ${
                      filterCategory === cat
                        ? 'bg-[#B11116] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tombol Tambah Skenario Baru */}
          <button
            type="button"
            onClick={onOpenAddScenarioModal}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-[#B11116] hover:bg-[#8A0A0E] text-white shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#FFC800]" />
            <span>+ Tambah Skenario</span>
          </button>
        </div>

        {/* Scenario pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {filteredScenarios.map((preset) => {
            const isActive = selectedPresetId === preset.id;
            return (
              <div key={preset.id} className="relative group shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectPreset(preset)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl whitespace-nowrap border transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#B11116] text-white border-[#B11116] font-bold shadow-xs ring-2 ring-[#FFC800]/50'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-[#B11116]/30'
                  }`}
                >
                  <span>{preset.title}</span>
                  {preset.isCustom && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FFC800] text-stone-900 font-bold ml-1">
                      Kustom
                    </span>
                  )}
                </button>

                {preset.isCustom && onDeleteCustomScenario && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Hapus skenario kustom "${preset.title}"?`)) {
                        onDeleteCustomScenario(preset.id);
                      }
                    }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-stone-300 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                    title="Hapus skenario kustom"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          rows={5}
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          disabled={disabled}
          placeholder="Tuliskan naskah pengumuman yang ingin diubah menjadi suara..."
          className="w-full p-4 rounded-xl border border-stone-200 bg-stone-50/40 text-stone-900 text-sm sm:text-base leading-relaxed focus:bg-white focus:border-[#B11116] focus:ring-2 focus:ring-[#B11116]/20 focus:outline-none transition-all resize-y font-sans"
        />
      </div>

      {/* Footer info stats */}
      <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 pt-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium text-stone-700">
            <Clock className="w-3.5 h-3.5 text-[#B11116]" />
            Estimasi durasi: ~{estimatedSeconds} detik
          </span>
          <span>•</span>
          <span>{wordCount} kata</span>
          <span>•</span>
          <span>{text.length} karakter</span>
        </div>

        <span className="text-stone-400 italic">
          Tip: Siaran santun perpustakaan menggunakan jeda yang teratur dan nada menenangkan
        </span>
      </div>
    </div>
  );
};
