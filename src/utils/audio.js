// Centralized Audio Manager for Lumina Forest
// Using different royalty-free sources to bypass hotlinking restrictions if possible
const SFX_URLS = {
  correct: 'https://www.soundjay.com/misc/sounds/magic-chime-01.mp3',
  wrong: 'https://www.soundjay.com/buttons/sounds/button-10.mp3',
  click: 'https://www.soundjay.com/buttons/sounds/button-3.mp3',
  success: 'https://www.soundjay.com/misc/sounds/bell-ringing-01.mp3'
};

const MUSIC_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3'; // Instrumental upbeat

class AudioManager {
  constructor() {
    this.music = null;
    this.muted = true;
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

  async playMusic() {
    if (this.muted) return;
    if (!this.music) this.init();
    try {
      await this.music.play();
    } catch (e) {
      // Background play might be blocked until user interacts
    }
  }

  playSFX(type) {
    if (this.muted || !SFX_URLS[type]) return;
    try {
      const sfx = new Audio(SFX_URLS[type]);
      sfx.volume = 0.4;
      sfx.play().catch(() => {});
    } catch (e) {}
  }
}

export const audioManager = new AudioManager();
