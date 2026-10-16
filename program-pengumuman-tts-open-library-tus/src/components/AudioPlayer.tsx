import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Bell,
  Loader2,
  Bookmark,
  BookmarkCheck,
  Radio,
} from 'lucide-react';
import { formatTime, playLibraryChime } from '../utils/audio';
import { Language, translations } from '../utils/translations';

interface AudioPlayerProps {
  audioBlobUrl: string | null;
  isLoading: boolean;
  onGenerate: () => void;
  voiceName: string;
  useChime: boolean;
  onToggleChime: (val: boolean) => void;
  announcementText: string;
  onOpenSaveModal: () => void;
  isSaved: boolean;
  language?: Language;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioBlobUrl,
  isLoading,
  onGenerate,
  voiceName,
  useChime,
  onToggleChime,
  announcementText,
  onOpenSaveModal,
  isSaved,
  language = 'id',
}) => {
  const t = translations[language];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlayingChime, setIsPlayingChime] = useState<boolean>(false);

  // Initialize AudioContext on user interaction
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    return audioCtxRef.current;
  };

  useEffect(() => {
    // Reset player state when audio blob changes
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [audioBlobUrl]);

  const handleTogglePlay = async () => {
    if (!audioBlobUrl) {
      onGenerate();
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // If at start and chime is enabled, play chime first
      if (currentTime === 0 && useChime) {
        setIsPlayingChime(true);
        const ctx = getAudioContext();
        await playLibraryChime(ctx);
        setIsPlayingChime(false);
      }

      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Playback error:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleRestart = async () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);

    if (useChime) {
      setIsPlayingChime(true);
      const ctx = getAudioContext();
      await playLibraryChime(ctx);
      setIsPlayingChime(false);
    }

    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(console.error);
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

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const testChimeSound = async () => {
    const ctx = getAudioContext();
    setIsPlayingChime(true);
    await playLibraryChime(ctx);
    setIsPlayingChime(false);
  };

  const downloadWav = () => {
    if (!audioBlobUrl) return;
    const a = document.createElement('a');
    a.href = audioBlobUrl;
    a.download = `announcement-${(voiceName || 'voice').toLowerCase()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-4">
      {audioBlobUrl && (
        <audio
          ref={audioRef}
          src={audioBlobUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      )}

      {/* Main Header / Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#B11116] flex items-center justify-center font-bold">
            <Radio className="w-5 h-5 text-[#B11116]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-800">
                {t.playerTitle}
              </h3>
              {voiceName && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-[#B11116] border border-red-100">
                  {t.voiceLabel} {voiceName}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400">
              {t.playerSubtitle}
            </p>
          </div>
        </div>

        {/* Chime toggle & preview */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-50 px-3 py-1.5 rounded-2xl border border-stone-200/80">
          <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useChime}
              onChange={(e) => onToggleChime(e.target.checked)}
              className="rounded text-[#B11116] focus:ring-[#B11116] h-4 w-4"
            />
            <Bell className="w-3.5 h-3.5 text-[#B11116]" />
            <span>{t.openingChime}</span>
          </label>
          <button
            type="button"
            onClick={testChimeSound}
            disabled={isPlayingChime}
            className="text-[11px] px-2 py-0.5 bg-white border border-stone-200 rounded-lg text-stone-600 hover:text-[#B11116] hover:border-red-200 transition-colors disabled:opacity-50 font-medium cursor-pointer"
            title="Dengarkan lonceng pembuka"
          >
            {isPlayingChime ? t.chiming : t.testChime}
          </button>
        </div>
      </div>

      {/* Waveform / Visualizer Simulation in Solid Dark Console */}
      <div className="bg-[#18181B] text-white rounded-2xl p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between min-h-[135px] border border-stone-800 shadow-md">
        {/* Top bar inside player */}
        <div className="flex items-center justify-between text-xs text-stone-400 z-10">
          <span className="flex items-center gap-1.5 font-mono">
            {isPlayingChime ? (
              <span className="text-[#FFC800] font-semibold animate-pulse flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 animate-bounce" /> {t.playingChime}
              </span>
            ) : isPlaying ? (
              <span className="text-white font-bold flex items-center gap-1.5 bg-[#B11116] px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#FFC800] animate-ping inline-block" />
                {t.onAir}
              </span>
            ) : audioBlobUrl ? (
              <span className="text-emerald-400 font-medium">{t.readyForBroadcast}</span>
            ) : (
              <span>{t.clickGeneratePrompt}</span>
            )}
          </span>
          <span className="font-mono text-stone-300 font-semibold bg-black/40 px-2.5 py-0.5 rounded-lg border border-white/10">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Frequency bars visualizer with Solid Yellow #FFC800 bars */}
        <div className="flex items-end justify-center gap-1 sm:gap-1.5 h-14 my-2 z-10 px-2">
          {Array.from({ length: 36 }).map((_, i) => {
            const progress = duration > 0 ? currentTime / duration : 0;
            const barIndexProgress = i / 36;
            const isPassed = barIndexProgress <= progress;

            const baseHeights = [
              20, 35, 48, 30, 65, 80, 42, 88, 98, 68, 52, 82, 100, 72, 58, 92, 86,
              62, 48, 78, 90, 65, 94, 60, 50, 74, 88, 52, 42, 68, 58, 40, 48, 32,
              24, 18,
            ];
            const baseH = baseHeights[i % baseHeights.length];

            return (
              <div
                key={i}
                style={{
                  height: isPlaying
                    ? `${Math.max(12, baseH * (0.6 + Math.sin(i * 0.7 + Date.now() * 0.003) * 0.4))}%`
                    : `${Math.max(10, baseH * 0.35)}%`,
                  transition: 'height 0.15s ease',
                }}
                className={`w-1 sm:w-1.5 rounded-full transition-colors ${
                  isPassed
                    ? 'bg-[#FFC800] shadow-[0_0_8px_rgba(255,200,0,0.6)]'
                    : isPlaying
                    ? 'bg-stone-500'
                    : 'bg-stone-800'
                }`}
              />
            );
          })}
        </div>

        {/* Scrubber */}
        <div className="z-10 pt-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            disabled={!audioBlobUrl || isLoading}
            className="w-full accent-[#FFC800] h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
        </div>
      </div>

      {/* Main Playback Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-start">
          {/* Main Play Button in Solid Red #B11116 */}
          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={isLoading || isPlayingChime}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-white transition-all shadow-md active:scale-98 cursor-pointer ${
              audioBlobUrl
                ? 'bg-[#B11116] hover:bg-[#8F0D11]'
                : 'bg-stone-400 cursor-not-allowed'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#FFC800]" />
                <span>{t.synthesizing}</span>
              </>
            ) : isPlayingChime ? (
              <>
                <Bell className="w-4 h-4 animate-bounce text-[#FFC800]" />
                <span>{t.chiming}</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current text-[#FFC800]" />
                <span>{t.pause}</span>
              </>
            ) : audioBlobUrl ? (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5 text-[#FFC800]" />
                <span>{t.playAudio}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>{t.noAudioYet}</span>
              </>
            )}
          </button>

          {/* Save / Saved button as requested: "Save" before pressed, "Saved" when saved */}
          {audioBlobUrl && (
            <button
              type="button"
              onClick={onOpenSaveModal}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all border shadow-xs cursor-pointer ${
                isSaved
                  ? 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  : 'bg-[#FFC800] hover:bg-[#E6B400] text-stone-900 border-[#E6B400]'
              }`}
              title="Save audio to collection"
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-[#B11116] fill-current" />
                  <span>Save</span>
                </>
              )}
            </button>
          )}

          {/* Restart */}
          {audioBlobUrl && (
            <button
              type="button"
              onClick={handleRestart}
              className="p-2.5 rounded-2xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
              title={t.restartAudio}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Download button */}
          {audioBlobUrl && (
            <button
              type="button"
              onClick={downloadWav}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs transition-colors cursor-pointer"
              title={t.downloadWav}
            >
              <Download className="w-4 h-4 text-[#B11116]" />
              <span>{t.downloadWav}</span>
            </button>
          )}
        </div>

        {/* Speed & Volume Tools */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
          {/* Playback speed buttons */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {[0.85, 1.0, 1.25].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleSpeedChange(rate)}
                className={`px-2 py-0.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  playbackRate === rate
                    ? 'bg-white text-[#B11116] shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              className="text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 accent-[#B11116] h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
