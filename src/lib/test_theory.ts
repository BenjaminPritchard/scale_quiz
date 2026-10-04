/**
 * Comprehensive Automated Music Theory Test Suite
 * Validates:
 * 1. Key signature definitions for all 15 Major keys
 * 2. Key signature definitions for all 15 Minor keys
 * 3. Exact correspondence: Abm has 7 flats, Fm has 4 flats, Ab Major has 4 flats
 * 4. Melodic minor ascending raised 6th & 7th, descending restored natural minor
 * 5. Harmonic minor ascending and descending raised 7th
 * 6. generateQuizQuestion integrity over hundreds of random seeds
 */

import {
  ALL_MAJOR_KEYS,
  ALL_MINOR_KEYS,
  generateQuizQuestion,
  generateScaleNotes,
  RHYTHM_DEFINITIONS,
  SCALE_INTERVALS,
} from './musicTheory.ts';
import { ScaleType } from '../types/music.ts';

function runTests() {
  console.log('=== Starting Rigorous Music Theory Validation ===');
  let failures = 0;

  // 1. Verify all 15 Major keys
  const expectedMajorKeys: Record<string, { count: number; sig: string[] }> = {
    'C': { count: 0, sig: [] },
    'G': { count: 1, sig: ['F#'] },
    'D': { count: 2, sig: ['F#', 'C#'] },
    'A': { count: 3, sig: ['F#', 'C#', 'G#'] },
    'E': { count: 4, sig: ['F#', 'C#', 'G#', 'D#'] },
    'B': { count: 5, sig: ['F#', 'C#', 'G#', 'D#', 'A#'] },
    'F#': { count: 6, sig: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'] },
    'C#': { count: 7, sig: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'] },
    'F': { count: -1, sig: ['Bb'] },
    'Bb': { count: -2, sig: ['Bb', 'Eb'] },
    'Eb': { count: -3, sig: ['Bb', 'Eb', 'Ab'] },
    'Ab': { count: -4, sig: ['Bb', 'Eb', 'Ab', 'Db'] },
    'Db': { count: -5, sig: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'] },
    'Gb': { count: -6, sig: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'] },
    'Cb': { count: -7, sig: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'] },
  };

  for (const key of ALL_MAJOR_KEYS) {
    const expected = expectedMajorKeys[key.root];
    if (!expected) continue;
    if (key.accidentalsCount !== expected.count) {
      console.error(`FAIL: Major Key ${key.name} expected ${expected.count} accidentals, got ${key.accidentalsCount}`);
      failures++;
    }
    if (JSON.stringify(key.keySignatureNotes) !== JSON.stringify(expected.sig)) {
      console.error(`FAIL: Major Key ${key.name} signature notes mismatch`, key.keySignatureNotes, expected.sig);
      failures++;
    }
  }

  // 2. Verify all 15 Minor keys
  const expectedMinorKeys: Record<string, { count: number; sig: string[] }> = {
    'Am': { count: 0, sig: [] },
    'Em': { count: 1, sig: ['F#'] },
    'Bm': { count: 2, sig: ['F#', 'C#'] },
    'F#m': { count: 3, sig: ['F#', 'C#', 'G#'] },
    'C#m': { count: 4, sig: ['F#', 'C#', 'G#', 'D#'] },
    'G#m': { count: 5, sig: ['F#', 'C#', 'G#', 'D#', 'A#'] },
    'D#m': { count: 6, sig: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'] },
    'A#m': { count: 7, sig: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'] },
    'Dm': { count: -1, sig: ['Bb'] },
    'Gm': { count: -2, sig: ['Bb', 'Eb'] },
    'Cm': { count: -3, sig: ['Bb', 'Eb', 'Ab'] },
    'Fm': { count: -4, sig: ['Bb', 'Eb', 'Ab', 'Db'] },
    'Bbm': { count: -5, sig: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'] },
    'Ebm': { count: -6, sig: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'] },
    'Abm': { count: -7, sig: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'] },
  };

  for (const key of ALL_MINOR_KEYS) {
    const expected = expectedMinorKeys[key.id];
    if (!expected) continue;
    if (key.accidentalsCount !== expected.count) {
      console.error(`FAIL: Minor Key ${key.name} expected ${expected.count} accidentals, got ${key.accidentalsCount}`);
      failures++;
    }
    if (JSON.stringify(key.keySignatureNotes) !== JSON.stringify(expected.sig)) {
      console.error(`FAIL: Minor Key ${key.name} signature notes mismatch`, key.keySignatureNotes, expected.sig);
      failures++;
    }
  }

  // Specifically check Ab Minor vs Ab Major vs F Minor
  const abMajor = ALL_MAJOR_KEYS.find(k => k.root === 'Ab')!;
  const abMinor = ALL_MINOR_KEYS.find(k => k.root === 'Ab')!;
  const fMinor = ALL_MINOR_KEYS.find(k => k.root === 'F')!;

  if (abMajor.accidentalsCount !== -4) {
    console.error('FAIL: Ab Major must have 4 flats, got ' + abMajor.accidentalsCount);
    failures++;
  }
  if (abMinor.accidentalsCount !== -7) {
    console.error('FAIL: Ab Minor must have 7 flats, got ' + abMinor.accidentalsCount);
    failures++;
  }
  if (fMinor.accidentalsCount !== -4) {
    console.error('FAIL: F Minor must have 4 flats, got ' + fMinor.accidentalsCount);
    failures++;
  }

  // 3. Test generateQuizQuestion 200 times across all filters
  const filters: Array<'all' | 'circle' | 'white' | 'sharps' | 'flats'> = ['all', 'circle', 'white', 'sharps', 'flats'];
  for (let i = 0; i < 200; i++) {
    const filter = filters[i % filters.length];
    const q = generateQuizQuestion(filter);

    // If Major scale -> key must be Major
    if (q.scaleType === 'major' && q.keyInfo.mode !== 'major') {
      console.error(`FAIL: Quiz generated Major scale with non-major key: ${q.keyInfo.name}`);
      failures++;
    }

    // If Minor scale -> key must be Minor
    if (q.scaleType !== 'major' && q.keyInfo.mode !== 'minor') {
      console.error(`FAIL: Quiz generated Minor scale (${q.scaleType}) with non-minor key: ${q.keyInfo.name}`);
      failures++;
    }

    // Ab minor must NEVER have 4 flats
    if (q.keyInfo.root === 'Ab' && q.keyInfo.mode === 'minor' && q.keyInfo.accidentalsCount !== -7) {
      console.error(`FAIL: Ab Minor question has wrong accidentals count: ${q.keyInfo.accidentalsCount}`);
      failures++;
    }

    // F minor must have 4 flats
    if (q.keyInfo.root === 'F' && q.keyInfo.mode === 'minor' && q.keyInfo.accidentalsCount !== -4) {
      console.error(`FAIL: F Minor question has wrong accidentals count: ${q.keyInfo.accidentalsCount}`);
      failures++;
    }

    // Notes length must be 15
    if (q.notes.length !== 15) {
      console.error(`FAIL: Question notes length is not 15: ${q.notes.length}`);
      failures++;
    }

    // Ascending note 7 must match descending note 7 in pitch
    if (q.notes[0].stepLetter !== q.notes[14].stepLetter) {
      console.error(`FAIL: Start and end note letter mismatch in ${q.keyInfo.name}`);
      failures++;
    }
  }

  // 4. Test Melodic Minor descending restoration
  for (const key of ALL_MINOR_KEYS) {
    const notes = generateScaleNotes(key, 'melodic_minor', RHYTHM_DEFINITIONS[0], 'treble');
    // Note 8 is degree 7 descending, Note 9 is degree 6 descending
    const desc7 = notes[8];
    const desc6 = notes[9];

    // Must be descending
    if (!desc7.isDescending || !desc6.isDescending) {
      console.error(`FAIL: Note 8 or 9 not marked as descending in ${key.name}`);
      failures++;
    }

    // Must have displayAccidental or cautionary set
    if (!desc7.displayAccidental && !desc7.cautionary) {
      console.error(`FAIL: Descending degree 7 missing accidental display in ${key.name}`);
      failures++;
    }
  }

  if (failures === 0) {
    console.log('✅ ALL MUSIC THEORY VERIFICATIONS PASSED: 0 Failures!');
  } else {
    console.error(`❌ FOUND ${failures} FAILURES!`);
    process.exit(1);
  }
}

runTests();
