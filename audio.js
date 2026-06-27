
class GameAudioController {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.masterVolume = null;
    }
    init() {
        if (this.ctx) return; // Already initialized
        // Create Web Audio Context (needs user interaction, e.g. clicking Start or a button)
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.masterVolume = this.ctx.createGain();
        this.masterVolume.gain.setValueAtTime(0.5, this.ctx.currentTime);
        this.masterVolume.connect(this.ctx.destination);
    }
    setMuted(muted) {
        this.muted = muted;
        if (!this.ctx) return;
        
        const targetVolume = this.muted ? 0 : 0.5;
        this.masterVolume.gain.setValueAtTime(targetVolume, this.ctx.currentTime);
    }
    toggleMute() {
        this.init();
        this.setMuted(!this.muted);
        return this.muted;
    }
    playNoise(duration, lowpassFreq, startVolume, endVolume = 0.001) {
        if (!this.ctx || this.muted) return;
        // Buffer size
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        // Fill buffer with white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;
        // Filter
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(lowpassFreq, this.ctx.currentTime);
        // Volume Envelope
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(startVolume, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(endVolume, this.ctx.currentTime + duration);
        // Connect
        noiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterVolume);
        noiseNode.start();
        noiseNode.stop(this.ctx.currentTime + duration);
    }
    playShot(weaponType) {
        this.init();
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        switch (weaponType) {
            case 'SCAR':
                // Rapid mid-pitch fire
                this.playNoise(0.12, 1000, 0.4);
                // Pitch transient click
                this.playTone(400, 150, 0.04, 'triangle', 0.15);
                break;
            case 'M1014':
                // Shotgun: Louder, multi-particle noise burst
                this.playNoise(0.28, 400, 0.7);
                this.playNoise(0.15, 800, 0.4);
                this.playTone(180, 80, 0.1, 'sawtooth', 0.2);
                break;
            case 'AWM':
                // Sniper: Big deep explosion sound
                this.playNoise(0.6, 600, 0.8, 0.0001);
                this.playTone(280, 40, 0.25, 'sawtooth', 0.4);
                // Sniper reload bolt sound slightly delayed
                setTimeout(() => this.playTone(600, 700, 0.08, 'sine', 0.08), 350);
                setTimeout(() => this.playTone(700, 500, 0.08, 'sine', 0.08), 450);
                break;
            case 'FISTS':
                // Blunt punch sound
                this.playNoise(0.08, 200, 0.3);
                this.playTone(120, 50, 0.08, 'sine', 0.25);
                break;
        }
    }
    playTone(startFreq, endFreq, duration, type = 'sine', volume = 0.2) {
        this.init();
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, now);
        if (endFreq !== startFreq) {
            osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
        }
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gainNode);
        gainNode.connect(this.masterVolume);
        osc.start(now);
        osc.stop(now + duration);
    }
    playReload() {
        this.init();
        if (!this.ctx || this.muted) return;
        // Mechanical click-clack
        this.playTone(800, 1000, 0.05, 'triangle', 0.1);
        setTimeout(() => this.playTone(900, 600, 0.06, 'triangle', 0.12), 120);
        setTimeout(() => this.playTone(600, 1200, 0.05, 'sine', 0.15), 250);
    }
    playLoot() {
        this.init();
        if (!this.ctx || this.muted) return;
        // Rising synth arpeggio
        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, freq * 1.05, 0.1, 'sine', 0.15);
            }, idx * 60);
        });
    }
    playHeal() {
        this.init();
        if (!this.ctx || this.muted) return;
        // Soothing sci-fi healing shimmer
        const now = this.ctx.currentTime;
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                this.playTone(600 + i * 200, 900 + i * 200, 0.25, 'sine', 0.1);
            }, i * 150);
        }
    }
    playDamage() {
        this.init();
        if (!this.ctx || this.muted) return;
        // Hurt sound (gritty mid-low noise burst)
        this.playNoise(0.12, 300, 0.4);
        this.playTone(150, 70, 0.1, 'triangle', 0.35);
    }
    playZoneAlert() {
        this.init();
        if (!this.ctx || this.muted) return;
        // Military alarm sound (wailing siren)
        const now = this.ctx.currentTime;
        this.playTone(400, 550, 0.3, 'sawtooth', 0.12);
        setTimeout(() => this.playTone(550, 400, 0.3, 'sawtooth', 0.12), 300);
        setTimeout(() => this.playTone(400, 550, 0.3, 'sawtooth', 0.12), 600);
    }
    playKillAnnouncement() {
        this.init();
        if (!this.ctx || this.muted) return;
        // Sci-fi kill register chime
        this.playTone(500, 1000, 0.15, 'square', 0.08);
        setTimeout(() => this.playTone(800, 1500, 0.25, 'sawtooth', 0.06), 80);
    }
    playBooyah() {
        this.init();
        if (!this.ctx || this.muted) return;
        // Fanfare melody!
        const tempo = 120;
        const beat = 60000 / tempo; // ms per beat
        const melody = [
            { f: 523.25, d: 0.5 }, // C5
            { f: 523.25, d: 0.5 }, // C5
            { f: 523.25, d: 0.5 }, // C5
            { f: 523.25, d: 1.0 }, // C5
            { f: 659.25, d: 1.0 }, // E5
            { f: 587.33, d: 1.0 }, // D5
            { f: 698.46, d: 1.0 }, // F5
            { f: 783.99, d: 2.0 }  // G5
        ];
        let accumulatedTime = 0;
        melody.forEach(note => {
            setTimeout(() => {
                this.playTone(note.f, note.f * 1.02, (note.d * beat) / 1000, 'sawtooth', 0.25);
            }, accumulatedTime);
            accumulatedTime += note.d * beat;
        });
    }
    playEliminated() {
        this.init();
        if (!this.ctx || this.muted) return;
        // Defeat downward note sweep
        this.playTone(220, 110, 0.8, 'sawtooth', 0.25);
        setTimeout(() => this.playTone(180, 90, 0.8, 'sawtooth', 0.25), 200);
    }
}
// Export single instance
window.audioController = new GameAudioController();
