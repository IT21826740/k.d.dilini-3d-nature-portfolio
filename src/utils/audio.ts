// Web Audio API synthesized celestial sounds (Zero external audio file dependency)

class CelestialAudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play gentle celestial harp chime (Genshin menu / UI sound)
  playChime(pitch: number = 440, type: OscillatorType = 'sine', duration: number = 0.6) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, now + duration * 0.4);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio playback fails gracefully if browser restricts autoplay
    }
  }

  // Play golden 5-star wish fanfare chords
  playWishFanfare() {
    if (this.isMuted) return;
    const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C major celestial triad
    chords.forEach((freq, idx) => {
      setTimeout(() => {
        this.playChime(freq, 'triangle', 0.8 + idx * 0.15);
      }, idx * 120);
    });
  }

  // Play elemental switch note
  playElementalTone(element: string) {
    if (this.isMuted) return;
    const toneMap: Record<string, number> = {
      all: 587.33,   // D5
      geo: 440.00,   // A4
      anemo: 659.25, // E5
      electro: 783.99,// G5
      dendro: 523.25, // C5
      hydro: 698.46, // F5
      pyro: 880.00,  // A5
    };
    const freq = toneMap[element] || 440;
    this.playChime(freq, 'sine', 0.45);
  }
}

export const soundEngine = new CelestialAudioEngine();
