// Sound and Speech Synthesis System using Web Audio API and Web Speech API

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Auto-bind all methods on prototype to this instance so callbacks can never lose 'this'
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
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Explicit audio context unlock to satisfy mobile browser autoplay policies
  public unlockAudio(): void {
    if (typeof window === 'undefined') return;
    try {
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch {}
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch {}
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Soft woodblock tap
  public playTap() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // AudioContext safe catch
    }
  }

  // Tactile book spine hover tick & haptic feedback (抚摸书脊清脆微响与触觉微震)
  public playSpineHover() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (ctx) {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const now = ctx.currentTime;
        // Crisp gentle wooden click (high-pitched, quick decay 45ms)
        osc.frequency.setValueAtTime(560, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.04);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } catch {
        // Safe catch
      }
    }

    // Trigger subtle physical device haptic vibration on mobile/touch screens
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // Safe catch
      }
    }
  }

  // Cheerful correct chime
  public playCorrect() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.32);
      });
    } catch {
      // AudioContext safe catch
    }
  }

  // Gentle wrong note
  public playWrong() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch {
      // AudioContext safe catch
    }
  }

  // Assemble block snap sound
  public playSnap() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // AudioContext safe catch
    }
  }

  // Tactile bubble pop / book pickup sound (拿起典籍清爽轻弹音)
  public playPop() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // AudioContext safe catch
    }
  }

  // Festive Chinese gong/fanfare
  public playVictory() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const melody = [
        { f: 523.25, t: 0, d: 0.2 },
        { f: 659.25, t: 0.15, d: 0.2 },
        { f: 783.99, t: 0.3, d: 0.25 },
        { f: 880.0, t: 0.48, d: 0.2 },
        { f: 1046.5, t: 0.65, d: 0.6 },
      ];
      melody.forEach(({ f, t, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + t);

        gain.gain.setValueAtTime(0.3, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + d + 0.05);
      });
    } catch {
      // AudioContext safe catch
    }
  }

  // Firecracker pop pop pop
  public playFirecracker() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      for (let i = 0; i < 6; i++) {
        const delay = i * 0.07 + Math.random() * 0.03;
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
          data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.015));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        noise.connect(gain);
        gain.connect(ctx.destination);
        noise.start(ctx.currentTime + delay);
      }
    } catch {
      // AudioContext safe catch
    }
  }

  // 1. Crisp Jade/Chime Hanzi Character Click (点击汉字清脆玉石泛音)
  public playCharClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Dual resonance: crystal chime + warm wooden transient
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();

      // High bell fundamental (pentatonic high E6 1318.5Hz)
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1318.5, now);
      osc1.frequency.exponentialRampToValueAtTime(1174.6, now + 0.12);

      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      // Warm wooden marimba body (E5 659.25Hz)
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now);
      osc2.frequency.exponentialRampToValueAtTime(329.6, now + 0.08);

      gain2.gain.setValueAtTime(0.25, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.15);
      osc2.start(now);
      osc2.stop(now + 0.1);
    } catch {
      // Safe catch
    }
  }

  // 2. Filling a cloze/blank slot (填空归位 · 玉扣金盘)
  public playFillSlot() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Harmonious ascending drop: G5 -> C6
      const freqs = [783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.05;

        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, start + 0.06);

        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch {
      // Safe catch
    }
  }

  // 3. Completing all blanks / Cloze exercise success (填空全部完成 · 华彩通关)
  public playFillSuccess() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Pentatonic flourish: C5 -> E5 -> G5 -> A5 -> C6
      const arpeggio = [523.25, 659.25, 783.99, 880.0, 1046.5];
      arpeggio.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const t = now + idx * 0.07;

        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.38);
      });

      // Shimmer sparkle overlay
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmer.type = 'triangle';
      shimmer.frequency.setValueAtTime(2093.0, now + 0.35); // C7
      shimmerGain.gain.setValueAtTime(0.12, now + 0.35);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      shimmer.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);
      shimmer.start(now + 0.35);
      shimmer.stop(now + 0.75);
    } catch {
      // Safe catch
    }
  }

  // 4. Unlocking Badges & Milestones (解锁勋章 · 金榜鸣钟与仙乐)
  public playBadgeUnlock() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;

      // Deep resonant bronze bell / gong fundamental (大吕黄钟)
      const gongOsc = ctx.createOscillator();
      const gongGain = ctx.createGain();
      gongOsc.type = 'sine';
      gongOsc.frequency.setValueAtTime(261.63, now); // C4
      gongOsc.frequency.exponentialRampToValueAtTime(255.0, now + 0.8);

      gongGain.gain.setValueAtTime(0.35, now);
      gongGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      gongOsc.connect(gongGain);
      gongGain.connect(ctx.destination);
      gongOsc.start(now);
      gongOsc.stop(now + 1.25);

      // Majestic imperial fanfare chimes
      const fanfare = [
        { f: 523.25, t: 0.08, d: 0.3 },  // C5
        { f: 659.25, t: 0.20, d: 0.3 },  // E5
        { f: 783.99, t: 0.32, d: 0.35 }, // G5
        { f: 1046.5, t: 0.46, d: 0.6 },  // C6
        { f: 1318.5, t: 0.62, d: 0.8 },  // E6
      ];

      fanfare.forEach(({ f, t, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = now + t;

        osc.frequency.setValueAtTime(f, start);
        gain.gain.setValueAtTime(0.28, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + d + 0.05);
      });
    } catch {
      // Safe catch
    }
  }

  // 5. Cinnabar Seal Stamp (朱砂私印加盖 · 金石落纸之声)
  public playSealStamp() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Heavy stone / wooden stamp thud
      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.type = 'triangle';
      thud.frequency.setValueAtTime(160, now);
      thud.frequency.exponentialRampToValueAtTime(45, now + 0.12);

      thudGain.gain.setValueAtTime(0.4, now);
      thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      thud.connect(thudGain);
      thudGain.connect(ctx.destination);
      thud.start(now);
      thud.stop(now + 0.16);

      // High crisp parchment contact click
      const click = ctx.createOscillator();
      const clickGain = ctx.createGain();
      click.type = 'sine';
      click.frequency.setValueAtTime(950, now);
      click.frequency.exponentialRampToValueAtTime(220, now + 0.04);

      clickGain.gain.setValueAtTime(0.2, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      click.connect(clickGain);
      clickGain.connect(ctx.destination);
      click.start(now);
      click.stop(now + 0.06);
    } catch {
      // Safe catch
    }
  }

  // 6. Equipping cosmetic decoration (佩戴装扮 · 锦绣微光)
  public playEquip() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [659.25, 880.0, 1174.6]; // E5, A5, D6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + i * 0.05;

        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch {
      // Safe catch
    }
  }

  // 7. Streak Increment & Check-in (连续学习天数燃点 · 晨诵流光)
  public playStreak() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const streakChord = [392.0, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
      streakChord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const t = now + idx * 0.06;

        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.26, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.35);
      });
    } catch {
      // Safe catch
    }
  }

  // 8. Imperial Court Bell & Chime (皇朝宣旨编钟奏鸣 · 庄重肃穆)
  public playImperialBell() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const bellPitches = [293.66, 440.0, 587.33, 739.99];
      bellPitches.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.12;

        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 1.9);
      });
    } catch {
      // Safe catch
    }
  }

  // 9. Low-Frequency Haptic Vibration & Stroke Tremor Sound (笔迹偏差低频震颤与触觉模拟音)
  public playStrokeErrorShake() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Dual low-frequency oscillators with slight detune (58Hz and 64Hz) to create acoustic physical beat/rumble
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      // Deep rumble pitch drop
      osc1.frequency.setValueAtTime(62, now);
      osc1.frequency.exponentialRampToValueAtTime(42, now + 0.38);

      osc2.frequency.setValueAtTime(69, now);
      osc2.frequency.exponentialRampToValueAtTime(38, now + 0.38);

      gain.gain.setValueAtTime(0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.42);
      osc2.stop(now + 0.42);

      // Trigger native device vibration if supported on mobile
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([45, 30, 75]);
        } catch {
          // safe
        }
      }
    } catch {
      // safe catch
    }
  }

  // 10. Golden Coin Drop & Reward Shimmer (金币掉落与祥瑞散金清脆声)
  public playReward() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const coinTones = [1174.66, 1318.51, 1567.98, 1760.0, 2093.0];
      coinTones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const t = now + idx * 0.05;

        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.28);
      });
    } catch {
      // safe
    }
  }

  // Crisp Single Gold Coin Ring (文昌金币叮当清脆入袋声)
  public playCoin() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1975.53, now); // B6
      osc.frequency.setValueAtTime(2637.02, now + 0.04); // E7
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // safe
    }
  }
}

