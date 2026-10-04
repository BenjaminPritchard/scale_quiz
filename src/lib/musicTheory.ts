/**
 * Music Theory Core Engine
 * Handles scale generation, accidental calculation, Circle of Fifths, and staff coordinates.
 */

import { ClefType, KeyInfo, RhythmDefinition, RhythmType, ScaleNote, ScaleType } from '../types/music';

// Diatonic letters in order
export const DIATONIC_LETTERS: Array<'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'> = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Semitones from C for natural notes
export const NATURAL_SEMITONES: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

// Circle of Fifths keys definition (12 clock positions)
export const CIRCLE_OF_FIFTHS_DATA: KeyInfo[] = [
  {
    id: 'C',
    root: 'C',
    rootLetter: 'C',
    mode: 'major',
    name: 'C Major',
    accidentalsCount: 0,
    accidentalType: 'none',
    keySignatureNotes: [],
    relativeKey: 'A Minor',
    parallelKey: 'C Minor',
    circlePosition: 0,
    trebleBaseOctave: 4,
    bassBaseOctave: 3,
  },
  {
    id: 'G',
    root: 'G',
    rootLetter: 'G',
    mode: 'major',
    name: 'G Major',
    accidentalsCount: 1,
    accidentalType: '#',
    keySignatureNotes: ['F#'],
    relativeKey: 'E Minor',
    parallelKey: 'G Minor',
    circlePosition: 1,
    trebleBaseOctave: 4,
    bassBaseOctave: 2,
  },
  {
    id: 'D',
    root: 'D',
    rootLetter: 'D',
    mode: 'major',
    name: 'D Major',
    accidentalsCount: 2,
    accidentalType: '#',
    keySignatureNotes: ['F#', 'C#'],
    relativeKey: 'B Minor',
    parallelKey: 'D Minor',
    circlePosition: 2,
    trebleBaseOctave: 4,
    bassBaseOctave: 3,
  },
  {
    id: 'A',
    root: 'A',
    rootLetter: 'A',
    mode: 'major',
    name: 'A Major',
    accidentalsCount: 3,
    accidentalType: '#',
    keySignatureNotes: ['F#', 'C#', 'G#'],
    relativeKey: 'F# Minor',
    parallelKey: 'A Minor',
    circlePosition: 3,
    trebleBaseOctave: 4,
    bassBaseOctave: 2,
  },
  {
    id: 'E',
    root: 'E',
    rootLetter: 'E',
    mode: 'major',
    name: 'E Major',
    accidentalsCount: 4,
    accidentalType: '#',
    keySignatureNotes: ['F#', 'C#', 'G#', 'D#'],
    relativeKey: 'C# Minor',
    parallelKey: 'E Minor',
    circlePosition: 4,
    trebleBaseOctave: 4,
    bassBaseOctave: 2,
  },
  {
    id: 'B',
    root: 'B',
    rootLetter: 'B',
    mode: 'major',
    name: 'B Major',
    accidentalsCount: 5,
    accidentalType: '#',
    keySignatureNotes: ['F#', 'C#', 'G#', 'D#', 'A#'],
    relativeKey: 'G# Minor',
    parallelKey: 'B Minor',
    circlePosition: 5,
    trebleBaseOctave: 3,
    bassBaseOctave: 2,
  },
  {
    id: 'F#',
    root: 'F#',
    rootLetter: 'F',
    mode: 'major',
    name: 'F# Major',
    accidentalsCount: 6,
    accidentalType: '#',
    keySignatureNotes: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'],
    relativeKey: 'D# Minor',
    parallelKey: 'F# Minor',
    circlePosition: 6,
    trebleBaseOctave: 4,
    bassBaseOctave: 2,
  },
  {
    id: 'Db',
    root: 'Db',
    rootLetter: 'D',
    mode: 'major',
    name: 'D♭ Major',
    accidentalsCount: -5,
    accidentalType: 'b',
    keySignatureNotes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'],
    relativeKey: 'B♭ Minor',
    parallelKey: 'D♭ Minor',
    circlePosition: 7,
    trebleBaseOctave: 4,
    bassBaseOctave: 3,
  },
  {
    id: 'Ab',
    root: 'Ab',
    rootLetter: 'A',
    mode: 'major',
    name: 'A♭ Major',
    accidentalsCount: -4,
    accidentalType: 'b',
    keySignatureNotes: ['Bb', 'Eb', 'Ab', 'Db'],
    relativeKey: 'F Minor',
    parallelKey: 'A♭ Minor',
    circlePosition: 8,
    trebleBaseOctave: 4,
    bassBaseOctave: 2,
  },
  {
    id: 'Eb',
    root: 'Eb',
    rootLetter: 'E',
    mode: 'major',
    name: 'E♭ Major',
    accidentalsCount: -3,
    accidentalType: 'b',
    keySignatureNotes: ['Bb', 'Eb', 'Ab'],
    relativeKey: 'C Minor',
    parallelKey: 'E♭ Minor',
    circlePosition: 9,
    trebleBaseOctave: 4,
    bassBaseOctave: 3,
  },
  {
    id: 'Bb',
    root: 'Bb',
    rootLetter: 'B',
    mode: 'major',
    name: 'B♭ Major',
    accidentalsCount: -2,
    accidentalType: 'b',
    keySignatureNotes: ['Bb', 'Eb'],
    relativeKey: 'G Minor',
    parallelKey: 'B♭ Minor',
    circlePosition: 10,
    trebleBaseOctave: 3,
    bassBaseOctave: 2,
  },
  {
    id: 'F',
    root: 'F',
    rootLetter: 'F',
    mode: 'major',
    name: 'F Major',
    accidentalsCount: -1,
    accidentalType: 'b',
    keySignatureNotes: ['Bb'],
    relativeKey: 'D Minor',
    parallelKey: 'F Minor',
    circlePosition: 11,
    trebleBaseOctave: 4,
    bassBaseOctave: 2,
  },
];

