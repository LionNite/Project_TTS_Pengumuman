import { PresetAnnouncement } from '../types';

export interface SavedAnnouncement {
  id: string;
  title: string;
  text: string;
  voice: string;
  style: string;
  audioBase64: string;
  mimeType: string;
  createdAt: number;
  duration?: number;
  category?: string;
}

export interface SavedDialog {
  id: string;
  title: string;
  text: string;
  category: string;
  voice?: string;
  style?: string;
  createdAt: number;
  notes?: string;
}

const DB_NAME = 'PerpustakaanTTS_DB';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains('saved_announcements')) {
        db.createObjectStore('saved_announcements', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('saved_dialogs')) {
        db.createObjectStore('saved_dialogs', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('custom_scenarios')) {
        db.createObjectStore('custom_scenarios', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback localStorage keys
const LS_ANNOUNCEMENTS_KEY = 'library_saved_announcements_v1';
const LS_DIALOGS_KEY = 'library_saved_dialogs_v1';
const LS_SCENARIOS_KEY = 'library_custom_scenarios_v1';

/* -------------------------------------------------------------
   SAVED ANNOUNCEMENTS (Audio + Text + Metadata)
-------------------------------------------------------------- */

export async function getSavedAnnouncements(): Promise<SavedAnnouncement[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('saved_announcements', 'readonly');
      const store = tx.objectStore('saved_announcements');
      const request = store.getAll();
      request.onsuccess = () => {
        const results = (request.result || []) as SavedAnnouncement[];
        results.sort((a, b) => b.createdAt - a.createdAt);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    const raw = localStorage.getItem(LS_ANNOUNCEMENTS_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as SavedAnnouncement[];
      return parsed.sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return [];
    }
  }
}

export async function saveAnnouncement(announcement: SavedAnnouncement): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('saved_announcements', 'readwrite');
      const store = tx.objectStore('saved_announcements');
      const request = store.put(announcement);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const current = await getSavedAnnouncements();
    const updated = [announcement, ...current.filter((a) => a.id !== announcement.id)];
    try {
      localStorage.setItem(LS_ANNOUNCEMENTS_KEY, JSON.stringify(updated.slice(0, 10)));
    } catch (e) {
      console.warn('LocalStorage limit reached for announcements fallback', e);
    }
  }
}

export async function deleteSavedAnnouncement(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('saved_announcements', 'readwrite');
      const store = tx.objectStore('saved_announcements');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const current = await getSavedAnnouncements();
    const filtered = current.filter((a) => a.id !== id);
    localStorage.setItem(LS_ANNOUNCEMENTS_KEY, JSON.stringify(filtered));
  }
}

export async function updateAnnouncementTitle(id: string, newTitle: string): Promise<void> {
  const all = await getSavedAnnouncements();
  const target = all.find((a) => a.id === id);
  if (!target) return;
  target.title = newTitle;
  await saveAnnouncement(target);
}

/* -------------------------------------------------------------
   SAVED DIALOGS (Scripts / Texts)
-------------------------------------------------------------- */

export async function getSavedDialogs(): Promise<SavedDialog[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('saved_dialogs', 'readonly');
      const store = tx.objectStore('saved_dialogs');
      const request = store.getAll();
      request.onsuccess = () => {
        const results = (request.result || []) as SavedDialog[];
        results.sort((a, b) => b.createdAt - a.createdAt);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    const raw = localStorage.getItem(LS_DIALOGS_KEY);
    if (!raw) return getDefaultDialogs();
    try {
      const parsed = JSON.parse(raw) as SavedDialog[];
      return parsed.sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return getDefaultDialogs();
    }
  }
}

export async function saveDialog(dialog: SavedDialog): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('saved_dialogs', 'readwrite');
      const store = tx.objectStore('saved_dialogs');
      const request = store.put(dialog);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const current = await getSavedDialogs();
    const updated = [dialog, ...current.filter((d) => d.id !== dialog.id)];
    localStorage.setItem(LS_DIALOGS_KEY, JSON.stringify(updated));
  }
}

export async function deleteDialog(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('saved_dialogs', 'readwrite');
      const store = tx.objectStore('saved_dialogs');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const current = await getSavedDialogs();
    const filtered = current.filter((d) => d.id !== id);
    localStorage.setItem(LS_DIALOGS_KEY, JSON.stringify(filtered));
  }
}

