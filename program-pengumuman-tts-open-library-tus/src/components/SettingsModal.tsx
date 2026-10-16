import React, { useState } from 'react';
import {
  X,
  Settings,
  Plus,
  Trash2,
  RotateCcw,
  Tag,
  Languages,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAddCategory: (categoryName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
  onResetCategories: () => void;
  language: Language;
  onChangeLanguage: (lang: Language) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
  onResetCategories,
  language,
  onChangeLanguage,
}) => {
  const t = translations[language];

  const [newCatInput, setNewCatInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatInput.trim();
    if (!trimmed) return;

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg(
        language === 'id'
          ? `Kategori "${trimmed}" sudah ada.`
          : `Category "${trimmed}" already exists.`
      );
      return;
    }

    onAddCategory(trimmed);
    setNewCatInput('');
    setErrorMsg(null);
  };

  const handleDelete = (catName: string) => {
    onDeleteCategory(catName);
    setConfirmDelete(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header - Open Library Red (#B11116) and Yellow (#FFC800) */}
        <div className="bg-[#B11116] text-white px-6 py-5 flex items-center justify-between shrink-0 border-b border-[#8F0D11]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFC800] text-[#B11116] flex items-center justify-center font-bold shadow-xs">
              <Settings className="w-5 h-5 text-[#B11116]" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                {t.settingsModalTitle}
              </h2>
              <p className="text-xs text-white/80">
                {t.settingsModalSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title={t.closeBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Language Switcher (2 Options: Bahasa Indonesia & English) */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-[#B11116]" />
              <label className="text-xs font-bold uppercase tracking-wider text-stone-800">
                {t.languageSectionTitle}
              </label>
            </div>
            <p className="text-[11px] text-stone-500">
              {t.languageSectionDesc}
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Option 1: Bahasa Indonesia */}
              <button
                type="button"
                onClick={() => onChangeLanguage('id')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  language === 'id'
                    ? 'border-[#B11116] bg-red-50/80 ring-2 ring-[#B11116]/30 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🇮🇩</span>
                  <div>
                    <span className="block text-xs font-bold text-stone-800">
                      Bahasa Indonesia
                    </span>
                    <span className="block text-[10px] text-stone-400">
                      Default perpustakaan
                    </span>
                  </div>
                </div>
                {language === 'id' && (
                  <Check className="w-4 h-4 text-[#B11116]" />
                )}
              </button>

              {/* Option 2: English */}
              <button
                type="button"
                onClick={() => onChangeLanguage('en')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  language === 'en'
                    ? 'border-[#B11116] bg-red-50/80 ring-2 ring-[#B11116]/30 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🇬🇧</span>
                  <div>
                    <span className="block text-xs font-bold text-stone-800">
                      English
                    </span>
                    <span className="block text-[10px] text-stone-400">
                      International visitors
                    </span>
                  </div>
                </div>
                {language === 'en' && (
                  <Check className="w-4 h-4 text-[#B11116]" />
                )}
              </button>
            </div>
          </div>

          {/* Section 2: Form Tambah Kategori Baru */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              {t.newCategoryLabel}
            </label>
            <form onSubmit={handleAddSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t.newCategoryPlaceholder}
                  value={newCatInput}
                  onChange={(e) => {
                    setNewCatInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 rounded-xl border border-stone-300 text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B11116]/20 focus:border-[#B11116]"
                />
              </div>
              <button
                type="submit"
                disabled={!newCatInput.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#B11116] hover:bg-[#8F0D11] text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 text-[#FFC800]" />
                <span>{t.addBtn}</span>
              </button>
            </form>

            {errorMsg && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}
          </div>

          {/* Section 3: Daftar Kategori Aktif */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                {t.activeCategoriesList} ({categories.length})
              </label>
              <span className="text-[11px] text-stone-400">
                {t.categoriesInfo}
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {categories.length === 0 ? (
                <div className="text-center py-6 text-stone-400 text-xs border border-dashed border-stone-200 rounded-xl">
                  {t.emptyCategories}
                </div>
              ) : (
                categories.map((cat) => {
                  const isPendingDelete = confirmDelete === cat;

                  return (
                    <div
                      key={cat}
                      className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-[#B11116]" />
                        <span className="text-xs font-bold text-stone-800">
                          {cat}
                        </span>
                      </div>

                      {isPendingDelete ? (
                        <div className="flex items-center gap-1.5 animate-fadeIn">
                          <span className="text-[11px] text-rose-600 font-semibold mr-1">
                            {t.deleteCategoryConfirm}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat)}
                            className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 transition-colors cursor-pointer"
                          >
                            {t.confirmYes}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            className="px-2 py-1 rounded-lg bg-stone-200 text-stone-700 text-[10px] font-bold hover:bg-stone-300 transition-colors cursor-pointer"
                          >
                            {t.confirmCancel}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(cat)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title={`Hapus kategori "${cat}"`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 4: Reset ke Kategori Bawaan */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-stone-800">
                {t.restoreDefaultsTitle}
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {t.restoreDefaultsDesc}
              </p>
            </div>
            <button
              type="button"
              onClick={onResetCategories}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-stone-700 border border-amber-300 hover:bg-amber-100 hover:text-stone-900 transition-colors shrink-0 shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#B11116]" />
              <span>{t.restoreDefaultsBtn}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#B11116] hover:bg-[#8F0D11] text-white transition-colors cursor-pointer shadow-xs"
          >
            {t.doneBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