// Additional standard enharmonic keys to support all keys
export const ALL_MAJOR_KEYS: KeyInfo[] = [
  ...CIRCLE_OF_FIFTHS_DATA,
  {
    id: 'C#',
    root: 'C#',
    rootLetter: 'C',
    mode: 'major',
    name: 'C# Major',
    accidentalsCount: 7,
    accidentalType: '#',
    keySignatureNotes: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'],
    relativeKey: 'A# Minor',
    parallelKey: 'C# Minor',
    circlePosition: 7,
    trebleBaseOctave: 4,
    bassBaseOctave: 3,
  },
  {
    id: 'Gb',
    root: 'Gb',
    rootLetter: 'G',
    mode: 'major',
    name: 'G♭ Major',
    accidentalsCount: -6,
    accidentalType: 'b',
    keySignatureNotes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'],
    relativeKey: 'E♭ Minor',
    parallelKey: 'G♭ Minor',
    circlePosition: 6,
    trebleBaseOctave: 4,
    bassBaseOctave: 2,
  },
  {
    id: 'Cb',
    root: 'Cb',
    rootLetter: 'C',
    mode: 'major',
    name: 'C♭ Major',
    accidentalsCount: -7,
    accidentalType: 'b',
    keySignatureNotes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'],
    relativeKey: 'A♭ Minor',
    parallelKey: 'C♭ Minor',
    circlePosition: 5,
    trebleBaseOctave: 4,
    bassBaseOctave: 3,
  },
];