function getDefaultDialogs(): SavedDialog[] {
  return [
    {
      id: 'dialog-def-1',
      title: 'Pemberitahuan Waktu Sholat & Istirahat',
      category: 'Ibadah & Istirahat',
      text: 'Perhatian kepada seluruh pengunjung perpustakaan. Telah masuk waktu ibadah salat zuhur. Bagi pengunjung yang ingin menunaikan ibadah, fasilitas musala tersedia di lantai satu dekat tangga barat. Terima kasih.',
      voice: 'Kore',
      style: 'sopan_lembut',
      createdAt: Date.now() - 3600000 * 24,
      notes: 'Disiarkan setiap menjelang adzan',
    },
    {
      id: 'dialog-def-2',
      title: 'Himbauan Pengembalian Buku ke Meja Drop',
      category: 'Tata Tertib',
      text: 'Pengunjung yang kami hormati, setelah selesai membaca buku dan tidak berniat meminjamnya, mohon letakkan buku di meja pengembalian buku (drop box) dan jangan meletakkan kembali ke rak secara mandiri demi ketertiban penataan koleksi. Terima kasih atas pengertian Anda.',
      voice: 'Kore',
      style: 'sopan_lembut',
      createdAt: Date.now() - 3600000 * 12,
      notes: 'Disiarkan siang & sore hari',
    },
  ];
}

/* -------------------------------------------------------------
   CUSTOM SCENARIOS (User-created scenarios)
-------------------------------------------------------------- */

export async function getCustomScenarios(): Promise<PresetAnnouncement[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('custom_scenarios', 'readonly');
      const store = tx.objectStore('custom_scenarios');
      const request = store.getAll();
      request.onsuccess = () => {
        const results = (request.result || []) as PresetAnnouncement[];
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    const raw = localStorage.getItem(LS_SCENARIOS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as PresetAnnouncement[];
    } catch {
      return [];
    }
  }
}

export async function saveCustomScenario(scenario: PresetAnnouncement): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('custom_scenarios', 'readwrite');
      const store = tx.objectStore('custom_scenarios');
      const request = store.put(scenario);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const current = await getCustomScenarios();
    const updated = [scenario, ...current.filter((s) => s.id !== scenario.id)];
    localStorage.setItem(LS_SCENARIOS_KEY, JSON.stringify(updated));
  }
}

export async function deleteCustomScenario(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('custom_scenarios', 'readwrite');
      const store = tx.objectStore('custom_scenarios');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const current = await getCustomScenarios();
    const filtered = current.filter((s) => s.id !== id);
    localStorage.setItem(LS_SCENARIOS_KEY, JSON.stringify(filtered));
  }
}

/* -------------------------------------------------------------
   ANNOUNCEMENT CATEGORIES (Dynamic customizable categories)
-------------------------------------------------------------- */

export const DEFAULT_CATEGORIES: string[] = [
  'Penutupan Layanan',
  'Tata Tertib',
  'Sirkulasi & Peminjaman',
  'Informasi Umum',
  'Event & Kegiatan',
  'Fasilitas & Darurat',
];

const LS_CATEGORIES_KEY = 'library_announcement_categories_v1';

export function getStoredCategories(): string[] {
  try {
    const raw = localStorage.getItem(LS_CATEGORIES_KEY);
    if (!raw) return [...DEFAULT_CATEGORIES];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [...DEFAULT_CATEGORIES];
  } catch {
    return [...DEFAULT_CATEGORIES];
  }
}

export function saveStoredCategories(categories: string[]): void {
  try {
    localStorage.setItem(LS_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (err) {
    console.warn('Error saving categories to localStorage:', err);
  }
}

export function resetStoredCategories(): string[] {
  try {
    localStorage.removeItem(LS_CATEGORIES_KEY);
  } catch (err) {
    console.warn('Error resetting categories in localStorage:', err);
  }
  return [...DEFAULT_CATEGORIES];
}

/* -------------------------------------------------------------
   LANGUAGE PREFERENCE (id / en)
-------------------------------------------------------------- */

const LS_LANGUAGE_KEY = 'library_app_language_v1';

export function getStoredLanguage(): 'id' | 'en' {
  try {
    const raw = localStorage.getItem(LS_LANGUAGE_KEY);
    if (raw === 'en' || raw === 'id') {
      return raw;
    }
    return 'id';
  } catch {
    return 'id';
  }
}

export function saveStoredLanguage(lang: 'id' | 'en'): void {
  try {
    localStorage.setItem(LS_LANGUAGE_KEY, lang);
  } catch (err) {
    console.warn('Error saving language preference:', err);
  }
}


