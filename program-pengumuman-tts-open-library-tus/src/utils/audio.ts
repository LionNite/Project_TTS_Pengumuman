/**
 * Helper to play a soft, gentle library chime (ding-dong chime)
 * using the Web Audio API without needing external audio files.
 */
export async function playLibraryChime(audioCtx: AudioContext): Promise<void> {
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  return new Promise((resolve) => {
    const now = audioCtx.currentTime;

    // First note: E5 (659.25 Hz) - soft bell
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.9);

    // Second note: G5 (783.99 Hz) - gentle chime resolve
    const note2Start = now + 0.32;
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, note2Start);
    gain2.gain.setValueAtTime(0, note2Start);
    gain2.gain.linearRampToValueAtTime(0.16, note2Start + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.0001, note2Start + 1.1);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(note2Start);
    osc2.stop(note2Start + 1.2);

    setTimeout(() => {
      resolve();
    }, 1150);
  });
}

/**
 * Convert base64 audio to Blob URL
 */
export function base64ToBlobUrl(base64Data: string, mimeType = 'audio/wav'): string {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Format seconds into mm:ss
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