// All standard Minor keys (with their corresponding key signatures)
export const ALL_MINOR_KEYS: KeyInfo[] = [
  {
    id: 'Am',
    root: 'A',
    rootLetter: 'A',
    mode: 'minor',
    name: 'A Minor',
    accidentalsCount: 0,
    accidentalType: 'none',
    keySignatureNotes: [],
    relativeKey: 'C Major',
    parallelKey: 'A Major',
    circlePosition: 0,
    trebleBaseOctave: 4,
    bassBaseOctave: 2,
  },
  {
    id: 'Em',
    root: 'E',
    rootLetter: 'E',
    mode: 'minor',
    name: 'E Minor',
    accidentalsCount: 1,
    accidentalType: '#',
    keySignatureNotes: ['F#'],
    relativeKey: 'G Major',
    parallelKey: 'E Major',
    circlePosition: 1,
    trebleBaseOctave: 4,
    bassBaseOctave: 2,
  },
  {
    id: 'Bm',
    root: 'B',
    rootLetter: 'B',
    mode: 'minor',
    name: 'B Minor',
    accidentalsCount: 2,
    accidentalType: '#',
    keySignatureNotes: ['F#', 'C#'],
    relativeKey: 'D Major',
    parallelKey: 'B Major',
    circlePosition: 2,
    trebleBaseOctave: 3,
    bassBaseOctave: 2,
  },
  {
    id: 'F#m',
    root: 'F#',
    rootLetter: 'F',
    mode: 'minor',
    name: 'F# Minor',
    accidentalsCount: 3,
    accidentalType: '#',
    keySignatureNotes: ['F#', 'C#', 'G#'],
    relativeKey: 'A Major',
    parallelKey: 'F# Major',
    circlePosition: 3,
    trebleBaseOctave: 4,
    bassBaseOctave: 2,
  },
  {
    id: 'C#m',
    root: 'C#',
    rootLetter: 'C',
    mode: 'minor',
    name: 'C# Minor',
    accidentalsCount: 4,
    accidentalType: '#',
    keySignatureNotes: ['F#', 'C#', 'G#', 'D#'],
    relativeKey: 'E Major',
    parallelKey: 'C# Major',
    circlePosition: 4,
    trebleBaseOctave: 4,
    bassBaseOctave: 3,
  },
  {
    id: 'G#m',
    root: 'G#',
    rootLetter: 'G',
    mode: 'minor',
    name: 'G# Minor',
    accidentalsCount: 5,
    accidentalType: '#',
    keySignatureNotes: ['F#', 'C#', 'G#', 'D#', 'A#'],
    relativeKey: 'B Major',
    parallelKey: 'G# Major',
    circlePosition: 5,
    trebleBaseOctave: 4,
    bassBaseOctave: 2,
  },
  {
    id: 'D#m',
    root: 'D#',
    rootLetter: 'D',
    mode: 'minor',
    name: 'D# Minor',
    accidentalsCount: 6,
    accidentalType: '#',
    keySignatureNotes: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'],
    relativeKey: 'F# Major',
    parallelKey: 'D# Major',
    circlePosition: 6,
    trebleBaseOctave: 4,
    bassBaseOctave: 3,
  },
  {
    id: 'A#m',
    root: 'A#',
    rootLetter: 'A',
    mode: 'minor',
    name: 'A# Minor',
    accidentalsCount: 7,
    accidentalType: '#',
    keySignatureNotes: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'],
    relativeKey: 'C# Major',
    parallelKey: 'A# Major',
    circlePosition: 7,
    trebleBaseOctave: 3,
    bassBaseOctave: 2,
  },
  {
    id: 'Dm',
    root: 'D',
    rootLetter: 'D',
    mode: 'minor',
    name: 'D Minor',
    accidentalsCount: -1,
    accidentalType: 'b',
    keySignatureNotes: ['Bb'],
    relativeKey: 'F Major',
    parallelKey: 'D Major',
    circlePosition: 11,
    trebleBaseOctave: 4,
    bassBaseOctave: 3,
  },
  {
    id: 'Gm',
    root: 'G',
    rootLetter: 'G',
    mode: 'minor',
    name: 'G Minor',
    accidentalsCount: -2,
    accidentalType: 'b',
    keySignatureNotes: ['Bb', 'Eb'],
    relativeKey: 'B♭ Major',
    parallelKey: 'G Major',
    circlePosition: 10,
    trebleBaseOctave: 4,
    bassBaseOctave: 2,
  },
  {
    id: 'Cm',
    root: 'C',
    rootLetter: 'C',
    mode: 'minor',
    name: 'C Minor',
    accidentalsCount: -3,
    accidentalType: 'b',
    keySignatureNotes: ['Bb', 'Eb', 'Ab'],
    relativeKey: 'E♭ Major',
    parallelKey: 'C Major',
    circlePosition: 9,
    trebleBaseOctave: 4,
    bassBaseOctave: 3,
  },
  {
    id: 'Fm',
    root: 'F',
    rootLetter: 'F',
    mode: 'minor',
    name: 'F Minor',
    accidentalsCount: -4,
    accidentalType: 'b',
    keySignatureNotes: ['Bb', 'Eb', 'Ab', 'Db'],
    relativeKey: 'A♭ Major',
    parallelKey: 'F Major',
    circlePosition: 8,
    trebleBaseOctave: 4,
    bassBaseOctave: 2,
  },
  {
    id: 'Bbm',
    root: 'Bb',
    rootLetter: 'B',
    mode: 'minor',
    name: 'B♭ Minor',
    accidentalsCount: -5,
    accidentalType: 'b',
    keySignatureNotes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'],
    relativeKey: 'D♭ Major',
    parallelKey: 'B♭ Major',
    circlePosition: 7,
    trebleBaseOctave: 3,
    bassBaseOctave: 2,
  },
  {
    id: 'Ebm',
    root: 'Eb',
    rootLetter: 'E',
    mode: 'minor',
    name: 'E♭ Minor',
    accidentalsCount: -6,
    accidentalType: 'b',
    keySignatureNotes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'],
    relativeKey: 'G♭ Major',
    parallelKey: 'E♭ Major',
    circlePosition: 6,
    trebleBaseOctave: 4,
    bassBaseOctave: 3,
  },
  {
    id: 'Abm',
    root: 'Ab',
    rootLetter: 'A',
    mode: 'minor',
    name: 'A♭ Minor',
    accidentalsCount: -7,
    accidentalType: 'b',
    keySignatureNotes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'],
    relativeKey: 'C♭ Major',
    parallelKey: 'A♭ Major',
    circlePosition: 5,
    trebleBaseOctave: 4,
    bassBaseOctave: 2,
  },
];

