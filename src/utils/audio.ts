/**
 * Audio helper utilities for Real-Time Gemini Live API and Web Audio processing.
 */

// Convert Float32Array from microphone (16kHz) to 16-bit Linear PCM Base64
export function pcmFloat32ToBase64(float32Array: Float32Array): string {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(int16Array.buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 16-bit PCM (from Gemini Live or TTS at 24000Hz) to AudioBuffer
export function pcmBase64ToAudioBuffer(
  audioCtx: AudioContext,
  base64: string,
  sampleRate: number = 24000
): AudioBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff);
  }

  const audioBuffer = audioCtx.createBuffer(1, float32.length, sampleRate);
  audioBuffer.getChannelData(0).set(float32);
  return audioBuffer;
}

// Playback queue manager for seamless gapless streaming audio chunks
export class GaplessAudioQueue {
  private audioCtx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private isPlaying: boolean = false;
  private currentSources: AudioBufferSourceNode[] = [];
  private onStateChange?: (playing: boolean) => void;

  constructor(onStateChange?: (playing: boolean) => void) {
    this.onStateChange = onStateChange;
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass({ sampleRate: 24000 });
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public enqueueChunk(base64Pcm: string, sampleRate: number = 24000) {
    try {
      const ctx = this.getAudioContext();
      const buffer = pcmBase64ToAudioBuffer(ctx, base64Pcm, sampleRate);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      if (this.nextStartTime < now) {
        this.nextStartTime = now + 0.05; // tiny buffer to avoid clicks
      }

      source.start(this.nextStartTime);
      this.nextStartTime += buffer.duration;
      this.currentSources.push(source);

      if (!this.isPlaying) {
        this.isPlaying = true;
        this.onStateChange?.(true);
      }

      source.onended = () => {
        const idx = this.currentSources.indexOf(source);
        if (idx !== -1) {
          this.currentSources.splice(idx, 1);
        }
        if (this.currentSources.length === 0 && ctx.currentTime >= this.nextStartTime - 0.05) {
          this.isPlaying = false;
          this.onStateChange?.(false);
        }
      };
    } catch (err) {
      console.error('Failed to enqueue audio chunk:', err);
    }
  }

  public stop() {
    this.currentSources.forEach((src) => {
      try {
        src.stop();
      } catch (e) {}
    });
    this.currentSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
    this.isPlaying = false;
    this.onStateChange?.(false);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

// Single-shot PCM audio player for TTS playback across components
let sharedAudioContext: AudioContext | null = null;
let activeAudioSource: AudioBufferSourceNode | null = null;

export function stopCurrentAudioPlayback(): void {
  if (activeAudioSource) {
    try {
      activeAudioSource.stop();
    } catch (e) {}
    activeAudioSource = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

export async function playPcmAudioBase64(
  base64Pcm: string,
  sampleRate: number = 24000,
  playbackRate: number = 1.0,
  onEnd?: () => void
): Promise<void> {
  stopCurrentAudioPlayback();

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new AudioContextClass({ sampleRate });
  }
  if (sharedAudioContext.state === 'suspended') {
    await sharedAudioContext.resume();
  }

  const audioBuffer = pcmBase64ToAudioBuffer(sharedAudioContext, base64Pcm, sampleRate);
  const source = sharedAudioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.playbackRate.value = playbackRate;
  source.connect(sharedAudioContext.destination);

  activeAudioSource = source;
  source.onended = () => {
    if (activeAudioSource === source) {
      activeAudioSource = null;
    }
    onEnd?.();
  };

  source.start();
}
