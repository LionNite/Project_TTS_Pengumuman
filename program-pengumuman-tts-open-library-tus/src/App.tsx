import React, { useState, useEffect, useCallback } from 'react';
import { LeftSidebar } from './components/LeftSidebar';
import { CenterWorkspace } from './components/CenterWorkspace';
import { RightSidebar } from './components/RightSidebar';
import { SaveAnnouncementModal } from './components/SaveAnnouncementModal';
import { SaveDialogModal } from './components/SaveDialogModal';
import { ScenarioLibraryModal } from './components/ScenarioLibraryModal';
import { SettingsModal } from './components/SettingsModal';
import {
  INITIAL_ANNOUNCEMENT,
  TONE_STYLES,
  PRESET_ANNOUNCEMENTS,
} from './constants';
import { PresetAnnouncement, SavedAnnouncement, SavedDialog } from './types';
import { base64ToBlobUrl } from './utils/audio';
import {
  getSavedAnnouncements,
  saveAnnouncement,
  deleteSavedAnnouncement,
  updateAnnouncementTitle,
  getSavedDialogs,
  saveDialog,
  getCustomScenarios,
  saveCustomScenario,
  deleteCustomScenario,
  getStoredCategories,
  saveStoredCategories,
  resetStoredCategories,
  getStoredLanguage,
  saveStoredLanguage,
} from './utils/storage';
import { Language, translations } from './utils/translations';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Language state (id / en)
  const [language, setLanguage] = useState<Language>(getStoredLanguage());
  const t = translations[language];

  // TTS & Workspace state
  const [text, setText] = useState<string>(INITIAL_ANNOUNCEMENT);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [selectedToneId, setSelectedToneId] = useState<string>('sopan_lembut');
  const [useChime, setUseChime] = useState<boolean>(true);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('library-closing-5min');

  // Generated Audio state
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [currentAudioBase64, setCurrentAudioBase64] = useState<string | null>(null);
  const [currentMimeType, setCurrentMimeType] = useState<string>('audio/wav');
  const [generatedVoiceInfo, setGeneratedVoiceInfo] = useState<string>('Kore');

  // Loading & Processing state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Gemini API Connection status for left sidebar
  const [isGeminiConnected, setIsGeminiConnected] = useState<boolean | null>(null);
  const [isCheckingGemini, setIsCheckingGemini] = useState<boolean>(false);

  // Dynamic Announcement Categories (Managed via Settings)
  const [categories, setCategories] = useState<string[]>(getStoredCategories());

  // Layout states: Collapsible Left Sidebar & Fullscreen
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<string>('studio');

  // Saved Data (Persistent Storage)
  const [savedAnnouncements, setSavedAnnouncements] = useState<SavedAnnouncement[]>([]);
  const [savedDialogs, setSavedDialogs] = useState<SavedDialog[]>([]);
  const [customScenarios, setCustomScenarios] = useState<PresetAnnouncement[]>([]);
  const [activePlayingAudioId, setActivePlayingAudioId] = useState<string | null>(null);

  // Modals state
  const [isSaveAnnouncementModalOpen, setIsSaveAnnouncementModalOpen] = useState<boolean>(false);
  const [isSaveDialogModalOpen, setIsSaveDialogModalOpen] = useState<boolean>(false);
  const [isScenarioLibraryOpen, setIsScenarioLibraryOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Check Gemini API Connectivity
  const checkGeminiStatus = useCallback(async () => {
    setIsCheckingGemini(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setIsGeminiConnected(Boolean(data.hasKey));
      } else {
        setIsGeminiConnected(false);
      }
    } catch (err) {
      console.warn('Error checking Gemini API status:', err);
      setIsGeminiConnected(false);
    } finally {
      setIsCheckingGemini(false);
    }
  }, []);

  // Check Gemini connection on mount
  useEffect(() => {
    checkGeminiStatus();
  }, [checkGeminiStatus]);

  // Load persistent storage data on initial mount
  useEffect(() => {
    async function loadData() {
      try {
        const [announcements, dialogs, scenarios] = await Promise.all([
          getSavedAnnouncements(),
          getSavedDialogs(),
          getCustomScenarios(),
        ]);
        setSavedAnnouncements(announcements);
        setSavedDialogs(dialogs);
        setCustomScenarios(scenarios);
        setCategories(getStoredCategories());
        setLanguage(getStoredLanguage());
      } catch (err) {
        console.warn('Error loading storage data:', err);
      }
    }
    loadData();
  }, []);

  // Fullscreen listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.warn);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(console.error);
      }
    }
  };

  // Generate TTS Audio via Gemini API
  const handleGenerateAudio = useCallback(async () => {
    if (!text.trim()) {
      setError(t.emptyTextError);
      return;
    }

    const voiceToUse = selectedVoice || 'Kore';
    const activeTone = TONE_STYLES.find((tg) => tg.id === selectedToneId);
    const stylePrompt = activeTone
      ? activeTone.promptStyle
      : 'Sopan, sangat lembut, tenang, ramah, dan santun untuk pengumuman perpustakaan';

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voice: voiceToUse,
          style: stylePrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.audioBase64) {
        throw new Error(data.error || 'Failed to generate audio from TTS model.');
      }

      // Convert base64 to Blob URL
      const blobUrl = base64ToBlobUrl(data.audioBase64, data.mimeType || 'audio/wav');
      setAudioBlobUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return blobUrl;
      });
      setCurrentAudioBase64(data.audioBase64);
      setCurrentMimeType(data.mimeType || 'audio/wav');
      setGeneratedVoiceInfo(voiceToUse);

      // Verify connection success
      setIsGeminiConnected(true);
      showNotification(`${t.audioGeneratedSuccess} ${voiceToUse}!`);
    } catch (err: any) {
      console.error('TTS Generation error:', err);
      setError(err.message || 'Error occurred during voice synthesis.');
    } finally {
      setIsLoading(false);
    }
  }, [text, selectedVoice, selectedToneId, t]);

  // Initial audio generation on first mount
  useEffect(() => {
    handleGenerateAudio();
  }, []);

  // Reset function
  const handleReset = () => {
    setText('');
    setSelectedVoice('');
    setSelectedToneId('');
    setSelectedPresetId(null);
    setAudioBlobUrl(null);
    setCurrentAudioBase64(null);
    showNotification(t.resetNotification);
  };

  // Refine text with Gemini
  const handleRefineWithAI = async () => {
    if (!text.trim()) return;
    setIsRefining(true);
    setError(null);

    const activeTone = TONE_STYLES.find((tg) => tg.id === selectedToneId);
    const toneDesc = activeTone?.label || 'sopan dan lembut';

    try {
      const res = await fetch('/api/refine-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          tone: toneDesc,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.refinedText) {
        throw new Error(data.error || 'Failed to refine text.');
      }
      setText(data.refinedText);
      setSelectedPresetId(null);
      setIsGeminiConnected(true);
      showNotification(t.refineSuccess);
    } catch (err: any) {
      console.error('Refine error:', err);
      setError(err.message || 'Failed to refine text with AI.');
    } finally {
      setIsRefining(false);
    }
  };

  // Combined scenarios (presets + custom)
  const allScenarios: PresetAnnouncement[] = [
    ...PRESET_ANNOUNCEMENTS,
    ...customScenarios,
  ];

  const handleSelectScenario = (scenario: PresetAnnouncement) => {
    setText(scenario.text);
    setSelectedPresetId(scenario.id);
    if (scenario.recommendedVoice) {
      setSelectedVoice(scenario.recommendedVoice);
    }
    if (scenario.recommendedStyle) {
      setSelectedToneId(scenario.recommendedStyle);
    }
    showNotification(`"${scenario.title}" - ${t.loadedTemplateSuccess}`);
  };

  // Save Announcement to Right Sidebar Collection
  const handleSaveAnnouncement = async (title: string, category: string) => {
    if (!currentAudioBase64) {
      setError(t.noAudioYet);
      return;
    }

    const activeTone = TONE_STYLES.find((tg) => tg.id === selectedToneId);
    const toneLabel = activeTone ? activeTone.label : 'Standard';

    const newAnnouncement: SavedAnnouncement = {
      id: `announcement-${Date.now()}`,
      title,
      text: text.trim(),
      voice: generatedVoiceInfo || selectedVoice || 'Kore',
      style: toneLabel,
      audioBase64: currentAudioBase64,
      mimeType: currentMimeType,
      createdAt: Date.now(),
      category,
    };

    try {
      await saveAnnouncement(newAnnouncement);
      const updated = await getSavedAnnouncements();
      setSavedAnnouncements(updated);
      showNotification(`"${title}" ${t.savedToAudioSuccess}`);
    } catch (e: any) {
      setError('Failed to save announcement.');
    }
  };

  // Delete saved announcement
  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteSavedAnnouncement(id);
      const updated = await getSavedAnnouncements();
      setSavedAnnouncements(updated);
      showNotification(t.deletedAudioSuccess);
    } catch (e) {
      console.error(e);
    }
  };

  // Update announcement title
  const handleUpdateAnnouncementTitle = async (id: string, newTitle: string) => {
    try {
      await updateAnnouncementTitle(id, newTitle);
      const updated = await getSavedAnnouncements();
      setSavedAnnouncements(updated);
    } catch (e) {
      console.error(e);
    }
  };

  // Load saved item back into workspace
  const handleLoadToWorkspace = (item: SavedAnnouncement) => {
    setText(item.text);
    setSelectedVoice(item.voice);
    const matchedTone = TONE_STYLES.find((tg) => tg.label === item.style);
    if (matchedTone) {
      setSelectedToneId(matchedTone.id);
    }
    const blobUrl = base64ToBlobUrl(item.audioBase64, item.mimeType || 'audio/wav');
    setAudioBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return blobUrl;
    });
    setCurrentAudioBase64(item.audioBase64);
    setCurrentMimeType(item.mimeType || 'audio/wav');
    setGeneratedVoiceInfo(item.voice);
    setSelectedPresetId(null);
    showNotification(`"${item.title}" ${t.loadIntoWorkspace}`);
  };

  // Save Dialog Script
  const handleSaveDialog = async (title: string, category: string, notes: string) => {
    const newDialog: SavedDialog = {
      id: `dialog-${Date.now()}`,
      title,
      text: text.trim(),
      category,
      voice: selectedVoice,
      style: selectedToneId,
      createdAt: Date.now(),
      notes,
    };

    try {
      await saveDialog(newDialog);
      const updated = await getSavedDialogs();
      setSavedDialogs(updated);
      showNotification(`"${title}" ${t.saveScript}!`);
    } catch (e) {
      setError('Failed to save dialog script.');
    }
  };

  // Add custom scenario directly from Scenario Library modal
  const handleAddCustomScenario = async (scenario: PresetAnnouncement) => {
    try {
      await saveCustomScenario(scenario);
      const updated = await getCustomScenarios();
      setCustomScenarios(updated);
      handleSelectScenario(scenario);
      showNotification(`"${scenario.title}" ${t.loadedTemplateSuccess}`);
    } catch (e) {
      setError('Failed to add custom scenario.');
    }
  };

  // Delete custom scenario from Scenario Library modal
  const handleDeleteCustomScenario = async (id: string) => {
    try {
      await deleteCustomScenario(id);
      const updated = await getCustomScenarios();
      setCustomScenarios(updated);
      showNotification(language === 'id' ? 'Skenario kustom berhasil dihapus.' : 'Custom scenario deleted.');
    } catch (e) {
      console.error(e);
    }
  };

  // Category Management Handlers (Settings)
  const handleAddCategory = (newCat: string) => {
    const updated = [...categories, newCat];
    setCategories(updated);
    saveStoredCategories(updated);
    showNotification(`"${newCat}" ${t.categoryAddedSuccess}`);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    const updated = categories.filter((c) => c !== catToDelete);
    setCategories(updated);
    saveStoredCategories(updated);
    showNotification(`"${catToDelete}" ${t.categoryDeletedSuccess}`);
  };

  const handleResetCategories = () => {
    const defaults = resetStoredCategories();
    setCategories(defaults);
    showNotification(t.categoryResetSuccess);
  };

  // Language Change Handler
  const handleChangeLanguage = (newLang: Language) => {
    setLanguage(newLang);
    saveStoredLanguage(newLang);
    showNotification(
      newLang === 'id'
        ? 'Bahasa tampilan diubah ke Bahasa Indonesia.'
        : 'Interface language updated to English.'
    );
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const isCurrentAudioSaved = savedAnnouncements.some(
    (a) => a.audioBase64 === currentAudioBase64
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-800 font-sans selection:bg-red-200">
      {/* 1. LEFT SIDEBAR */}
      <LeftSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(true)}
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        onOpenScenarioLibrary={() => setIsScenarioLibraryOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isGeminiConnected={isGeminiConnected}
        isCheckingGemini={isCheckingGemini}
        onRecheckGemini={checkGeminiStatus}
        language={language}
      />

      {/* 2. CENTER WORKSPACE */}
      <CenterWorkspace
        text={text}
        onChangeText={(val) => {
          setText(val);
          setSelectedPresetId(null);
        }}
        selectedVoice={selectedVoice}
        onChangeVoice={setSelectedVoice}
        selectedToneId={selectedToneId}
        onChangeTone={setSelectedToneId}
        onGenerateAudio={handleGenerateAudio}
        onReset={handleReset}
        isLoading={isLoading}
        isRefining={isRefining}
        onRefineWithAI={handleRefineWithAI}
        allScenarios={allScenarios}
        onSelectScenario={handleSelectScenario}
        selectedScenarioId={selectedPresetId}
        onOpenSaveDialog={() => setIsSaveDialogModalOpen(true)}
        onOpenScenarioLibrary={() => setIsScenarioLibraryOpen(true)}
        audioBlobUrl={audioBlobUrl}
        useChime={useChime}
        onToggleChime={setUseChime}
        onOpenSaveAudioModal={() => setIsSaveAnnouncementModalOpen(true)}
        isAudioSaved={isCurrentAudioSaved}
        generatedVoiceName={generatedVoiceInfo}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(false)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        language={language}
      />

      {/* 3. RIGHT SIDEBAR: Named "Audio tersimpan" with inline delete */}
      <RightSidebar
        savedAnnouncements={savedAnnouncements}
        onLoadToWorkspace={handleLoadToWorkspace}
        onDeleteAnnouncement={handleDeleteAnnouncement}
        onUpdateTitle={handleUpdateAnnouncementTitle}
        activePlayingId={activePlayingAudioId}
        onSetActivePlayingId={setActivePlayingAudioId}
        language={language}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-white border border-stone-200 shadow-xl text-stone-800 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">{notification}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-stone-400 hover:text-stone-600 text-xs ml-2 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Error Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-xl text-rose-800 flex items-center gap-3 animate-fadeIn max-w-md">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs font-medium flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-800 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* MODAL 1: Save Audio Announcement */}
      <SaveAnnouncementModal
        isOpen={isSaveAnnouncementModalOpen}
        onClose={() => setIsSaveAnnouncementModalOpen(false)}
        onSave={handleSaveAnnouncement}
        defaultTitle={`${language === 'id' ? 'Pengumuman' : 'Announcement'} (${new Date().toLocaleDateString(
          language === 'id' ? 'id-ID' : 'en-US',
          { day: 'numeric', month: 'short' }
        )})`}
        voiceName={generatedVoiceInfo || selectedVoice || 'Kore'}
        toneLabel={
          TONE_STYLES.find((tg) => tg.id === selectedToneId)?.label || 'Sopan & Lembut'
        }
        textSnippet={text}
      />

      {/* MODAL 2: Save Dialog Script */}
      <SaveDialogModal
        isOpen={isSaveDialogModalOpen}
        onClose={() => setIsSaveDialogModalOpen(false)}
        onSave={handleSaveDialog}
        currentText={text}
      />

      {/* MODAL 3: Scenario Library Modal */}
      <ScenarioLibraryModal
        isOpen={isScenarioLibraryOpen}
        onClose={() => setIsScenarioLibraryOpen(false)}
        scenarios={allScenarios}
        onSelectScenario={handleSelectScenario}
        onAddCustomScenario={handleAddCustomScenario}
        onDeleteCustomScenario={handleDeleteCustomScenario}
        categories={categories}
        language={language}
      />

      {/* MODAL 4: Settings Modal with Language selection and Category Management */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onResetCategories={handleResetCategories}
        language={language}
        onChangeLanguage={handleChangeLanguage}
      />
    </div>
  );
}