export const sound = new SoundSystem();

// Global reference set to protect utterances from WebKit / iOS Safari aggressive garbage collection
const activeUtterancesSet = new Set<SpeechSynthesisUtterance>();
let iosSpeechKeeperTimer: ReturnType<typeof setInterval> | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    cachedVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      try {
        cachedVoices = window.speechSynthesis.getVoices();
      } catch {}
    };
  } catch {}
}

function startIosSpeechKeeper(): void {
  if (iosSpeechKeeperTimer || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  // iOS Safari will pause long speech after ~14-15 seconds. Toggling pause/resume keeps engine alive.
  iosSpeechKeeperTimer = setInterval(() => {
    try {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    } catch {}
  }, 9000);
}

function stopIosSpeechKeeper(): void {
  if (iosSpeechKeeperTimer) {
    clearInterval(iosSpeechKeeperTimer);
    iosSpeechKeeperTimer = null;
  }
}

// Speech Synthesis
export function stopChineseSpeech(): void {
  stopIosSpeechKeeper();
  activeUtterancesSet.clear();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // safe
    }
  }
}

export function pauseChineseSpeech(): void {
  stopIosSpeechKeeper();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.pause();
    } catch {
      // safe
    }
  }
}

export function resumeChineseSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.resume();
      startIosSpeechKeeper();
    } catch {
      // safe
    }
  }
}

