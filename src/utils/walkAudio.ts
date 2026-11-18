// Synthesized nature sound effects (Footsteps on grass/stone, discovery chimes, breeze)
class WalkAudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private ambiencePlaying: boolean = false;
  private windGain: GainNode | null = null;
  private windSource: AudioBufferSourceNode | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Soft grass footstep
  playFootstep() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;

      const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320 + Math.random() * 100, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch {
      // AudioContext blocked until gesture
    }
  }

  // Discovery chime when approaching or opening a landmark
  playDiscoveryChime(freq = 587.33) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.5);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch {
      // Ignore audio errors
    }
  }

  // Continuous breeze ambience (reuses single source node without leaking)
  startAmbience() {
    if (this.isMuted || this.ambiencePlaying) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      if (this.windGain && this.windSource) {
        this.windGain.gain.setTargetAtTime(0.015, this.ctx.currentTime, 0.1);
        this.ambiencePlaying = true;
        return;
      }

      const bufferSize = this.ctx.sampleRate * 3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      this.windSource = noise;
      this.windGain = gain;
      this.ambiencePlaying = true;
    } catch {
      // Ignore autoplay restriction errors
    }
  }

  stopAmbience() {
    if (this.windGain && this.ctx) {
      try {
        this.windGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      } catch {
        // Ignore
      }
      this.ambiencePlaying = false;
    }
  }
}

export const walkAudio = new WalkAudioEngine();
