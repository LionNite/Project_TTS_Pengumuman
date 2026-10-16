import React from 'react';
import { SlidersHorizontal, Heart, Shield, Feather, Sparkles } from 'lucide-react';
import { TONE_STYLES } from '../constants';
import { ToneStyle } from '../types';

interface ToneSelectorProps {
  selectedToneId: string;
  onSelectTone: (toneId: string) => void;
  disabled?: boolean;
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  selectedToneId,
  onSelectTone,
  disabled = false,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'sopan_lembut':
        return <Feather className="w-4 h-4 text-[#B11116]" />;
      case 'hangat_ramah':
        return <Heart className="w-4 h-4 text-rose-500 fill-current" />;
      case 'resmi_anggun':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'bisikan_tenang':
        return <Sparkles className="w-4 h-4 text-[#FFC800] fill-current" />;
      default:
        return <SlidersHorizontal className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-stone-800 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#B11116]" />
          Gaya & Intonasi Tutur (Tone of Voice)
        </label>
        <span className="text-xs text-stone-500 font-medium">
          Mengarahkan emosi vokal model AI
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {TONE_STYLES.map((tone: ToneStyle) => {
          const isSelected = selectedToneId === tone.id;
          return (
            <button
              key={tone.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectTone(tone.id)}
              className={`text-left p-3.5 rounded-xl border transition-all ${
                isSelected
                  ? 'border-[#B11116] bg-[#B11116]/5 ring-2 ring-[#B11116]/30 shadow-xs'
                  : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/60'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1 rounded-md bg-stone-100">
                  {getIcon(tone.id)}
                </div>
                <span className="text-xs font-bold text-stone-900">
                  {tone.label}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 leading-normal line-clamp-2">
                {tone.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
