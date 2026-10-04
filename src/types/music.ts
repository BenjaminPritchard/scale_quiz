/**
 * Music Theory Types and Interfaces
 */

export type ScaleType = 'major' | 'natural_minor' | 'harmonic_minor' | 'melodic_minor';

export type ClefType = 'treble' | 'bass';

export type RhythmType = 'quarter' | 'eighth' | 'dotted_eighth_sixteenth' | 'triplets' | 'syncopated';

export interface Accidental {
  type: '' | '#' | 'b' | '##' | 'bb' | 'n';
  symbol: string;
}

export interface ScaleNote {
  index: number;
  pitchName: string; // e.g., "C#4", "Bb3"
  stepLetter: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
  accidental: '' | '#' | 'b' | '##' | 'bb' | 'n';
  displayAccidental?: '' | '#' | 'b' | '##' | 'bb' | 'n'; // whether an explicit accidental glyph should be drawn
  cautionary?: boolean;
  octave: number;
  midi: number;
  frequency: number;
  degreeName: string; // e.g. "Tonic (1)", "Raised 7th", etc.
  scaleDegree: number; // 1 to 8
  isDescending: boolean;
  durationBeats: number; // in quarter note beats
  beamGroup?: number;
  hasDot?: boolean;
  isTriplet?: boolean;
}

export interface KeyInfo {
  id: string; // e.g., "G", "Eb", "F#m", "Cm"
  root: string; // e.g. "G", "Eb"
  rootLetter: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
  mode: 'major' | 'minor';
  name: string; // e.g. "G Major", "C Minor"
  accidentalsCount: number; // -7 to +7
  accidentalType: '#' | 'b' | 'none';
  keySignatureNotes: string[]; // e.g. ['F#', 'C#']
  relativeKey: string; // e.g. "E Minor" for G Major
  parallelKey: string; // e.g. "G Minor" for G Major
  circlePosition: number; // 0 to 11 (0 = C / Am at 12 o'clock)
  trebleBaseOctave: number; // optimal starting octave on treble
  bassBaseOctave: number; // optimal starting octave on bass
}

export interface RhythmDefinition {
  id: RhythmType;
  name: string;
  description: string;
  timeSignature: { beats: number; beatType: number };
  noteDurations: number[]; // durations in beats for each of the 15 notes (1 octave up & down)
  timeSignatureString: string;
}

export interface QuizQuestion {
  id: string;
  keyInfo: KeyInfo;
  scaleType: ScaleType;
  rhythm: RhythmDefinition;
  clef: ClefType;
  notes: ScaleNote[];
  explanation: string;
}

export interface QuizStats {
  totalAnswered: number;
  correctCount: number;
  streak: number;
  bestStreak: number;
  byScaleType: Record<ScaleType, { correct: number; total: number }>;
}
