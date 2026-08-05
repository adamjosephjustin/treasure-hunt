// Centralized Audio Manager for Lumina Forest
// SFX always plays. Music is togglable.

const MUSIC_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3';

class AudioManager {
  constructor() {
    this.music = null;
    this.muted = true; // controls background music only
    // Pages that have their own audio (Thurup, with its voice chat)
    // suppress background music entirely while mounted. This is a hard
    // block, separate from `muted`: ProgressContext restores the user's
    // globally-saved mute preference asynchronously on every full page
    // load (it wraps the whole app, Thurup included), which can call
    // setMuted(false) — and therefore playMusic() — well after a Thurup
    // page's own one-time "pause on mount" effect has already run and
    // finished. Without this flag that race would start Lumina Forest's
    // music on top of a Thurup game/voice call on essentially any reload.
    this.suppressed = false;
  }

  init() {
    if (this.music) return;
    this.music = new Audio(MUSIC_URL);
    this.music.loop = true;
    this.music.volume = 0.2;
  }

  setMuted(isMuted) {
    this.muted = isMuted;
    if (!this.music) this.init();

    if (isMuted) {
      this.music.pause();
    } else {
      this.playMusic();
    }
  }

  setSuppressed(isSuppressed) {
    this.suppressed = isSuppressed;
    if (isSuppressed) this.music?.pause();
  }

  async playMusic() {
    if (this.muted || this.suppressed) return;
    if (!this.music) this.init();
    try {
      await this.music.play();
    } catch (e) {
      // Background play might be blocked until user interacts
    }
  }

  // SFX plays regardless of music mute state
  playSFX(type) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = 0.15;

      if (type === 'correct') {
        // Ascending happy chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, ctx.currentTime);       // C5
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'wrong') {
        // Descending buzzy sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'click') {
        // Short click tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
      } else if (type === 'success') {
        // Triumphant fanfare
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.12);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.24);
        osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.36);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.7);
      }
    } catch (e) {}
  }
}

export const audioManager = new AudioManager();
