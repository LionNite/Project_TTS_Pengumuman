import React, { useState } from 'react';
import { X, BookmarkPlus, Check, Volume2, Sparkles, Tag } from 'lucide-react';

interface SaveAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, category: string) => void;
  defaultTitle: string;
  defaultCategory?: string;
  voiceName: string;
  toneLabel: string;
  textSnippet: string;
}

export const SaveAnnouncementModal: React.FC<SaveAnnouncementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultTitle,
  defaultCategory = 'Penutupan Layanan',
  voiceName,
  toneLabel,
  textSnippet,
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [category, setCategory] = useState(defaultCategory);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), category.trim() || 'General');
    onClose();
  };

  const quickCategories = [
    'Penutupan Layanan',
    'Tata Tertib',
    'Sirkulasi & Peminjaman',
    'Informasi Pengunjung',
    'Event & Kegiatan',
    'Darurat & Kerapian',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-indigo-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header in Solid Red #B11116 */}
        <div className="bg-[#B11116] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FFC800] text-[#B11116] rounded-xl font-bold">
              <BookmarkPlus className="w-5 h-5 text-[#B11116]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Save Announcement to Collection</h3>
              <p className="text-xs text-white/80">
                Audio and metadata will be preserved in your right sidebar history
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Announcement Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Library Closing Reminder at 17:00"
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
              placeholder="e.g., Penutupan Layanan"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B11116]/20 focus:border-[#B11116] mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {quickCategories.map((cat) => (
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

          {/* Details preview */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center justify-between text-slate-800 font-semibold">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#B11116]" />
                Voice Actor: {voiceName}
              </span>
              <span className="bg-red-50 text-[#B11116] border border-red-100 px-2 py-0.5 rounded-md text-[11px] font-bold">
                {toneLabel}
              </span>
            </div>
            <p className="line-clamp-2 text-slate-500 italic text-[11px] border-t border-slate-200 pt-1.5 mt-1">
              "{textSnippet}"
            </p>
          </div>

          {/* Action buttons */}
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
              disabled={!title.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#B11116] hover:bg-[#8F0D11] transition-all shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-[#FFC800]" />
              Save to Vault
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
