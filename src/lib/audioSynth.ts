/**
 * Web Audio Synthesizer for ScaleMaster
 * Produces high-quality acoustic-style piano/bell tones with synchronous playback callbacks.
 */

import { ScaleNote } from '../types/music';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private currentTimeoutIds: number[] = [];
  private activeOscillators: Array<{ stop: () => void }> = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Play an individual tone
   */
  public playTone(freq: number, durationSeconds: number = 0.6, volume: number = 0.5) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator(); // fundamental
      const osc2 = this.ctx.createOscillator(); // octave/overtone
      const noteGain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, now);

      // Low pass filter for warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(freq * 4, 6000), now);
      filter.frequency.exponentialRampToValueAtTime(Math.max(freq, 400), now + durationSeconds);

      // Envelope: fast percussive attack, mellow decay
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.012);
      noteGain.gain.exponentialRampToValueAtTime(volume * 0.25, now + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + durationSeconds + 0.05);
      osc2.stop(now + durationSeconds + 0.05);
    } catch {
      // Audio playback failsafe
    }
  }

  /**
   * Play full rhythmic scale sequence with synchronized highlight callbacks
   */
  public playScaleSequence(
    notes: ScaleNote[],
    bpm: number,
    onNoteStart: (index: number) => void,
    onComplete: () => void
  ) {
    this.stop();
    this.initContext();
    this.isPlaying = true;

    // 1 beat at BPM in seconds
    const secondsPerBeat = 60 / bpm;
    let accumulatedTime = 0;

    notes.forEach((note, idx) => {
      const noteDuration = Math.max(note.durationBeats * secondsPerBeat, 0.15);
      const noteStartDelay = accumulatedTime * 1000;

      const timeoutId = window.setTimeout(() => {
        if (!this.isPlaying) return;
        onNoteStart(idx);
        this.playTone(note.frequency, noteDuration * 0.95, 0.6);
      }, noteStartDelay);

      this.currentTimeoutIds.push(timeoutId);
      accumulatedTime += note.durationBeats * secondsPerBeat;
    });

    // Schedule finish
    const finalTimeoutId = window.setTimeout(() => {
      if (this.isPlaying) {
        this.isPlaying = false;
        onComplete();
      }
    }, (accumulatedTime + 0.3) * 1000);

    this.currentTimeoutIds.push(finalTimeoutId);
  }

  /**
   * Play celebration sound (for correct answers)
   */
  public playCelebrationChime() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 0.4, 0.45);
        }, i * 70);
      });
    } catch {}
  }

  /**
   * Play soft incorrect prompt
   */
  public playIncorrectSound() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const notes = [311.13, 293.66]; // Eb4, D4
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 0.35, 0.3);
        }, i * 120);
      });
    } catch {}
  }

  public stop() {
    this.isPlaying = false;
    this.currentTimeoutIds.forEach(id => clearTimeout(id));
    this.currentTimeoutIds = [];
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch {}
    });
    this.activeOscillators = [];
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const soundEngine = new SoundEngine();
