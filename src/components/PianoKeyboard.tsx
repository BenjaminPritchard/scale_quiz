/**
 * PianoKeyboard.tsx
 * An interactive, 2-octave piano keyboard visualizer.
 * Highlights notes active in the scale and in real-time playback.
 */

import React from 'react';
import { ScaleNote } from '../types/music';

interface PianoKeyboardProps {
  notes: ScaleNote[];
  activeNoteIndex: number | null;
  onKeyClick?: (midi: number) => void;
  className?: string;
}

interface KeyData {
  midi: number;
  pitch: string;
  isBlack: boolean;
  whiteIndex: number;
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  notes,
  activeNoteIndex,
  onKeyClick,
  className = '',
}) => {
  // Let's generate a 2-octave keyboard from C3 (48) to B5 (83), or dynamically framed around scale notes
  const lowestMidi = Math.min(...notes.map(n => n.midi), 48);
  const highestMidi = Math.max(...notes.map(n => n.midi), 72);

  // Round lowest down to C of that octave, highest up to B
  const startMidi = Math.max(36, Math.floor(lowestMidi / 12) * 12);
  const endMidi = Math.min(84, Math.ceil((highestMidi + 1) / 12) * 12 - 1);

  // Generate keys
  const whiteKeys: KeyData[] = [];
  const blackKeys: Array<KeyData & { leftOffset: number }> = [];

  let currentWhiteIndex = 0;
  for (let m = startMidi; m <= endMidi; m++) {
    const semitone = m % 12;
    const isBlack = [1, 3, 6, 8, 10].includes(semitone);
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const pitch = noteNames[semitone] + Math.floor(m / 12 - 1);

    if (!isBlack) {
      whiteKeys.push({
        midi: m,
        pitch,
        isBlack: false,
        whiteIndex: currentWhiteIndex,
      });
      currentWhiteIndex++;
    } else {
      // Black key sits between currentWhiteIndex - 1 and currentWhiteIndex
      blackKeys.push({
        midi: m,
        pitch,
        isBlack: true,
        whiteIndex: currentWhiteIndex - 1,
        leftOffset: (currentWhiteIndex - 1) * 28 + 18,
      });
    }
  }

  // Active note MIDI
  const activeMidi = activeNoteIndex !== null && notes[activeNoteIndex] ? notes[activeNoteIndex].midi : null;

  // Scale notes MIDI set
  const scaleMidis = new Set(notes.map(n => n.midi));

  const totalWidth = whiteKeys.length * 28;

  return (
    <div className={`overflow-x-auto select-none py-2 ${className}`}>
      <div
        className="relative mx-auto h-28 bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 shadow-inner"
        style={{ width: `${totalWidth + 12}px` }}
      >
        {/* White Keys */}
        <div className="flex h-full">
          {whiteKeys.map(k => {
            const isScale = scaleMidis.has(k.midi);
            const isActive = activeMidi === k.midi;

            return (
              <button
                key={`white-key-${k.midi}`}
                type="button"
                onClick={() => onKeyClick && onKeyClick(k.midi)}
                className={`relative w-[28px] h-full rounded-b border border-zinc-300 transition-colors flex flex-col justify-end items-center pb-1 text-[10px] font-semibold cursor-pointer ${
                  isActive
                    ? 'bg-sky-400 text-sky-950 shadow-md ring-2 ring-sky-300'
                    : isScale
                    ? 'bg-sky-50 text-zinc-800 hover:bg-sky-100'
                    : 'bg-white text-zinc-400 hover:bg-zinc-100'
                }`}
              >
                {/* Scale note indicator dot */}
                {isScale && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mb-1"></span>
                )}
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-white mb-0.5 animate-pulse"></span>
                )}
                <span className="leading-none text-[9px]">{k.pitch.startsWith('C') ? k.pitch : ''}</span>
              </button>
            );
          })}
        </div>

        {/* Black Keys */}
        {blackKeys.map(k => {
          const isScale = scaleMidis.has(k.midi);
          const isActive = activeMidi === k.midi;

          return (
            <button
              key={`black-key-${k.midi}`}
              type="button"
              onClick={() => onKeyClick && onKeyClick(k.midi)}
              style={{ left: `${k.leftOffset + 6}px` }}
              className={`absolute top-1.5 w-[18px] h-16 rounded-b border border-zinc-900 z-10 transition-colors flex flex-col justify-end items-center pb-1 cursor-pointer ${
                isActive
                  ? 'bg-sky-400 text-sky-950 ring-2 ring-sky-300'
                  : isScale
                  ? 'bg-zinc-800 border-sky-400 text-sky-300 hover:bg-zinc-700'
                  : 'bg-zinc-900 hover:bg-zinc-800'
              }`}
            >
              {isScale && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-white' : 'bg-sky-400'
                  }`}
                ></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
