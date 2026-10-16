import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Search,
  Plus,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  SlidersHorizontal,
  User,
} from 'lucide-react';
import { PresetAnnouncement } from '../types';
import { VOICE_OPTIONS, TONE_STYLES } from '../constants';
import { Language, translations } from '../utils/translations';

interface ScenarioLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: PresetAnnouncement[];
  onSelectScenario: (scenario: PresetAnnouncement) => void;
  onAddCustomScenario: (scenario: PresetAnnouncement) => void;
  onDeleteCustomScenario: (id: string) => void;
  categories: string[];
  language?: Language;
}

export const ScenarioLibraryModal: React.FC<ScenarioLibraryModalProps> = ({
  isOpen,
  onClose,
  scenarios,
  onSelectScenario,
  onAddCustomScenario,
  onDeleteCustomScenario,
  categories,
  language = 'id',
}) => {
  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New scenario form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0] || 'Tata Tertib');
  const [newText, setNewText] = useState('');
  const [newVoice, setNewVoice] = useState('Kore');
  const [newStyle, setNewStyle] = useState('sopan_lembut');

  // Sync category default if categories change
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(newCategory)) {
      setNewCategory(categories[0]);
    }
  }, [categories, newCategory]);

  if (!isOpen) return null;

  // Filter tabs include 'All' plus dynamic categories, plus any category present in existing scenarios
  const allCategoryTabs = [
    'All',
    ...Array.from(new Set([...categories, ...scenarios.map((s) => s.category)])),
  ];

  const filteredScenarios = scenarios.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyText = (id: string, textToCopy: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;

    const created: PresetAnnouncement = {
      id: `custom-scenario-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory.trim() || 'Custom',
      text: newText.trim(),
      recommendedVoice: newVoice,
      recommendedStyle: newStyle,
      isCustom: true,
      createdAt: Date.now(),
    };

    onAddCustomScenario(created);
    setNewTitle('');
    setNewText('');
    setIsAddingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - Open Library Red (#B11116) and Yellow (#FFC800) */}
        <div className="bg-[#B11116] text-white px-6 py-5 flex items-center justify-between shrink-0 border-b border-[#8F0D11]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFC800] text-[#B11116] flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-5 h-5 text-[#B11116]" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                {t.scenarioModalTitle}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FFC800] text-stone-900">
                  {scenarios.length} {t.templateCount}
                </span>
              </h2>
              <p className="text-xs text-white/80">
                {t.scenarioModalSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Single plus icon button */}
            <button
              type="button"
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FFC800] hover:bg-[#E6B400] text-stone-900 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingNew ? t.closeFormBtn : t.addScenarioBtn}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title={t.closeBtn}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collapsible Form for Adding New Scenario */}
        {isAddingNew && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-5 bg-stone-50 border-b border-stone-200 space-y-4 animate-fadeIn shrink-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#B11116]" />
                {t.newScenarioFormTitle}
              </span>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                {t.cancelBtn}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.scenarioTitleLabel}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.scenarioTitlePlaceholder}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#B11116]/30 focus:border-[#B11116]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.categoryLabel}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#B11116]/30 focus:border-[#B11116] cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.scriptTextLabel}
              </label>
              <textarea
                required
                rows={3}
                placeholder={t.scriptTextPlaceholder}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full p-3 text-xs bg-white rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#B11116]/30 focus:border-[#B11116] leading-relaxed resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.recVoiceLabel}
                </label>
                <select
                  value={newVoice}
                  onChange={(e) => setNewVoice(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:outline-none cursor-pointer"
                >
                  {VOICE_OPTIONS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.gender}) - {v.badge}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.recToneLabel}
                </label>
                <select
                  value={newStyle}
                  onChange={(e) => setNewStyle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:outline-none cursor-pointer"
                >
                  {TONE_STYLES.map((tone) => (
                    <option key={tone.id} value={tone.id}>
                      {tone.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#B11116] hover:bg-[#8F0D11] text-white shadow-xs cursor-pointer"
              >
                {t.saveToLibraryBtn}
              </button>
            </div>
          </form>
        )}

        {/* Search & Dynamic Categories Filter */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/60 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchScenarioPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#B11116]/20 focus:border-[#B11116]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {allCategoryTabs.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#B11116] text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                {cat === 'All' ? t.allCategories : cat}
              </button>
            ))}
          </div>
        </div>

        {/* List of Scenarios */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5">
          {filteredScenarios.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B11116] mx-auto flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-stone-800">{t.noScenarioFound}</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                {t.noScenarioFoundDesc}
              </p>
            </div>
          ) : (
            filteredScenarios.map((scenario) => {
              const isCopied = copiedId === scenario.id;

              return (
                <div
                  key={scenario.id}
                  className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-white hover:border-[#B11116]/40 hover:shadow-xs transition-all space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-red-50 text-[#B11116] border border-red-100">
                          {scenario.category}
                        </span>
                        {scenario.isCustom && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFC800] text-stone-900">
                            {t.customTag}
                          </span>
                        )}
                        <h3 className="font-bold text-sm text-stone-900 truncate">
                          {scenario.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleCopyText(scenario.id, scenario.text, e)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title={t.copyScriptText}
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {scenario.isCustom && (
                        <button
                          type="button"
                          onClick={() => onDeleteCustomScenario(scenario.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title={t.deleteCustomScenario}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onSelectScenario(scenario);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#B11116] hover:bg-[#8F0D11] text-white shadow-xs transition-colors cursor-pointer"
                      >
                        <span>{t.useTemplateBtn}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#FFC800]" />
                      </button>
                    </div>
                  </div>

                  {/* Scenario Script Text Preview */}
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700 leading-relaxed font-sans">
                    "{scenario.text}"
                  </div>

                  {/* Voice & Tone hints */}
                  <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-0.5">
                    {scenario.recommendedVoice && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-[#B11116]" />
                        {t.voiceHint} <strong className="text-stone-700 font-semibold">{scenario.recommendedVoice}</strong>
                      </span>
                    )}
                    {scenario.recommendedStyle && (
                      <span className="flex items-center gap-1">
                        <SlidersHorizontal className="w-3 h-3 text-[#FFC800]" />
                        {t.toneHint} <strong className="text-stone-700 font-semibold">{scenario.recommendedStyle}</strong>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>
            {t.showingTemplates} {filteredScenarios.length} {t.ofTemplates} {scenarios.length} {t.templatesText}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold border border-stone-300 text-stone-700 hover:bg-stone-200/70 transition-colors cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
