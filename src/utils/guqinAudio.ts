// Lightweight Web Audio API Synthesizer for Authentic Traditional Guqin (古琴) Ambient Music
// Zero external assets, zero latency, pure pentatonic meditative reading soundtrack

class GuqinSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private intervalTimer: ReturnType<typeof setInterval> | null = null;
  private currentPhraseIndex: number = 0;
  private activeParagraphId: number | null = null;
  private targetVolume: number = 0.15; // Soft, unobtrusive reading ambiance

  // Traditional Chinese Pentatonic Frequencies (D Gong Mode / Zhi Mode)
  // D3, F#3, G3, A3, B3, D4, E4, F#4, A4
  private readonly PENTATONIC_SCALE = [
    146.83, // D3 (宫)
    185.00, // F#3 (角)
    196.00, // G3 (徵)
    220.00, // A3 (羽)
    246.94, // B3 (变宫)
    293.66, // D4 (清角)
    329.63, // E4 (清羽)
    369.99, // F#4 (高音角)
    440.00, // A4 (高音羽)
  ];

  // Serene traditional melodic phrases for dwelling reading
  private readonly MELODIC_PATTERNS = [
    [0, 3, 5],       // D3 -> A3 -> D4 (起势)
    [2, 5, 6],       // G3 -> D4 -> E4 (流水)
    [3, 6, 8],       // A3 -> E4 -> A4 (空谷)
    [1, 4, 5],       // F#3 -> B3 -> D4 (幽兰)
    [0, 2, 5, 7],    // D3 -> G3 -> D4 -> F#4 (琴韵微澜)
    [3, 5, 8],       // A3 -> D4 -> A4 (平沙落雁)
  ];

  constructor() {
    const proto = Object.getPrototypeOf(this);
    if (proto) {
      const propertyNames = Object.getOwnPropertyNames(proto);
      for (const name of propertyNames) {
        if (name !== 'constructor') {
          const val = (this as unknown as Record<string, unknown>)[name];
          if (typeof val === 'function') {
            (this as unknown as Record<string, unknown>)[name] = (val as (...args: unknown[]) => unknown).bind(this);
          }
        }
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        // Master gain for smooth volume crossfade
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Pluck a single Guqin string note with wooden resonance and harmonic overtone
  private pluckString(freq: number, duration: number = 3.6, intensity: number = 1.0) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;

      // 1. Fundamental string oscillator (Triangle wave for rich wooden body)
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // 2. Harmonic overtone (Sine wave at 2x or 3x frequency for shimmering resonance)
      const overtone = ctx.createOscillator();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2, now);

      // Subtle vibrato (微颤琴韵)
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.setValueAtTime(4.8, now); // 4.8 Hz gentle vibrato
      vibratoGain.gain.setValueAtTime(freq * 0.008, now);
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      vibrato.start(now + 0.35); // Vibrato sets in after initial pluck
      vibrato.stop(now + duration);

      // 3. Wooden Resonance Acoustic Filter (桐木共振低通滤波器)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(820, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + duration * 0.85);
      filter.Q.setValueAtTime(3.2, now);

      // 4. Note Envelope Gain (Slow soft attack + long peaceful ring-out)
      const noteGain = ctx.createGain();
      const peakVol = 0.28 * intensity;
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(peakVol, now + 0.04); // 40ms attack
      noteGain.gain.exponentialRampToValueAtTime(peakVol * 0.45, now + 0.7); // Initial decay
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration); // Long tail

      // Connect nodes
      osc.connect(filter);
      overtone.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      // Start & stop
      osc.start(now);
      overtone.start(now);
      osc.stop(now + duration + 0.1);
      overtone.stop(now + duration + 0.1);
    } catch {
      // Safe catch for audio context states
    }
  }

  // Play next melodic step in the traditional ambient loop
  private playNextPatternStep() {
    if (!this.isPlaying || this.isMuted) return;

    const pattern = this.MELODIC_PATTERNS[this.currentPhraseIndex % this.MELODIC_PATTERNS.length];
    this.currentPhraseIndex++;

    pattern.forEach((noteIdx, i) => {
      const freq = this.PENTATONIC_SCALE[noteIdx % this.PENTATONIC_SCALE.length];
      const delay = i * 0.42; // Subtle arpeggiation (散按相融)
      setTimeout(() => {
        if (this.isPlaying && !this.isMuted) {
          this.pluckString(freq, 3.4, i === 0 ? 1.0 : 0.85);
        }
      }, delay * 1000);
    });
  }

  // Start smooth ambient music loop with fade-in
  public fadeIn(paragraphId?: number, durationSec: number = 1.8) {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    if (paragraphId !== undefined) {
      this.activeParagraphId = paragraphId;
      this.currentPhraseIndex = paragraphId % this.MELODIC_PATTERNS.length;
    }

    if (!this.isPlaying) {
      this.isPlaying = true;
      // Start note loop
      this.playNextPatternStep();
      this.intervalTimer = setInterval(() => {
        this.playNextPatternStep();
      }, 3400); // Pluck next phrase every 3.4s
    }

    // Smooth volume fade-in
    try {
      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(Math.max(this.masterGain.gain.value, 0.0001), now);
      this.masterGain.gain.linearRampToValueAtTime(
        this.isMuted ? 0.0001 : this.targetVolume,
        now + durationSec
      );
    } catch {
      // Safe catch
    }
  }

  // Smooth fade-out (when user leaves paragraph or stops)
  public fadeOut(durationSec: number = 1.4) {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + durationSec);

      setTimeout(() => {
        if (this.masterGain && this.masterGain.gain.value <= 0.002) {
          this.stopLoop();
        }
      }, durationSec * 1000 + 50);
    } catch {
      this.stopLoop();
    }
  }

  // Smooth crossfade when switching from paragraph A to paragraph B
  public transitionToParagraph(paragraphId: number) {
    if (this.activeParagraphId === paragraphId && this.isPlaying) return;

    this.activeParagraphId = paragraphId;
    this.currentPhraseIndex = paragraphId % this.MELODIC_PATTERNS.length;

    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    if (!this.isPlaying) {
      this.fadeIn(paragraphId, 1.8);
      return;
    }

    // Seamless volume crossfade & transition chord
    try {
      const now = ctx.currentTime;
      // Dip slightly to 70% volume then rise smoothly to create breathing space
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(this.targetVolume * 0.65, now + 0.4);
      this.masterGain.gain.linearRampToValueAtTime(this.targetVolume, now + 1.2);

      // Play soft transition harmonic (泛音微调)
      setTimeout(() => {
        if (this.isPlaying && !this.isMuted) {
          const rootFreq = this.PENTATONIC_SCALE[(paragraphId * 2) % this.PENTATONIC_SCALE.length];
          this.pluckString(rootFreq, 3.8, 0.75);
        }
      }, 420);
    } catch {
      // Safe catch
    }
  }

  private stopLoop() {
    this.isPlaying = false;
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    this.activeParagraphId = null;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    const ctx = this.getContext();
    if (ctx && this.masterGain) {
      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(muted ? 0.0001 : this.targetVolume, now + 0.3);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public stopImmediately() {
    this.stopLoop();
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      } catch {
        // Safe catch
      }
    }
  }
}

export const guqinAudio = new GuqinSynthesizer();
