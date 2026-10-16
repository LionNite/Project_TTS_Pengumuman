import React, { useState } from 'react';
import { X, FileText, Check } from 'lucide-react';

interface SaveDialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, category: string, notes: string) => void;
  currentText: string;
}

export const SaveDialogModal: React.FC<SaveDialogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentText,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tata Tertib');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), category.trim() || 'General', notes.trim());
    onClose();
  };

  const defaultCategories = [
    'Tata Tertib',
    'Penutupan Layanan',
    'Sirkulasi & Pengembalian',
    'Pengumuman Khusus',
    'Kunjungan & Event',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-indigo-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Header in Solid Red #B11116 */}
        <div className="bg-[#B11116] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FFC800] text-[#B11116] rounded-xl font-bold">
              <FileText className="w-5 h-5 text-[#B11116]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Save Announcement Script</h3>
              <p className="text-xs text-white/80">
                Store script templates to re-use anytime in the center workspace
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Script Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Quiet Reading Area Reminder"
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B11116]/20 focus:border-[#B11116]"
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
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B11116]/20 focus:border-[#B11116] mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {defaultCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                    category === cat
                      ? 'bg-[#B11116] text-white font-bold border-[#B11116]'
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
              Notes / Broadcast Time (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Broadcast every Friday at 11:30"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B11116]/20 focus:border-[#B11116]"
            />
          </div>

          {/* Current Text Preview */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-700 block mb-1">Script Content:</span>
            <p className="line-clamp-3 text-slate-600 italic text-[11px] bg-white p-2.5 rounded-xl border border-slate-200">
              {currentText || '(No text entered)'}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !currentText.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#B11116] hover:bg-[#8F0D11] transition-all shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-[#FFC800]" />
              Save Script
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
