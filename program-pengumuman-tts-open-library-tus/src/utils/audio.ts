/**
 * Audio utility functions for VoiceAnnounce
 * Handles Web Audio API chime synthesis, offline chime rendering & merging with TTS WAV,
 * and audio formatting.
 */

/**
 * Helper to play a soft, gentle library chime (ding-dong chime)
 * in real-time using the Web Audio API.
 */
export async function playLibraryChime(audioCtx: AudioContext): Promise<void> {
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }

  return new Promise((resolve) => {
    const now = audioCtx.currentTime;

    // First note: E5 (659.25 Hz) - soft bell
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
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
    osc2.type = "sine";
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
 * Render library chime offline into an AudioBuffer using OfflineAudioContext.
 */
export async function renderChimeBuffer(
  sampleRate = 24000,
  numberOfChannels = 1
): Promise<AudioBuffer> {
  const duration = 1.4; // 1.4 seconds for chime to ring and naturally decay
  const totalSamples = Math.ceil(duration * sampleRate);

  const offlineCtx = new OfflineAudioContext(
    numberOfChannels,
    totalSamples,
    sampleRate
  );

  const now = 0;

  // First note: E5 (659.25 Hz)
  const osc1 = offlineCtx.createOscillator();
  const gain1 = offlineCtx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(659.25, now);
  gain1.gain.setValueAtTime(0, now);
  gain1.gain.linearRampToValueAtTime(0.22, now + 0.04);
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

  osc1.connect(gain1);
  gain1.connect(offlineCtx.destination);
  osc1.start(now);
  osc1.stop(now + 0.9);

  // Second note: G5 (783.99 Hz)
  const note2Start = 0.32;
  const osc2 = offlineCtx.createOscillator();
  const gain2 = offlineCtx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(783.99, note2Start);
  gain2.gain.setValueAtTime(0, note2Start);
  gain2.gain.linearRampToValueAtTime(0.2, note2Start + 0.04);
  gain2.gain.exponentialRampToValueAtTime(0.0001, note2Start + 1.1);

  osc2.connect(gain2);
  gain2.connect(offlineCtx.destination);
  osc2.start(note2Start);
  osc2.stop(note2Start + 1.2);

  return await offlineCtx.startRendering();
}

/**
 * Helper to write ASCII strings to DataView
 */
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Encode an AudioBuffer into 16-bit PCM WAV bytes
 */
export function audioBufferToWav(buffer: AudioBuffer): Uint8Array {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const numSamples = buffer.length;
  const dataSize = numSamples * blockAlign;
  const bufferLength = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // RIFF chunk descriptor
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");

  // fmt sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      let sample = buffer.getChannelData(channel)[i];
      // Clamp between -1 and 1
      sample = Math.max(-1, Math.min(1, sample));
      // Scale to 16-bit signed integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Uint8Array(arrayBuffer);
}

/**
 * Convert Uint8Array to base64 string
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Merge library opening chime sound directly into the synthesized TTS audio.
 * Produces a unified Audio WAV containing [chime] + [0.35s pause] + [speech].
 */
export async function mergeChimeWithSpeech(
  speechBase64: string
): Promise<{ audioBase64: string; blobUrl: string }> {
  try {
    const binaryString = atob(speechBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioContextClass();

    const speechBuffer = await audioCtx.decodeAudioData(bytes.buffer.slice(0));
    const sampleRate = speechBuffer.sampleRate;
    const numberOfChannels = speechBuffer.numberOfChannels;

    // Render chime buffer at exact matching sample rate & channel count
    const chimeBuffer = await renderChimeBuffer(sampleRate, numberOfChannels);

    // 0.35s gap of silence between chime and speech
    const pauseSamples = Math.floor(sampleRate * 0.35);

    const totalSamples = chimeBuffer.length + pauseSamples + speechBuffer.length;
    const mergedBuffer = audioCtx.createBuffer(
      numberOfChannels,
      totalSamples,
      sampleRate
    );

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const mergedData = mergedBuffer.getChannelData(channel);
      const chimeData = chimeBuffer.getChannelData(
        Math.min(channel, chimeBuffer.numberOfChannels - 1)
      );
      const speechData = speechBuffer.getChannelData(channel);

      // Copy chime
      mergedData.set(chimeData, 0);
      // Silence is naturally 0
      // Copy speech after chime + pause
      mergedData.set(speechData, chimeBuffer.length + pauseSamples);
    }

    const wavBytes = audioBufferToWav(mergedBuffer);
    const mergedBase64 = uint8ArrayToBase64(wavBytes);
    const blob = new Blob([wavBytes.buffer as ArrayBuffer], { type: "audio/wav" });
    const blobUrl = URL.createObjectURL(blob);

    if (audioCtx.state !== "closed") {
      audioCtx.close().catch(() => {});
    }

    return { audioBase64: mergedBase64, blobUrl };
  } catch (err) {
    console.error("Failed to merge chime with speech, falling back to original:", err);
    return {
      audioBase64: speechBase64,
      blobUrl: base64ToBlobUrl(speechBase64, "audio/wav"),
    };
  }
}

/**
 * Convert base64 audio to Blob URL
 */
export function base64ToBlobUrl(base64Data: string, mimeType = "audio/wav"): string {
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
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
