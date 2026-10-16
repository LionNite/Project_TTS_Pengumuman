import React, { useState } from 'react';
import {
  Wand2,
  Copy,
  Check,
  RotateCcw,
  Clock,
  User,
  SlidersHorizontal,
  BookmarkPlus,
  BookOpen,
  Maximize2,
  Minimize2,
  Menu,
  Play,
  Sparkles,
} from 'lucide-react';
import { VOICE_OPTIONS, TONE_STYLES } from '../constants';
import { PresetAnnouncement, VoiceOption, ToneStyle } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { Language, translations } from '../utils/translations';

interface CenterWorkspaceProps {
  text: string;
  onChangeText: (newText: string) => void;
  selectedVoice: string;
  onChangeVoice: (voiceId: string) => void;
  selectedToneId: string;
  onChangeTone: (toneId: string) => void;
  onGenerateAudio: () => void;
  onReset: () => void;
  isLoading: boolean;
  isRefining: boolean;
  onRefineWithAI: () => void;
  allScenarios: PresetAnnouncement[];
  onSelectScenario: (scenario: PresetAnnouncement) => void;
  selectedScenarioId: string | null;
  onOpenSaveDialog: () => void;
  onOpenScenarioLibrary: () => void;
  audioBlobUrl: string | null;
  useChime: boolean;
  onToggleChime: (val: boolean) => void;
  onOpenSaveAudioModal: () => void;
  isAudioSaved: boolean;
  generatedVoiceName: string;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  language?: Language;
}

