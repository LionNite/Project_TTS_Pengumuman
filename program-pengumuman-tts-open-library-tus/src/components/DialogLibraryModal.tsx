import React, { useState } from 'react';
import {
  X,
  FileText,
  Search,
  Trash2,
  Check,
  ArrowRight,
  Clock,
  Volume2,
  FolderOpen,
} from 'lucide-react';
import { SavedDialog } from '../types';

interface DialogLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dialogs: SavedDialog[];
  onSelectDialog: (dialog: SavedDialog) => void;
  onDeleteDialog: (id: string) => void;
  onOpenSaveCurrent: () => void;
}

export const DialogLibraryModal: React.FC<DialogLibraryModalProps> = ({
  isOpen,
  onClose,
  dialogs,
  onSelectDialog,
  onDeleteDialog,
  onOpenSaveCurrent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(dialogs.map((d) => d.category)))];

  const filtered = dialogs.filter((dialog) => {
    const matchesSearch =
      dialog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dialog.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dialog.notes && dialog.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || dialog.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-indigo-100 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header in Solid Red #B11116 */}
        <div className="bg-[#B11116] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FFC800] text-[#B11116] rounded-xl font-bold">
              <FolderOpen className="w-5 h-5 text-[#B11116]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Announcement Dialog Library</h3>
              <p className="text-xs text-white/80">
                Browse and select saved scripts to load directly into the workspace
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

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search scripts by title or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSaveCurrent();
              }}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>+ Save Current Script</span>
            </button>
          </div>

          {/* Category tabs */}
          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1 rounded-full whitespace-nowrap border transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#B11116] text-white border-[#B11116] font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List of dialogs */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No matching scripts found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Save announcements from your workspace to build your script library.
              </p>
            </div>
          ) : (
            filtered.map((dialog) => (
              <div
                key={dialog.id}
                className="bg-white border border-slate-200 hover:border-red-200 rounded-2xl p-4 transition-all shadow-xs hover:shadow-sm flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#B11116] transition-colors">
                        {dialog.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-red-50 text-[#B11116]">
                          {dialog.category}
                        </span>
                        {dialog.voice && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Volume2 className="w-3 h-3 text-[#B11116]" />
                            {dialog.voice}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(dialog.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteDialog(dialog.id)}
                      className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete dialog"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{dialog.text}"
                  </p>

                  {dialog.notes && (
                    <p className="text-[11px] text-stone-600 mt-1.5 italic">
                      Notes: {dialog.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1">
                  <span className="text-[11px] text-slate-400">
                    {dialog.text.split(/\s+/).filter(Boolean).length} words
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDialog(dialog);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#B11116] hover:bg-[#8F0D11] transition-all shadow-xs"
                  >
                    <span>Use This Script</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FFC800]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
