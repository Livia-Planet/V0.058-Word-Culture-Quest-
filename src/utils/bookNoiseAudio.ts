/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 柔和翻书背景白噪音音频合成器 (Gentle Book Page-Turning & Ambient Paper Noise Synthesizer)
 * 基于 Web Audio API 纯代码实时程序化合成，无需任何外部音频资源，零延迟、零依赖、支持离线
 */
class BookNoiseAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private periodicRustleTimer: ReturnType<typeof setInterval> | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private targetVolume: number = 0.18; // 柔和舒适的背景音量

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

  /**
   * 生成 5 秒无缝循环的宣纸与书卷柔和白噪音缓冲 (Pink/Brown Filtered Texture)
   */
  private createPaperNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 5; // 5 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter algorithm
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;

      // Subtle slow breathing air modulation (模拟室内微风与纸张静止呼吸感)
      const airModulation = 0.85 + 0.15 * Math.sin((i / bufferSize) * Math.PI * 4);
      data[i] = (pink * 0.07) * airModulation;
    }

    return buffer;
  }

  /**
   * 触发单次逼真纸张翻动/翻书声 (Page Turn Rustle)
   */
  public playPageTurn(intensity: number = 1.0): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.55;

      // 1. Noise buffer for paper texture
      const sampleCount = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < sampleCount; i++) {
        // High-density grain noise for dry paper surface friction
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.28));
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // 2. Dynamic bandpass filter simulating paper sweep resonance
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.8, now);
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.18);
      filter.frequency.exponentialRampToValueAtTime(650, now + duration);

      // 3. Gentle rustle gain envelope
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24 * intensity, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + duration + 0.05);
    } catch {
      // safe fallback
    }
  }

  /**
   * 平滑淡入开启翻书背景白噪音
   */
  public fadeIn(fadeDurationSeconds: number = 1.5): void {
    if (this.isPlaying) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    try {
      this.isPlaying = true;
      const now = ctx.currentTime;

      // 1. Continuous paper texture noise source
      const buffer = this.createPaperNoiseBuffer(ctx);
      this.noiseSource = ctx.createBufferSource();
      this.noiseSource.buffer = buffer;
      this.noiseSource.loop = true;

      // 2. Warm lowpass filter to remove harsh highs, leaving deep soothing parchment rustle
      this.filterNode = ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(1200, now);
      this.filterNode.Q.setValueAtTime(0.7, now);

      this.noiseGain = ctx.createGain();
      this.noiseGain.gain.setValueAtTime(0.001, now);
      this.noiseGain.gain.linearRampToValueAtTime(1.0, now + fadeDurationSeconds);

      this.noiseSource.connect(this.filterNode);
      this.filterNode.connect(this.noiseGain);
      this.noiseGain.connect(this.masterGain);

      this.noiseSource.start(now);

      // Fade master gain
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value || 0.0001, now);
      this.masterGain.gain.linearRampToValueAtTime(this.targetVolume, now + fadeDurationSeconds);

      // 3. Play an initial page-turn welcoming sound
      setTimeout(() => {
        if (this.isPlaying) {
          this.playPageTurn(0.85);
        }
      }, 400);

      // 4. Setup periodic subtle page rustling (every 8 to 14 seconds)
      if (this.periodicRustleTimer) {
        clearInterval(this.periodicRustleTimer);
      }
      this.periodicRustleTimer = setInterval(() => {
        if (this.isPlaying && !this.isMuted) {
          this.playPageTurn(0.65 + Math.random() * 0.35);
        }
      }, 9500);
    } catch {
      // safe fallback
    }
  }

  /**
   * 平滑淡出并关闭翻书背景白噪音
   */
  public fadeOut(fadeDurationSeconds: number = 1.0): void {
    if (!this.isPlaying) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) {
      this.stopImmediately();
      return;
    }

    try {
      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + fadeDurationSeconds);

      setTimeout(() => {
        this.stopImmediately();
      }, fadeDurationSeconds * 1000 + 100);
    } catch {
      this.stopImmediately();
    }
  }

  /**
   * 立即停止并清理所有节点
   */
  public stopImmediately(): void {
    this.isPlaying = false;
    if (this.periodicRustleTimer) {
      clearInterval(this.periodicRustleTimer);
      this.periodicRustleTimer = null;
    }
    if (this.noiseSource) {
      try {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
      } catch {}
      this.noiseSource = null;
    }
    if (this.noiseGain) {
      try {
        this.noiseGain.disconnect();
      } catch {}
      this.noiseGain = null;
    }
    if (this.filterNode) {
      try {
        this.filterNode.disconnect();
      } catch {}
      this.filterNode = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && this.isPlaying) {
      this.fadeOut(0.3);
    }
  }

  public setVolume(volume: number): void {
    this.targetVolume = Math.min(1.0, Math.max(0.0, volume));
    if (this.masterGain && this.ctx && this.isPlaying) {
      this.masterGain.gain.setValueAtTime(this.targetVolume, this.ctx.currentTime);
    }
  }
}

export const bookNoiseAudio = new BookNoiseAudioSynthesizer();