export const CenterWorkspace: React.FC<CenterWorkspaceProps> = ({
  text,
  onChangeText,
  selectedVoice,
  onChangeVoice,
  selectedToneId,
  onChangeTone,
  onGenerateAudio,
  onReset,
  isLoading,
  isRefining,
  onRefineWithAI,
  allScenarios,
  onSelectScenario,
  selectedScenarioId,
  onOpenSaveDialog,
  onOpenScenarioLibrary,
  audioBlobUrl,
  useChime,
  onToggleChime,
  onOpenSaveAudioModal,
  isAudioSaved,
  generatedVoiceName,
  isSidebarCollapsed,
  onToggleSidebar,
  isFullscreen,
  onToggleFullscreen,
  language = 'id',
}) => {
  const t = translations[language];

  const [copied, setCopied] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [voiceSelectorMode, setVoiceSelectorMode] = useState<'cards' | 'dropdown'>('cards');

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const estimatedSeconds = Math.max(2, Math.round(wordCount / 2.2));

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredScenarios = allScenarios.filter(
    (s) => filterCategory === 'All' || s.category === filterCategory
  );

  const selectedToneObj = TONE_STYLES.find((tg) => tg.id === selectedToneId);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      {/* Top Navbar Header */}
      <header className="h-20 px-6 sm:px-8 flex items-center justify-between border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {/* Toggle sidebar button when collapsed */}
          {isSidebarCollapsed && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-2 rounded-2xl bg-red-50 hover:bg-red-100 text-[#B11116] transition-colors shadow-xs cursor-pointer"
              title={t.expandSidebar}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <h1 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <span>{t.studioTitle}</span>
              <span className="hidden sm:inline-flex text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-[#B11116] border border-red-100">
                {t.modelBadge}
              </span>
            </h1>
            <p className="text-xs text-stone-400 hidden sm:block">
              {t.studioSubtitle}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenScenarioLibrary}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-stone-800 border border-amber-200/80 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#B11116]" />
            <span>{t.scenarioLibrary}</span>
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all border shadow-xs bg-white hover:bg-stone-50 text-stone-700 border-stone-200 cursor-pointer"
            title={isFullscreen ? t.exitFullscreen : t.fullscreen}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-[#B11116]" />
                <span className="hidden sm:inline">{t.exitFullscreen}</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-[#B11116]" />
                <span className="hidden sm:inline">{t.fullscreen}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Quick Scenario Preset Chips */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#B11116]" />
              {t.quickTemplates}
            </span>
            <button
              type="button"
              onClick={onOpenScenarioLibrary}
              className="text-xs font-bold text-[#B11116] hover:text-[#8F0D11] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{t.openScenarioLibrary}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {filteredScenarios.map((scen) => {
              const isSelected = selectedScenarioId === scen.id;
              return (
                <button
                  key={scen.id}
                  type="button"
                  onClick={() => onSelectScenario(scen)}
                  className={`text-xs px-3.5 py-1.5 rounded-2xl whitespace-nowrap border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#B11116] text-white border-[#B11116] font-bold shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-red-50/50 hover:border-[#B11116]/40'
                  }`}
                >
                  <span>{scen.title}</span>
                  {scen.isCustom && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#FFC800] text-stone-900 font-bold">
                      {t.customTag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 1: TEXT INPUT SECTION */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-800">
                {t.scriptSectionTitle}
              </h3>
              <p className="text-xs text-stone-400">
                {t.scriptSectionDesc}
              </p>
            </div>

            {/* Script action buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={onRefineWithAI}
                disabled={isRefining || !text.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FFC800] hover:bg-[#E6B400] text-stone-900 border border-amber-300 transition-colors disabled:opacity-50 cursor-pointer"
                title={t.refineWithAi}
              >
                <Wand2 className={`w-3.5 h-3.5 text-[#B11116] ${isRefining ? 'animate-spin' : ''}`} />
                <span>{isRefining ? t.refining : t.refineWithAi}</span>
              </button>

              <button
                type="button"
                onClick={onOpenSaveDialog}
                disabled={!text.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors disabled:opacity-50 cursor-pointer"
                title={t.saveScript}
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-[#B11116]" />
                <span>{t.saveScript}</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!text.trim()}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-50 transition-colors disabled:opacity-50 cursor-pointer"
                title={t.copy}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.copy}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Large Clean Textarea */}
          <div className="relative">
            <textarea
              rows={5}
              value={text}
              onChange={(e) => onChangeText(e.target.value)}
              placeholder={t.scriptPlaceholder}
              className="w-full p-4 rounded-2xl border border-stone-200 bg-stone-50/40 text-stone-900 text-sm sm:text-base leading-relaxed focus:bg-white focus:border-[#B11116] focus:ring-4 focus:ring-[#B11116]/10 focus:outline-none transition-all resize-y placeholder:text-stone-400"
            />
          </div>

          {/* Footer Counters */}
          <div className="flex flex-wrap items-center justify-between text-xs text-stone-400 pt-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-stone-700">
                <Clock className="w-3.5 h-3.5 text-[#B11116]" />
                {t.estDuration} ~{estimatedSeconds}s
              </span>
              <span>•</span>
              <span>{wordCount} {t.words}</span>
              <span>•</span>
              <span>{text.length} {t.characters}</span>
            </div>

            <span className="italic text-stone-400 hidden sm:inline">
              {t.scriptTip}
            </span>
          </div>
        </div>

        {/* SECTION 2: VOICE CONFIGURATION SECTION */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-800">
                {t.voiceSectionTitle}
              </h3>
              <p className="text-xs text-stone-400">
                {t.voiceSectionDesc}
              </p>
            </div>

            {/* Toggle view mode for Voice Actor */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setVoiceSelectorMode('cards')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  voiceSelectorMode === 'cards'
                    ? 'bg-white text-[#B11116] shadow-xs font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {t.viewCards}
              </button>
              <button
                type="button"
                onClick={() => setVoiceSelectorMode('dropdown')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  voiceSelectorMode === 'dropdown'
                    ? 'bg-white text-[#B11116] shadow-xs font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {t.viewDropdown}
              </button>
            </div>
          </div>

          {/* 1. Voice Actor Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                <User className="w-4 h-4 text-[#B11116]" />
                {t.voiceActorLabel}
              </label>
              {selectedVoice ? (
                <span className="text-xs font-bold text-[#B11116] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                  {t.selectedVoice} {selectedVoice}
                </span>
              ) : (
                <span className="text-xs text-stone-400 italic">
                  {t.noVoiceSelected}
                </span>
              )}
            </div>

            {voiceSelectorMode === 'dropdown' ? (
              <select
                value={selectedVoice}
                onChange={(e) => onChangeVoice(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-stone-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#B11116]/20 focus:border-[#B11116] bg-white cursor-pointer"
              >
                <option value="">{t.chooseVoiceDropdown}</option>
                {VOICE_OPTIONS.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} ({voice.gender}) — {voice.toneDesc.slice(0, 40)}...
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {VOICE_OPTIONS.map((voice: VoiceOption) => {
                  const isSelected = selectedVoice === voice.id;
                  return (
                    <button
                      key={voice.id}
                      type="button"
                      onClick={() => onChangeVoice(isSelected ? '' : voice.id)}
                      className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#B11116] bg-red-50/70 shadow-xs ring-2 ring-[#B11116]/30'
                          : 'border-stone-200 hover:border-[#B11116]/40 bg-white hover:bg-stone-50/70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isSelected
                                ? 'bg-[#B11116] text-[#FFC800]'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {voice.name[0]}
                          </div>

                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                              voice.gender === 'Wanita'
                                ? 'bg-pink-50 text-pink-700'
                                : voice.gender === 'Pria'
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {voice.gender}
                          </span>
                        </div>

                        <div className="font-bold text-stone-900 text-sm mb-1">
                          {voice.name}
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                          {voice.toneDesc}
                        </p>
                      </div>

                      {voice.badge && (
                        <div className="mt-2.5 pt-2 border-t border-stone-100 text-[10px] font-bold text-[#B11116] flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-[#FFC800] fill-current" />
                          <span>{voice.badge}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Voice Type / Style Selection */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#B11116]" />
                {t.toneStyleLabel}
              </label>
              {selectedToneId ? (
                <span className="text-xs font-bold text-[#B11116] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                  {t.selectedTone} {selectedToneObj?.label}
                </span>
              ) : (
                <span className="text-xs text-stone-400 italic">
                  {t.noToneSelected}
                </span>
              )}
            </div>

            <select
              value={selectedToneId}
              onChange={(e) => onChangeTone(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-stone-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#B11116]/20 focus:border-[#B11116] bg-white cursor-pointer"
            >
              <option value="">{t.chooseToneDropdown}</option>
              {TONE_STYLES.map((tone: ToneStyle) => (
                <option key={tone.id} value={tone.id}>
                  {tone.label} — {tone.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SECTION 3: ACTION BUTTON BAR (BOTTOM OF WORKSPACE) */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-4 sm:p-5 flex items-center justify-between gap-4">
          {/* Left-aligned button: Generate Audio in Red #B11116 with Yellow #FFC800 */}
          <button
            type="button"
            onClick={onGenerateAudio}
            disabled={isLoading || !text.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-[#B11116] hover:bg-[#8F0D11] shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-[#FFC800]" />
                <span>{t.generatingAudio}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5 text-[#FFC800]" />
                <span>{t.generateAudio}</span>
              </>
            )}
          </button>

          {/* Right-aligned button: Reset */}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-2xl font-bold text-sm text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-all active:scale-98 cursor-pointer"
            title={t.resetTooltip}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.reset}</span>
          </button>
        </div>

        {/* INTERACTIVE AUDIO PLAYER OUTPUT (When generated) */}
        {audioBlobUrl && (
          <div className="space-y-2 animate-fadeIn">
            <AudioPlayer
              audioBlobUrl={audioBlobUrl}
              isLoading={isLoading}
              onGenerate={onGenerateAudio}
              voiceName={generatedVoiceName || selectedVoice || 'Kore'}
              useChime={useChime}
              onToggleChime={onToggleChime}
              announcementText={text}
              onOpenSaveModal={onOpenSaveAudioModal}
              isSaved={isAudioSaved}
              language={language}
            />
          </div>
        )}
      </div>
    </div>
  );
};
