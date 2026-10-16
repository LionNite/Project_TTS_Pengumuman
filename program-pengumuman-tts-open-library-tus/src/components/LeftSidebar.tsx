import React from 'react';
import {
  Mic,
  BookOpen,
  ChevronLeft,
  Volume2,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeNav: string;
  onSelectNav: (id: string) => void;
  onOpenScenarioLibrary: () => void;
  onOpenSettings: () => void;
  isGeminiConnected: boolean | null;
  isCheckingGemini: boolean;
  onRecheckGemini: () => void;
  language?: Language;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  activeNav,
  onSelectNav,
  onOpenScenarioLibrary,
  onOpenSettings,
  isGeminiConnected,
  isCheckingGemini,
  onRecheckGemini,
  language = 'id',
}) => {
  const t = translations[language];

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-stone-200 shadow-xs transition-all duration-300 ease-in-out shrink-0 select-none z-30 ${
        isCollapsed
          ? 'w-0 -translate-x-full overflow-hidden opacity-0 pointer-events-none'
          : 'w-64 translate-x-0 opacity-100'
      }`}
    >
      {/* Top Header / Branding: VoiceAnnounce */}
      <div className="h-20 px-5 flex items-center justify-between border-b border-stone-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#B11116] text-[#FFC800] flex items-center justify-center font-bold text-lg shadow-xs shrink-0 border border-[#8F0D11]">
            <Volume2 className="w-5 h-5 text-[#FFC800]" />
          </div>
          <div className="truncate">
            <h1 className="font-bold text-stone-900 text-base tracking-tight flex items-center gap-1.5 truncate">
              {t.appName}
            </h1>
            <p className="text-[11px] font-semibold text-[#B11116] truncate">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Collapse Toggle Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-xl text-stone-400 hover:text-[#B11116] hover:bg-red-50 transition-colors cursor-pointer"
          title={t.collapseSidebar}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation Menu */}
      <div className="flex-1 py-6 px-3.5 space-y-2 overflow-y-auto">
        <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-stone-400">
          {t.mainMenu}
        </div>

        {/* 1. TTS Studio */}
        <button
          type="button"
          onClick={() => onSelectNav('studio')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer group ${
            activeNav === 'studio'
              ? 'bg-[#B11116] text-white shadow-xs font-bold'
              : 'text-stone-700 hover:bg-red-50/60 hover:text-[#B11116]'
          }`}
        >
          <div className="flex items-center gap-3">
            <Mic
              className={`w-4 h-4 transition-colors ${
                activeNav === 'studio' ? 'text-[#FFC800]' : 'text-stone-400 group-hover:text-[#B11116]'
              }`}
            />
            <div className="text-left">
              <span className="block font-bold">{t.ttsStudio}</span>
              <span
                className={`block text-[10px] ${
                  activeNav === 'studio' ? 'text-white/80' : 'text-stone-400'
                }`}
              >
                {t.ttsStudioDesc}
              </span>
            </div>
          </div>
        </button>

        {/* 2. Scenario Library */}
        <button
          type="button"
          onClick={onOpenScenarioLibrary}
          className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:text-stone-900 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-[#FFC800] group-hover:text-[#E6B400] transition-colors" />
            <div className="text-left">
              <span className="block font-bold">{t.scenarioLibrary}</span>
              <span className="block text-[10px] text-stone-400">
                {t.scenarioLibraryDesc}
              </span>
            </div>
          </div>
        </button>

        {/* 3. Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-stone-500 group-hover:text-[#B11116] transition-colors" />
            <div className="text-left">
              <span className="block font-bold">{t.settings}</span>
              <span className="block text-[10px] text-stone-400">
                {t.settingsDesc}
              </span>
            </div>
          </div>
        </button>

        {/* Section: Gemini API Connection Status Indicator */}
        <div className="pt-6 px-1">
          <div className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center justify-between">
            <span>{t.aiConnection}</span>
            <button
              type="button"
              onClick={onRecheckGemini}
              disabled={isCheckingGemini}
              className="p-1 rounded-md text-stone-400 hover:text-[#B11116] hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
              title={t.recheckConnection}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isCheckingGemini ? 'animate-spin text-[#B11116]' : ''}`}
              />
            </button>
          </div>

          <div
            className={`p-3 rounded-2xl border transition-all ${
              isGeminiConnected === true
                ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
                : isGeminiConnected === false
                ? 'bg-rose-50/70 border-rose-200/80 text-rose-900'
                : 'bg-stone-50 border-stone-200 text-stone-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {isGeminiConnected === true ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                ) : isGeminiConnected === false ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                  </span>
                ) : (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                  </span>
                )}
                <span className="text-xs font-bold">
                  {isCheckingGemini
                    ? t.geminiChecking
                    : isGeminiConnected === true
                    ? t.geminiConnected
                    : isGeminiConnected === false
                    ? t.geminiDisconnected
                    : t.geminiDetecting}
                </span>
              </div>

              {isGeminiConnected === true ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-rose-500" />
              )}
            </div>

            <p className="text-[10px] leading-tight opacity-80 mt-1">
              {isGeminiConnected === true
                ? t.geminiReadyDesc
                : isGeminiConnected === false
                ? t.geminiNotReadyDesc
                : t.geminiChecking}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Profile / Open Library Surabaya Branding */}
      <div className="p-4 border-t border-stone-100 bg-stone-50/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#B11116] text-[#FFC800] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ring-2 ring-white">
              OP
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-stone-800 truncate">
                {t.institution}
              </div>
              <div className="text-[10px] text-stone-500 font-medium truncate">
                {t.institutionSub}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