// Scale intervals (semitones above tonic)
export const SCALE_INTERVALS: Record<ScaleType, { ascending: number[]; descending: number[] }> = {
  major: {
    ascending: [0, 2, 4, 5, 7, 9, 11, 12],
    descending: [12, 11, 9, 7, 5, 4, 2, 0],
  },
  natural_minor: {
    ascending: [0, 2, 3, 5, 7, 8, 10, 12],
    descending: [12, 10, 8, 7, 5, 3, 2, 0],
  },
  harmonic_minor: {
    ascending: [0, 2, 3, 5, 7, 8, 11, 12],
    descending: [12, 11, 8, 7, 5, 3, 2, 0],
  },
  melodic_minor: {
    ascending: [0, 2, 3, 5, 7, 9, 11, 12], // Raised 6th & 7th
    descending: [12, 10, 8, 7, 5, 3, 2, 0], // Restored lowered 7th & 6th (natural minor descending!)
  },
};

export const SCALE_TYPE_DETAILS: Record<ScaleType, { name: string; formula: string; explanation: string; tagColor: string }> = {
  major: {
    name: 'Major',
    formula: '1 - 2 - 3 - 4 - 5 - 6 - 7 - 8',
    explanation: 'Major scale with natural intervals (W-W-H-W-W-W-H). Stays identical ascending and descending.',
    tagColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  natural_minor: {
    name: 'Natural Minor',
    formula: '1 - 2 - ♭3 - 4 - 5 - ♭6 - ♭7 - 8',
    explanation: 'Natural minor (Aeolian mode). Contains ♭3, ♭6, and ♭7. Stays identical ascending and descending.',
    tagColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  harmonic_minor: {
    name: 'Harmonic Minor',
    formula: '1 - 2 - ♭3 - 4 - 5 - ♭6 - 7 - 8',
    explanation: 'Harmonic minor features a raised 7th degree (leading tone) both ascending AND descending, creating a distinct augmented 2nd interval between ♭6 and 7.',
    tagColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  melodic_minor: {
    name: 'Melodic Minor',
    formula: 'Ascending: 1 - 2 - ♭3 - 4 - 5 - 6 - 7 - 8 | Descending: 8 - ♭7 - ♭6 - 5 - 4 - ♭3 - 2 - 1',
    explanation: 'Melodic minor raises the 6th and 7th degrees when ASCENDING, but strictly RESTORES them to the natural minor (lowered ♭7 and ♭6) when DESCENDING.',
    tagColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  },
};

// Rhythm definitions for the 15-note scale (1 octave up, 1 octave down)
export const RHYTHM_DEFINITIONS: RhythmDefinition[] = [
  {
    id: 'quarter',
    name: 'Quarter Notes (4/4)',
    description: 'Steady 4-beat measures; 15 notes + final dotted whole or breath rest',
    timeSignature: { beats: 4, beatType: 4 },
    timeSignatureString: '4/4',
    // 15 notes: 1 beat each; final note sustained for 2 beats in last measure
    noteDurations: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  },
  {
    id: 'eighth',
    name: 'Running Eighths (4/4)',
    description: 'Brisk paired eighth notes with beams, concluding on half note',
    timeSignature: { beats: 4, beatType: 4 },
    timeSignatureString: '4/4',
    // 14 eighth notes (0.5) + 1 whole/half note (1.0)
    noteDurations: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1.0],
  },
  {
    id: 'dotted_eighth_sixteenth',
    name: 'Dotted Rhythm (Long-Short)',
    description: 'Expressive classical dotted eighth + sixteenth pairs',
    timeSignature: { beats: 4, beatType: 4 },
    timeSignatureString: '4/4',
    // 7 pairs of (0.75 + 0.25) + 1 tonic note (1.0)
    noteDurations: [
      0.75, 0.25, 0.75, 0.25, 0.75, 0.25, 0.75, 0.25,
      0.75, 0.25, 0.75, 0.25, 0.75, 0.25, 1.0,
    ],
  },
  {
    id: 'triplets',
    name: 'Eighth-Note Triplets (3/4)',
    description: 'Flowing three-note groups in 3/4 time',
    timeSignature: { beats: 3, beatType: 4 },
    timeSignatureString: '3/4',
    // Triplets: 5 complete 3-note groups (15 notes total)
    noteDurations: [
      1/3, 1/3, 1/3, 1/3, 1/3, 1/3,
      1/3, 1/3, 1/3, 1/3, 1/3, 1/3,
      1/3, 1/3, 1/3,
    ],
  },
  {
    id: 'syncopated',
    name: 'Syncopated / Mixed Pattern',
    description: 'Dynamic mix of quarter notes and eighth note pairs',
    timeSignature: { beats: 4, beatType: 4 },
    timeSignatureString: '4/4',
    // Quarter, 2 eighths, quarter, 2 eighths...
    noteDurations: [
      1.0, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 0.5,
      0.5, 1.0, 0.5, 0.5, 1.0, 0.5, 1.0,
    ],
  },
];

// Helper to convert accidental string to standard symbol
export function getAccidentalSymbol(acc: string): string {
  switch (acc) {
    case '#': return '♯';
    case 'b': return '♭';
    case '##': return '𝄪';
    case 'bb': return '𝄫';
    case 'n': return '♮';
    default: return '';
  }
}

// Convert root name to base MIDI note
export function getBaseMidiForPitch(letter: string, accidental: string, octave: number): number {
  let semitones = NATURAL_SEMITONES[letter];
  if (accidental === '#') semitones += 1;
  else if (accidental === '##') semitones += 2;
  else if (accidental === 'b') semitones -= 1;
  else if (accidental === 'bb') semitones -= 2;

  // MIDI: C4 is 60. Octave 4 C = 60, D = 62, etc.
  return (octave + 1) * 12 + semitones;
}

// MIDI to Frequency in Hz (A4 = 440Hz)
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Parse a pitch string like "C#4", "Bb3", "F5"
export function parsePitchString(pitch: string): { letter: 'C'|'D'|'E'|'F'|'G'|'A'|'B'; accidental: ''|'#'|'b'|'##'|'bb'|'n'; octave: number } {
  const match = pitch.match(/^([A-G])(#{1,2}|b{1,2}|n)?(\d)$/);
  if (!match) {
    return { letter: 'C', accidental: '', octave: 4 };
  }
  return {
    letter: match[1] as any,
    accidental: (match[2] || '') as any,
    octave: parseInt(match[3], 10),
  };
}

/**
 * Generate 15 scale notes (1 octave up, 1 octave down) with strictly correct music spelling
 * including melodic minor descending restoration.
 */
export function generateScaleNotes(
  keyInfo: KeyInfo,
  scaleType: ScaleType,
  rhythm: RhythmDefinition,
  clef: ClefType
): ScaleNote[] {
  const rootLetter = keyInfo.rootLetter;
  const rootIndex = DIATONIC_LETTERS.indexOf(rootLetter);

  // Parse root accidental
  const rootAccidental = keyInfo.root.slice(1) as '' | '#' | 'b';
  const startOctave = clef === 'treble' ? keyInfo.trebleBaseOctave : keyInfo.bassBaseOctave;
  const rootMidi = getBaseMidiForPitch(rootLetter, rootAccidental, startOctave);

  // Get intervals
  const intervals = SCALE_INTERVALS[scaleType];
  const notes: ScaleNote[] = [];

  // Key signature notes as a map for fast lookup
  const keySigMap = new Map<string, string>(); // 'F' -> '#'
  keyInfo.keySignatureNotes.forEach(sig => {
    const letter = sig[0];
    const acc = sig.slice(1);
    keySigMap.set(letter, acc);
  });

  // Track accidentals already sounding in the measure/scale so we correctly notate accidentals
  const activeAccidentalsInMeasure = new Map<string, string>();

  // 15 notes: 8 ascending (0..7), 7 descending (8..14)
  for (let i = 0; i < 15; i++) {
    const isDescending = i >= 8;
    const degreeIndex = isDescending ? 14 - i : i; // 0 to 7
    const scaleDegree = degreeIndex + 1; // 1 to 8

    // Target semitone relative to root
    const semitonesFromRoot = isDescending
      ? intervals.descending[i - 7] // index 1..7 in descending array
      : intervals.ascending[i];

    const targetMidi = rootMidi + semitonesFromRoot;

    // Diatonic letter for this scale degree
    const diatonicStepLetter = DIATONIC_LETTERS[(rootIndex + degreeIndex) % 7];

    // Determine octave of diatonic letter
    // If degreeIndex wraps around past B -> C, octave increments
    let noteOctave = startOctave;
    const letterPos = DIATONIC_LETTERS.indexOf(diatonicStepLetter);
    if (letterPos < rootIndex || (degreeIndex === 7)) {
      noteOctave = startOctave + 1;
    }

    // Natural note MIDI at this noteOctave
    const naturalMidi = getBaseMidiForPitch(diatonicStepLetter, '', noteOctave);
    const accidentalDiff = targetMidi - naturalMidi;

    let accidental: '' | '#' | 'b' | '##' | 'bb' | 'n' = '';
    if (accidentalDiff === 0) accidental = '';
    else if (accidentalDiff === 1) accidental = '#';
    else if (accidentalDiff === 2) accidental = '##';
    else if (accidentalDiff === -1) accidental = 'b';
    else if (accidentalDiff === -2) accidental = 'bb';
    else if (accidentalDiff === 12) {
      // octave jump adjustment if any
      accidental = '';
    }

    // Pitch name string
    const pitchName = `${diatonicStepLetter}${accidental}${noteOctave}`;

    // Degree Name Label
    let degreeName = '';
    if (scaleDegree === 1 || scaleDegree === 8) {
      degreeName = scaleDegree === 1 ? 'Tonic (1)' : 'Tonic 8ve (8)';
    } else if (scaleDegree === 2) {
      degreeName = 'Supertonic (2)';
    } else if (scaleDegree === 3) {
      degreeName = scaleType === 'major' ? 'Mediant (3)' : 'Minor Mediant (♭3)';
    } else if (scaleDegree === 4) {
      degreeName = 'Subdominant (4)';
    } else if (scaleDegree === 5) {
      degreeName = 'Dominant (5)';
    } else if (scaleDegree === 6) {
      if (scaleType === 'major' || (!isDescending && scaleType === 'melodic_minor')) {
        degreeName = 'Submediant (6)';
      } else {
        degreeName = 'Minor Submediant (♭6)';
      }
    } else if (scaleDegree === 7) {
      if (scaleType === 'major' || scaleType === 'harmonic_minor' || (!isDescending && scaleType === 'melodic_minor')) {
        degreeName = 'Leading Tone (7)';
      } else {
        degreeName = 'Subtonic (♭7)';
      }
    }

    // Accidental display decision:
    // What is the expected key signature accidental for this diatonic letter?
    const keySigAcc = keySigMap.get(diatonicStepLetter) || '';

    // Does this note differ from the key signature?
    let displayAccidental: '' | '#' | 'b' | '##' | 'bb' | 'n' | undefined = undefined;
    let cautionary = false;

    // Check if accidental matches key signature
    if (accidental !== keySigAcc) {
      // It has an explicit accidental!
      // If accidental is '' but key signature has '#' or 'b', we must show a natural 'n'!
      if (accidental === '') {
        displayAccidental = 'n';
      } else {
        displayAccidental = accidental;
      }
    } else {
      // Accidental matches key signature.
      // BUT if this letter had an accidental earlier in ascending scale (especially in melodic minor descending!),
      // we MUST display the restored accidental (natural or flat/sharp)!
      const previousState = activeAccidentalsInMeasure.get(diatonicStepLetter);
      if (previousState !== undefined && previousState !== keySigAcc) {
        // Earlier in this scale, this letter was altered!
        // So descending, we MUST restore it!
        displayAccidental = (keySigAcc === '' ? 'n' : keySigAcc) as any;
        cautionary = true;
      }
    }

    // Special rule for Melodic Minor descending:
    // 6th and 7th degrees descending are restored. Always show explicit accidental on descending 7th & 6th if melodic minor!
    if (scaleType === 'melodic_minor' && isDescending && (scaleDegree === 7 || scaleDegree === 6)) {
      displayAccidental = (keySigAcc === '' ? 'n' : keySigAcc) as any;
      cautionary = true;
    }

    // Update active accidental for this letter
    activeAccidentalsInMeasure.set(diatonicStepLetter, accidental);

    const durationBeats = rhythm.noteDurations[i] ?? 1.0;

    notes.push({
      index: i,
      pitchName,
      stepLetter: diatonicStepLetter,
      accidental,
      displayAccidental,
      cautionary,
      octave: noteOctave,
      midi: targetMidi,
      frequency: midiToFreq(targetMidi),
      degreeName,
      scaleDegree,
      isDescending,
      durationBeats,
      hasDot: durationBeats === 0.75,
      isTriplet: rhythm.id === 'triplets',
    });
  }

  return notes;
}

/**
 * Diatonic staff line position calculation.
 * Returns diatonic step offset from bottom line of staff (0 = bottom line).
 * In treble clef:
 * Line 0 = E4, Line 1 = G4, Line 2 = B4, Line 3 = D5, Line 4 = F5
 * Step values: C4 = -2 (ledger line), D4 = -1, E4 = 0, F4 = 1, G4 = 2, A4 = 3, B4 = 4, C5 = 5, D5 = 6, E5 = 7, F5 = 8, G5 = 9, A5 = 10 (ledger line)
 *
 * In bass clef:
 * Line 0 = G2, Line 1 = B2, Line 2 = D3, Line 3 = F3, Line 4 = A3
 * Step values: G2 = 0, A2 = 1, B2 = 2, C3 = 3, D3 = 4, E3 = 5, F3 = 6, G3 = 7, A3 = 8, B3 = 9, C4 = 10 (ledger line above)
 */
export function getStaffDiatonicStep(letter: 'C'|'D'|'E'|'F'|'G'|'A'|'B', octave: number, clef: ClefType): number {
  const diatonicValue = DIATONIC_LETTERS.indexOf(letter);
  const totalDiatonic = octave * 7 + diatonicValue;

  if (clef === 'treble') {
    // Treble bottom line is E4: 4 * 7 + 2 = 30
    return totalDiatonic - 30;
  } else {
    // Bass bottom line is G2: 2 * 7 + 4 = 18
    return totalDiatonic - 18;
  }
}

/**
 * Standard key signature accidental positions on staff (step offset relative to bottom line 0).
 */
export const KEY_SIGNATURE_STAFF_POSITIONS: Record<ClefType, { sharps: Record<string, number>; flats: Record<string, number> }> = {
  treble: {
    sharps: {
      'F#': 8, // F5 (top line)
      'C#': 5, // C5 (third space)
      'G#': 9, // G5 (space above top line)
      'D#': 6, // D5 (fourth line)
      'A#': 3, // A4 (second space)
      'E#': 7, // E5 (fourth space)
      'B#': 4, // B4 (third line)
    },
    flats: {
      'Bb': 4, // B4 (third line)
      'Eb': 7, // E5 (fourth space)
      'Ab': 3, // A4 (second space)
      'Db': 6, // D5 (fourth line)
      'Gb': 2, // G4 (second line)
      'Cb': 5, // C5 (third space)
      'Fb': 1, // F4 (first space)
    },
  },
  bass: {
    sharps: {
      'F#': 6, // F3 (fourth line)
      'C#': 3, // C3 (second space)
      'G#': 7, // G3 (fourth space)
      'D#': 4, // D3 (third line)
      'A#': 1, // A2 (first space)
      'E#': 5, // E3 (third space)
      'B#': 2, // B2 (second line)
    },
    flats: {
      'Bb': 2, // B2 (second line)
      'Eb': 5, // E3 (third space)
      'Ab': 1, // A2 (first space)
      'Db': 4, // D3 (third line)
      'Gb': 0, // G2 (first line)
      'Cb': 3, // C3 (second space)
      'Fb': -1, // F2 (space below staff)
    },
  },
};

/**
 * Lookup matching KeyInfo by root name and mode.
 */
export function getKeyInfoByRootAndMode(root: string, mode: 'major' | 'minor'): KeyInfo {
  const pool = mode === 'major' ? ALL_MAJOR_KEYS : ALL_MINOR_KEYS;
  const match = pool.find(k => k.root === root);
  if (match) return match;
  if (root === 'G#' && mode === 'major') return ALL_MAJOR_KEYS.find(k => k.root === 'Ab') || ALL_MAJOR_KEYS[0];
  if (root === 'Ab' && mode === 'minor') return ALL_MINOR_KEYS.find(k => k.root === 'Ab') || ALL_MINOR_KEYS[0];
  return mode === 'major' ? ALL_MAJOR_KEYS[0] : ALL_MINOR_KEYS[0];
}

/**
 * Pick a random question for the quiz.
 * Strictly guarantees that Major scales use Major keys & key signatures,
 * and Minor scales use their authentic Minor keys & key signatures.
 * Supports filtering by keys and clefs.
 */
export function generateQuizQuestion(
  keyFilter: 'all' | 'circle' | 'white' | 'sharps' | 'flats' = 'all',
  scaleTypesToInclude: ScaleType[] = ['major', 'natural_minor', 'harmonic_minor', 'melodic_minor'],
  clefChoice: 'auto' | 'treble' | 'bass' = 'auto',
  rhythmChoice: RhythmType | 'random' = 'quarter'
): { keyInfo: KeyInfo; scaleType: ScaleType; rhythm: RhythmDefinition; clef: ClefType; notes: ScaleNote[]; explanation: string } {
  // 1. Select Scale Type first
  const selectedScaleType = scaleTypesToInclude[Math.floor(Math.random() * scaleTypesToInclude.length)];
  const isMajor = selectedScaleType === 'major';

  // 2. Candidate keys MUST match the mode of the scale!
  // Major scales use Major keys with their respective key signatures.
  // Minor scales (natural, harmonic, melodic) use Minor keys with their respective authentic minor key signatures!
  let candidateKeys = isMajor ? [...ALL_MAJOR_KEYS] : [...ALL_MINOR_KEYS];

  if (keyFilter === 'white') {
    candidateKeys = candidateKeys.filter(k => k.accidentalsCount === 0);
  } else if (keyFilter === 'sharps') {
    candidateKeys = candidateKeys.filter(k => k.accidentalsCount > 0);
  } else if (keyFilter === 'flats') {
    candidateKeys = candidateKeys.filter(k => k.accidentalsCount < 0);
  } else if (keyFilter === 'circle') {
    candidateKeys = candidateKeys.filter(k => Math.abs(k.accidentalsCount) <= 6);
  }

  const selectedKey = candidateKeys[Math.floor(Math.random() * candidateKeys.length)];

  // 3. Clef
  let clef: ClefType;
  if (clefChoice === 'auto') {
    clef = Math.random() < 0.65 ? 'treble' : 'bass';
  } else {
    clef = clefChoice;
  }

  // 4. Rhythm
  let rhythmDef: RhythmDefinition;
  if (rhythmChoice === 'random') {
    rhythmDef = RHYTHM_DEFINITIONS[Math.floor(Math.random() * RHYTHM_DEFINITIONS.length)];
  } else {
    rhythmDef = RHYTHM_DEFINITIONS.find(r => r.id === rhythmChoice) || RHYTHM_DEFINITIONS[0];
  }

  const notes = generateScaleNotes(selectedKey, selectedScaleType, rhythmDef, clef);

  // 5. Generate clear pedagogical explanation
  let explanation = '';
  const keySigDescription = selectedKey.accidentalsCount === 0
    ? 'no sharps or flats'
    : `${Math.abs(selectedKey.accidentalsCount)} ${selectedKey.accidentalType === '#' ? 'sharp' : 'flat'}${Math.abs(selectedKey.accidentalsCount) > 1 ? 's' : ''} (${selectedKey.keySignatureNotes.map(n => n.replace('#', '♯').replace('b', '♭')).join(', ')})`;

  if (selectedScaleType === 'major') {
    explanation = `${selectedKey.name} is a major scale with key signature of ${keySigDescription}. All notes strictly follow the key signature without altered 6th or 7th degrees.`;
  } else if (selectedScaleType === 'natural_minor') {
    explanation = `${selectedKey.name} (Aeolian mode) uses the key signature of ${keySigDescription} (relative to ${selectedKey.relativeKey}). Notes are unaltered (♭3, ♭6, ♭7) both ascending and descending.`;
  } else if (selectedScaleType === 'harmonic_minor') {
    const raised7 = notes[6].pitchName.replace(/\d/, '');
    explanation = `${selectedKey.name} uses the key signature of ${keySigDescription}. Notice the raised 7th degree (${raised7.replace('#', '♯').replace('b', '♭')}) marked with an accidental both ascending AND descending!`;
  } else if (selectedScaleType === 'melodic_minor') {
    const raised6 = notes[5].pitchName.replace(/\d/, '');
    const raised7 = notes[6].pitchName.replace(/\d/, '');
    const desc7 = notes[8].pitchName.replace(/\d/, '');
    const desc6 = notes[9].pitchName.replace(/\d/, '');
    explanation = `${selectedKey.name} uses the key signature of ${keySigDescription}. Ascending, it raises the 6th (${raised6.replace('#', '♯')}) and 7th (${raised7.replace('#', '♯')}). Descending, it RESTORES the lowered natural minor degrees (${desc7.replace('b', '♭')}, ${desc6.replace('b', '♭')})!`;
  }

  return {
    keyInfo: selectedKey,
    scaleType: selectedScaleType,
    rhythm: rhythmDef,
    clef,
    notes,
    explanation,
  };
}