export interface SpeakTrackHandlers {
  onBoundary?: (charIndex: number, charLength?: number) => void;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onEnd?: () => void;
  onError?: (err?: any) => void;
}

function pickChineseVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;
  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === 'zh-CN') ||
    voices.find((v) => v.lang.startsWith('zh') || v.lang.includes('cmn'))
  );
}

export function speakChineseTracked(
  text: string,
  rate: number = 0.9,
  handlers: SpeakTrackHandlers = {}
): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    handlers.onEnd?.();
    return () => {};
  }

  try {
    stopChineseSpeech();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtterancesSet.add(utterance);
    utterance.lang = 'zh-CN';
    utterance.rate = rate;
    utterance.pitch = 1.05;

    const zhVoice = pickChineseVoice();
    if (zhVoice) {
      utterance.voice = zhVoice;
    }

    utterance.onstart = () => {
      startIosSpeechKeeper();
      handlers.onStart?.();
    };
    utterance.onpause = () => {
      stopIosSpeechKeeper();
      handlers.onPause?.();
    };
    utterance.onresume = () => {
      startIosSpeechKeeper();
      handlers.onResume?.();
    };
    utterance.onend = () => {
      activeUtterancesSet.delete(utterance);
      if (activeUtterancesSet.size === 0) stopIosSpeechKeeper();
      handlers.onEnd?.();
    };
    utterance.onerror = (e) => {
      activeUtterancesSet.delete(utterance);
      if (activeUtterancesSet.size === 0) stopIosSpeechKeeper();
      handlers.onError?.(e);
    };

    utterance.onboundary = (event) => {
      handlers.onBoundary?.(event.charIndex, event.charLength);
    };

    window.speechSynthesis.speak(utterance);
    startIosSpeechKeeper();

    return () => {
      stopChineseSpeech();
    };
  } catch {
    activeUtterancesSet.clear();
    stopIosSpeechKeeper();
    handlers.onEnd?.();
    return () => {};
  }
}

export function speakChinese(text: string, rate: number = 0.9): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    try {
      stopChineseSpeech();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      activeUtterancesSet.add(utterance);
      utterance.lang = 'zh-CN';
      utterance.rate = rate;
      utterance.pitch = 1.05;

      const zhVoice = pickChineseVoice();
      if (zhVoice) {
        utterance.voice = zhVoice;
      }

      utterance.onstart = () => {
        startIosSpeechKeeper();
      };
      utterance.onend = () => {
        activeUtterancesSet.delete(utterance);
        if (activeUtterancesSet.size === 0) stopIosSpeechKeeper();
        resolve();
      };
      utterance.onerror = () => {
        activeUtterancesSet.delete(utterance);
        if (activeUtterancesSet.size === 0) stopIosSpeechKeeper();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
      startIosSpeechKeeper();
    } catch {
      activeUtterancesSet.clear();
      stopIosSpeechKeeper();
      resolve();
    }
  });
}

// 自动监听移动端/桌面端的首次点击或触摸交互，主动激活并唤醒 AudioContext，消除浏览器 Autoplay Policy 拦截
if (typeof window !== 'undefined') {
  const handleFirstInteraction = () => {
    sound.unlockAudio();
    window.removeEventListener('click', handleFirstInteraction);
    window.removeEventListener('touchstart', handleFirstInteraction);
    window.removeEventListener('keydown', handleFirstInteraction);
  };
  window.addEventListener('click', handleFirstInteraction, { passive: true, once: true });
  window.addEventListener('touchstart', handleFirstInteraction, { passive: true, once: true });
  window.addEventListener('keydown', handleFirstInteraction, { passive: true, once: true });

  // 针对 iOS Safari 锁屏或切后台再返回前台时的音频与朗读状态唤醒与恢复
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      try {
        if ('speechSynthesis' in window && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        sound.unlockAudio();
      } catch {}
    }
  });

  window.addEventListener('pageshow', () => {
    try {
      if ('speechSynthesis' in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      sound.unlockAudio();
    } catch {}
  });
}

