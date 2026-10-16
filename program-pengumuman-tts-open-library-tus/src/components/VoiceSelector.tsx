import React from 'react';
import { User, Sparkles, CheckCircle2 } from 'lucide-react';
import { VOICE_OPTIONS } from '../constants';
import { VoiceOption } from '../types';

interface VoiceSelectorProps {
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  disabled?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-stone-800 flex items-center gap-2">
          <User className="w-4 h-4 text-[#B11116]" />
          Karakter Suara Penyiar (Voice Profile)
        </label>
        <span className="text-xs text-stone-500 font-medium">
          Model: Gemini 3.8 Flash TTS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {VOICE_OPTIONS.map((voice: VoiceOption) => {
          const isSelected = selectedVoice === voice.id;
          return (
            <button
              key={voice.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectVoice(voice.id)}
              className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-[#B11116] bg-[#B11116]/5 shadow-xs ring-2 ring-[#B11116]/30'
                  : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/60'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? 'bg-[#B11116] text-[#FFC800]'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {voice.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-900 text-sm">
                        {voice.name}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        voice.gender === 'Wanita'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : voice.gender === 'Pria'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      {voice.gender}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-[#B11116] shrink-0" />
                ) : null}
              </div>

              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                {voice.toneDesc}
              </p>

              {voice.badge && (
                <div className="mt-2.5 pt-2 border-t border-[#B11116]/15 flex items-center gap-1 text-[11px] font-bold text-[#B11116]">
                  <Sparkles className="w-3 h-3 text-[#FFC800] fill-current" />
                  <span>{voice.badge}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
