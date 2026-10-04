/**
 * NotationStaff.tsx
 * Professional Classical Music Notation Engine powered by VexFlow & SMuFL (Bravura):
 * - Authentic, publication-grade Treble & Bass Clefs
 * - Classical Key Signatures (all 15 major & 15 minor keys)
 * - Metric Beaming (eighth pairs, dotted-eighth + sixteenth pairs, triplets, syncopations)
 * - Triplet tuplets with classical brackets
 * - Measures & Barlines with final double barline
 * - Correct Accidental Glyph Engraving (Sharps, Flats, Naturals, Double Sharps, Cautionary accidentals)
 * - Melodic minor descending restoration
 * - Real-time playback highlighting & interactive click-to-play audio
 * - Aligned Note Pitch Names and Scale Degree labels
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Renderer,
  Stave,
  StaveNote,
  Accidental,
  Beam,
  Tuplet,
  Dot,
  Formatter,
  Voice,
  BarlineType,
} from 'vexflow';
import { ClefType, KeyInfo, RhythmDefinition, ScaleNote, ScaleType } from '../types/music';

interface NotationStaffProps {
  notes: ScaleNote[];
  keyInfo: KeyInfo;
  scaleType: ScaleType;
  clef: ClefType;
  rhythm: RhythmDefinition;
  activeNoteIndex: number | null;
  showNoteNames?: boolean;
  showScaleDegrees?: boolean;
  interactive?: boolean;
  onNoteClick?: (note: ScaleNote, index: number) => void;
}

interface RenderedNoteItem {
  x: number;
  note: ScaleNote;
  globalIndex: number;
  svgElement: SVGElement | null;
  isAltered: boolean;
}

export const NotationStaff: React.FC<NotationStaffProps> = ({
  notes,
  keyInfo,
  scaleType,
  clef,
  rhythm,
  activeNoteIndex,
  showNoteNames = false,
  showScaleDegrees = false,
  interactive = true,
  onNoteClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderedNotes, setRenderedNotes] = useState<RenderedNoteItem[]>([]);
  const [fontReady, setFontReady] = useState<boolean>(false);
  const [staffWidth, setStaffWidth] = useState<number>(920);

  // Ensure Bravura font is loaded in browser before initial render
  useEffect(() => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts
        .load('30px Bravura')
        .then(() => setFontReady(true))
        .catch(() => setFontReady(true));
    } else {
      setFontReady(true);
    }
  }, []);

  // Main VexFlow Engraving Render Pass
  useEffect(() => {
    if (!containerRef.current || !fontReady || notes.length === 0) return;

    const container = containerRef.current;
    container.innerHTML = '';

    // Calculate measure partitioning based on rhythm time signature
    const beatsPerMeasure = rhythm.timeSignature.beats;
    const measurePartitions: Array<{
      notes: ScaleNote[];
      globalIndices: number[];
      beats: number;
    }> = [];

    let curNotes: ScaleNote[] = [];
    let curIndices: number[] = [];
    let curBeats = 0;

    notes.forEach((note, idx) => {
      curNotes.push(note);
      curIndices.push(idx);
      curBeats += note.durationBeats;

      const isLastNote = idx === notes.length - 1;
      const reachedMeasureBoundary = Math.abs(curBeats - beatsPerMeasure) < 0.05 || curBeats > beatsPerMeasure;

      if (reachedMeasureBoundary || isLastNote) {
        measurePartitions.push({
          notes: curNotes,
          globalIndices: curIndices,
          beats: Math.max(Math.round(curBeats * 10) / 10, 1),
        });
        curNotes = [];
        curIndices = [];
        curBeats = 0;
      }
    });

    const numMeasures = measurePartitions.length;
    const startX = 16;
    const staveY = 28;
    const staveHeight = 160;

    // First measure modifier reservation (clef + key signature + time signature)
    const keySigCount = Math.abs(keyInfo.accidentalsCount);
    const keySigWidth = keySigCount > 0 ? keySigCount * 14 + 10 : 8;
    const startModifierWidth = 48 + keySigWidth + 38; // clef (~48px) + key sig + time sig (~38px)

    // Calculate width for each measure to guarantee spacious note engraving
    const measureWidths = measurePartitions.map((m, mIdx) => {
      const notesInMeasure = m.notes.length;
      if (mIdx === 0) {
        return Math.max(startModifierWidth + notesInMeasure * 44 + 30, 280);
      }
      return Math.max(notesInMeasure * 44 + 40, 180);
    });

    const calculatedTotalWidth = Math.max(
      measureWidths.reduce((acc, w) => acc + w, startX + 24),
      880
    );
    setStaffWidth(calculatedTotalWidth);

    // Initialize VexFlow SVG Renderer
    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(calculatedTotalWidth, staveHeight);
    const context = renderer.getContext();

    // Default dark theme styles
    context.setFillStyle('#f4f4f5');
    context.setStrokeStyle('#52525b');
    context.setLineWidth(1.4);

    // Retrieve the underlying SVG element
    const svgElement = container.querySelector('svg');
    if (svgElement) {
      svgElement.style.pointerEvents = 'auto';
      svgElement.style.overflow = 'visible';
      svgElement.setAttribute('pointer-events', 'auto');
    }

    // Draw Staves across measures
    let curX = startX;
    const staves: Stave[] = [];

    measurePartitions.forEach((m, mIdx) => {
      const mWidth = measureWidths[mIdx];
      const stave = new Stave(curX, staveY, mWidth);
      stave.setStyle({ fillStyle: '#f4f4f5', strokeStyle: '#52525b' });

      // Measure 0: Add Clef, Key Signature, Time Signature
      if (mIdx === 0) {
        stave.addClef(clef);
        try {
          stave.addKeySignature(keyInfo.id);
        } catch {
          // If custom key signature is not recognized, continue
        }
        stave.addTimeSignature(rhythm.timeSignatureString);
      }

      // Final measure: Double end barline
      if (mIdx === numMeasures - 1) {
        stave.setEndBarType(BarlineType.END);
      }

      stave.setContext(context).draw();
      staves.push(stave);
      curX += mWidth;
    });

    const noteItems: RenderedNoteItem[] = [];

    // Engrave notes, beams, and tuplets for each measure
    measurePartitions.forEach((m, mIdx) => {
      const stave = staves[mIdx];
      const measureStaveNotes: StaveNote[] = [];

      m.notes.forEach((note, nIdx) => {
        const globalIdx = m.globalIndices[nIdx];
        const letter = note.stepLetter.toLowerCase();
        const acc = note.accidental === 'n' ? '' : note.accidental;
        const keyPitch = `${letter}${acc}/${note.octave}`;

        // Determine VexFlow duration
        let durationCode = '4';
        let isDotted = false;

        if (rhythm.id === 'triplets') {
          durationCode = '8';
        } else if (note.durationBeats >= 2) {
          durationCode = '2';
        } else if (note.durationBeats >= 1) {
          durationCode = '4';
        } else if (note.durationBeats === 0.75) {
          durationCode = '8';
          isDotted = true;
        } else if (note.durationBeats === 0.5) {
          durationCode = '8';
        } else if (note.durationBeats === 0.25) {
          durationCode = '16';
        }

        const staveNote = new StaveNote({
          keys: [keyPitch],
          duration: durationCode,
          clef: clef,
        });

        // Attach Dot modifier if dotted note
        if (isDotted) {
          try {
            Dot.buildAndAttach([staveNote]);
          } catch {
            // Handled
          }
        }

        // Attach Accidental glyph if explicit or restored (melodic minor descending)
        if (note.displayAccidental) {
          try {
            const accidental = new Accidental(note.displayAccidental);
            if (note.cautionary) {
              accidental.setAsCautionary();
            }
            staveNote.addModifier(accidental, 0);
          } catch {
            // Handled
          }
        }

        // Color coding
        const isAltered =
          scaleType === 'harmonic_minor'
            ? note.scaleDegree === 7
            : scaleType === 'melodic_minor'
            ? note.scaleDegree === 6 || note.scaleDegree === 7
            : false;

        const isActive = activeNoteIndex === globalIdx;
        const noteColor = isActive ? '#38bdf8' : isAltered ? '#fbbf24' : '#f4f4f5';

        staveNote.setStyle({ fillStyle: noteColor, strokeStyle: noteColor });

        measureStaveNotes.push(staveNote);
      });

      // Classical Metric Beaming & Tuplet grouping
      const measureBeams: Beam[] = [];
      const measureTuplets: Tuplet[] = [];

      if (rhythm.id === 'eighth') {
        // Group eighth notes into 2-note metric beat pairs
        for (let i = 0; i < measureStaveNotes.length - 1; i += 2) {
          const nA = measureStaveNotes[i];
          const nB = measureStaveNotes[i + 1];
          if (nA.getDuration() === '8' && nB.getDuration() === '8') {
            measureBeams.push(new Beam([nA, nB]));
          }
        }
      } else if (rhythm.id === 'dotted_eighth_sixteenth') {
        // Group dotted eighth + sixteenth pairs
        for (let i = 0; i < measureStaveNotes.length - 1; i += 2) {
          const nA = measureStaveNotes[i];
          const nB = measureStaveNotes[i + 1];
          measureBeams.push(new Beam([nA, nB]));
        }
      } else if (rhythm.id === 'triplets') {
        // Group into authentic triplets (3 notes per beat with bracket)
        for (let i = 0; i < measureStaveNotes.length - 2; i += 3) {
          const tripGroup = [measureStaveNotes[i], measureStaveNotes[i + 1], measureStaveNotes[i + 2]];
          measureBeams.push(new Beam(tripGroup));
          measureTuplets.push(new Tuplet(tripGroup));
        }
      } else if (rhythm.id === 'syncopated') {
        // Beam adjacent eighth notes in pairs
        for (let i = 0; i < measureStaveNotes.length - 1; i++) {
          const nA = measureStaveNotes[i];
          const nB = measureStaveNotes[i + 1];
          if (nA.getDuration() === '8' && nB.getDuration() === '8') {
            measureBeams.push(new Beam([nA, nB]));
            i++; // skip next as it is paired
          }
        }
      }

      // Voice Formatting
      const voice = new Voice({
        numBeats: m.beats,
        beatValue: 4,
      }).setMode(Voice.Mode.SOFT);

      voice.addTickables(measureStaveNotes);

      const staveStartX = mIdx === 0 ? startModifierWidth : 20;
      const usableWidth = Math.max(stave.getWidth() - staveStartX - 24, 120);

      try {
        new Formatter().joinVoices([voice]).format([voice], usableWidth);
      } catch (err) {
        console.warn('Voice formatting fallback:', err);
      }

      // Draw Voice onto Stave
      voice.draw(context, stave);

      // Draw Beams with dark-mode styling
      measureBeams.forEach(b => {
        b.setStyle({ fillStyle: '#f4f4f5', strokeStyle: '#f4f4f5' });
        b.setContext(context).draw();
      });

      // Draw Tuplets
      measureTuplets.forEach(t => {
        t.setContext(context).draw();
      });

      // Collect note SVG groups and coordinates for interactivity
      measureStaveNotes.forEach((sNote, nIdx) => {
        const globalIdx = m.globalIndices[nIdx];
        const originalNote = m.notes[nIdx];
        const svgGroup = sNote.getSVGElement() as SVGElement | null;
        const noteX = sNote.getAbsoluteX();

        const isAltered =
          scaleType === 'harmonic_minor'
            ? originalNote.scaleDegree === 7
            : scaleType === 'melodic_minor'
            ? originalNote.scaleDegree === 6 || originalNote.scaleDegree === 7
            : false;

        noteItems.push({
          x: noteX,
          note: originalNote,
          globalIndex: globalIdx,
          svgElement: svgGroup,
          isAltered,
        });
      });
    });

    setRenderedNotes(noteItems);
  }, [notes, keyInfo, scaleType, clef, rhythm, fontReady]);

  // Synchronous Note Interaction & Real-time Playback Highlighting
  useEffect(() => {
    renderedNotes.forEach(item => {
      const { note, globalIndex, svgElement, isAltered } = item;
      if (!svgElement) return;

      const isActive = activeNoteIndex === globalIndex;
      const noteColor = isActive ? '#38bdf8' : isAltered ? '#fbbf24' : '#f4f4f5';

      svgElement.style.pointerEvents = 'auto';

      if (interactive) {
        svgElement.style.cursor = 'pointer';
        svgElement.onclick = (e: MouseEvent) => {
          e.stopPropagation();
          onNoteClick?.(note, globalIndex);
        };
      } else {
        svgElement.style.cursor = 'default';
        svgElement.onclick = null;
      }

      // Glow effect for active note during playback
      if (isActive) {
        svgElement.style.filter = 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.95)) drop-shadow(0 0 2px #38bdf8)';
      } else if (isAltered) {
        svgElement.style.filter = 'drop-shadow(0 0 3px rgba(251, 191, 36, 0.45))';
      } else {
        svgElement.style.filter = '';
      }

      // Update paths / text fills inside note group
      const childPaths = svgElement.querySelectorAll<SVGElement>('path, text, line, polygon');
      childPaths.forEach(elem => {
        if (elem.tagName.toLowerCase() !== 'line') {
          elem.setAttribute('fill', noteColor);
        }
        if (elem.hasAttribute('stroke') && elem.getAttribute('stroke') !== 'none') {
          elem.setAttribute('stroke', noteColor);
        }
      });
    });
  }, [renderedNotes, activeNoteIndex, interactive, onNoteClick]);

  return (
    <div className="w-full overflow-x-auto select-none rounded-xl border border-zinc-800 bg-zinc-950/85 p-3 sm:p-5 shadow-2xl backdrop-blur-md">
      <div className="min-w-[880px] flex flex-col items-center">
        {/* VexFlow Engraving Canvas */}
        <div
          ref={containerRef}
          className="w-full flex justify-center overflow-visible"
          style={{ minHeight: '160px' }}
        />

        {/* Note Labels Row: Pitch Names & Scale Degrees aligned to exact note X positions */}
        {(showNoteNames || showScaleDegrees) && renderedNotes.length > 0 && (
          <div
            className="relative w-full h-14 mt-[-10px] select-none"
            style={{ width: `${staffWidth}px` }}
          >
            {renderedNotes.map(({ x, note, globalIndex, isAltered }) => {
              const isActive = activeNoteIndex === globalIndex;
              const displayPitch = note.pitchName.replace(/\d/, '');

              return (
                <div
                  key={`label-${globalIndex}`}
                  className="absolute transform -translate-x-1/2 flex flex-col items-center text-center pointer-events-none transition-colors duration-150"
                  style={{ left: `${x}px` }}
                >
                  {/* Note Pitch Name */}
                  {showNoteNames && (
                    <span
                      className={`text-xs font-mono font-bold leading-tight ${
                        isActive
                          ? 'text-sky-400 scale-110 drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]'
                          : isAltered
                          ? 'text-amber-300'
                          : 'text-zinc-200'
                      }`}
                    >
                      {displayPitch}
                    </span>
                  )}

                  {/* Scale Degree */}
                  {showScaleDegrees && (
                    <span
                      className={`text-[11px] font-mono leading-tight ${
                        note.scaleDegree === 1 || note.scaleDegree === 8
                          ? 'text-emerald-400 font-bold'
                          : isAltered
                          ? 'text-amber-400 font-bold'
                          : 'text-zinc-400'
                      }`}
                    >
                      {note.scaleDegree}^
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Staff Footer Information & Guidelines */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400 border-t border-zinc-800/80 pt-2.5 px-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            Ascending (Degrees 1–8)
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500/80"></span>
            Descending (Degrees 8–1)
          </span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline text-zinc-400">
            Tip: Click any notehead to hear pitch & accidental
          </span>
        </div>

        {scaleType === 'melodic_minor' && (
          <div className="flex items-center gap-1.5 text-amber-300 font-medium">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[11px] border border-amber-500/30">
              Melodic Minor Rule
            </span>
            <span>Ascending: Raised 6th & 7th ➔ Descending: Restored Natural Minor!</span>
          </div>
        )}

        {scaleType === 'harmonic_minor' && (
          <div className="flex items-center gap-1.5 text-amber-300 font-medium">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[11px] border border-amber-500/30">
              Harmonic Minor Rule
            </span>
            <span>Raised 7th degree (Leading tone) both ascending & descending!</span>
          </div>
        )}
      </div>
    </div>
  );
};
