import React, { useState } from 'react';
import { X, PlusCircle, Check, BookOpen, Volume2, SlidersHorizontal } from 'lucide-react';
import { VOICE_OPTIONS, TONE_STYLES } from '../constants';
import { PresetAnnouncement } from '../types';

interface AddScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddScenario: (scenario: PresetAnnouncement) => void;
  initialText?: string;
  initialVoice?: string;
  initialTone?: string;
}

export const AddScenarioModal: React.FC<AddScenarioModalProps> = ({
  isOpen,
  onClose,
  onAddScenario,
  initialText = '',
  initialVoice = 'Kore',
  initialTone = 'professional',
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tata Tertib');
  const [text, setText] = useState(initialText);
  const [voice, setVoice] = useState(initialVoice);
  const [style, setStyle] = useState(initialTone);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;

    const newScenario: PresetAnnouncement = {
      id: `custom-scenario-${Date.now()}`,
      title: title.trim(),
      category: category.trim() || 'Custom',
      text: text.trim(),
      recommendedVoice: voice,
      recommendedStyle: style,
      isCustom: true,
      createdAt: Date.now(),
    };

    onAddScenario(newScenario);
    onClose();
  };

  const categories = [
    'Penutupan Layanan',
    'Tata Tertib',
    'Sirkulasi & Peminjaman',
    'Informasi Pengunjung',
    'Event & Kegiatan',
    'Darurat & Fasilitas',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-indigo-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header in Solid Red #B11116 */}
        <div className="bg-[#B11116] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FFC800] text-[#B11116] rounded-xl font-bold">
              <PlusCircle className="w-5 h-5 text-[#B11116]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Add Custom Announcement Scenario</h3>
              <p className="text-xs text-white/80">
                Create new reusable scenario preset with voice actor & style pairings
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Scenario Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Semester Exam Quiet Hours"
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Type or pick category..."
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                    category === cat
                      ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Announcement Script Text
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type full announcement text..."
              required
              className="w-full p-4 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed resize-y"
            />
            <span className="text-[11px] text-slate-400 text-right block mt-1">
              {text.trim().split(/\s+/).filter(Boolean).length} words • {text.length} characters
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                Recommended Voice Actor
              </label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {VOICE_OPTIONS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.gender}) - {v.toneDesc.slice(0, 30)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                Recommended Voice Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TONE_STYLES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !text.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#B11116] hover:bg-[#8F0D11] transition-all shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-[#FFC800]" />
              Save Scenario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
