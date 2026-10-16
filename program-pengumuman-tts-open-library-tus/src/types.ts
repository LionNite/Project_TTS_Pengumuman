export interface VoiceOption {
  id: string;
  name: string;
  gender: 'Wanita' | 'Pria' | 'Netral';
  toneDesc: string;
  badge?: string;
}

export interface ToneStyle {
  id: string;
  label: string;
  description: string;
  promptStyle: string;
}

export interface PresetAnnouncement {
  id: string;
  title: string;
  category: string;
  text: string;
  recommendedVoice: string;
  recommendedStyle: string;
  isCustom?: boolean;
  createdAt?: number;
}

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
