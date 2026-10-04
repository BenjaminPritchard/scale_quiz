/**
 * ScaleExplorer.tsx
 * Free exploration and study mode for scales:
 * - Select any key via Circle of Fifths or picker
 * - Switch between Major, Natural Minor, Harmonic Minor, and Melodic Minor
 * - Compare ascending vs descending forms
 * - Playback in different rhythmic meters with live staff & keyboard tracking
 */

import React, { useState, useEffect } from 'react';
import { Play, Square, Info, Music, Sliders, Volume2 } from 'lucide-react';
import { ClefType, KeyInfo, RhythmDefinition, ScaleNote, ScaleType } from '../types/music';
import {
  ALL_MAJOR_KEYS,
  ALL_MINOR_KEYS,
  CIRCLE_OF_FIFTHS_DATA,
  generateScaleNotes,
  getKeyInfoByRootAndMode,
  RHYTHM_DEFINITIONS,
  SCALE_TYPE_DETAILS,
} from '../lib/musicTheory';
import { soundEngine } from '../lib/audioSynth';
import { NotationStaff } from './NotationStaff';
import { CircleOfFifths } from './CircleOfFifths';
import { PianoKeyboard } from './PianoKeyboard';

interface ScaleExplorerProps {
  initialKey?: KeyInfo;
  initialScaleType?: ScaleType;
}

export const ScaleExplorer: React.FC<ScaleExplorerProps> = ({
  initialKey,
  initialScaleType = 'melodic_minor',
}) => {
  const [scaleType, setScaleType] = useState<ScaleType>(initialScaleType);
  const [selectedKey, setSelectedKey] = useState<KeyInfo>(() => {
    if (initialKey) return initialKey;
    const isMajor = initialScaleType === 'major';
    return isMajor ? ALL_MAJOR_KEYS[0] : ALL_MINOR_KEYS[0]; // C Major or A Minor
  });
  const [clef, setClef] = useState<ClefType>('treble');
  const [selectedRhythm, setSelectedRhythm] = useState<RhythmDefinition>(RHYTHM_DEFINITIONS[0]);
  const [tempo, setTempo] = useState<number>(100);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      soundEngine.stop();
    };
  }, []);

  // Compute scale notes whenever parameters change
  const notes = generateScaleNotes(selectedKey, scaleType, selectedRhythm, clef);

  // Handle Play/Stop
  const handlePlayToggle = () => {
    if (isPlaying) {
      soundEngine.stop();
      setIsPlaying(false);
      setActiveNoteIndex(null);
      return;
    }

    setIsPlaying(true);
    soundEngine.playScaleSequence(
      notes,
      tempo,
      (idx) => setActiveNoteIndex(idx),
      () => {
        setIsPlaying(false);
        setActiveNoteIndex(null);
      }
    );
  };

  const handleNoteClick = (note: ScaleNote, idx: number) => {
    setActiveNoteIndex(idx);
    soundEngine.playTone(note.frequency, 0.5, 0.6);
    setTimeout(() => {
      if (!isPlaying) setActiveNoteIndex(null);
    }, 400);
  };

  const isMajorMode = scaleType === 'major';
  const availableKeysForMode = isMajorMode ? ALL_MAJOR_KEYS : ALL_MINOR_KEYS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 shadow-lg backdrop-blur flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Interactive Scale Explorer</h2>
            <p className="text-xs text-zinc-400">
              Select any key or scale to inspect notation, listen to rhythmic patterns, and explore music theory.
            </p>
          </div>
        </div>

        {/* Quick Scale Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
          {(['major', 'natural_minor', 'harmonic_minor', 'melodic_minor'] as ScaleType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                soundEngine.stop();
                setIsPlaying(false);
                setActiveNoteIndex(null);
                setScaleType(type);

                // Ensure key matches the new mode (major vs minor)
                const newMode = type === 'major' ? 'major' : 'minor';
                if (selectedKey.mode !== newMode) {
                  const updatedKey = getKeyInfoByRootAndMode(selectedKey.root, newMode);
                  setSelectedKey(updatedKey);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                scaleType === type
                  ? 'bg-sky-500 text-zinc-950 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              {SCALE_TYPE_DETAILS[type].name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Staff Notation Stage */}
      <div className="space-y-4">
        {/* Playback & Parameters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md cursor-pointer ${
                isPlaying
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
              }`}
            >
              {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Stop' : 'Play Scale'}</span>
            </button>

            {/* Tempo */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 pl-2 border-l border-zinc-800">
              <span>{tempo} BPM</span>
              <input
                type="range"
                min="60"
                max="180"
                step="5"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-24 accent-sky-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Clef selector */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setClef('treble')}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  clef === 'treble' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Treble
              </button>
              <button
                onClick={() => setClef('bass')}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  clef === 'bass' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Bass
              </button>
            </div>

            {/* Rhythm Selector */}
            <select
              value={selectedRhythm.id}
              onChange={(e) => {
                soundEngine.stop();
                setIsPlaying(false);
                setActiveNoteIndex(null);
                const found = RHYTHM_DEFINITIONS.find((r) => r.id === e.target.value);
                if (found) setSelectedRhythm(found);
              }}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 cursor-pointer"
            >
              {RHYTHM_DEFINITIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* Key Selector Dropdown strictly for the active mode */}
            <select
              value={selectedKey.id}
              onChange={(e) => {
                soundEngine.stop();
                setIsPlaying(false);
                setActiveNoteIndex(null);
                const found = availableKeysForMode.find((k) => k.id === e.target.value);
                if (found) setSelectedKey(found);
              }}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-sky-400 font-semibold cursor-pointer"
            >
              {availableKeysForMode.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name} ({k.accidentalsCount === 0 ? '♮ 0' : k.accidentalsCount > 0 ? `${k.accidentalsCount}♯` : `${Math.abs(k.accidentalsCount)}♭`})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Score Staff */}
        <NotationStaff
          notes={notes}
          keyInfo={selectedKey}
          scaleType={scaleType}
          clef={clef}
          rhythm={selectedRhythm}
          activeNoteIndex={activeNoteIndex}
          showNoteNames={true}
          showScaleDegrees={true}
          onNoteClick={handleNoteClick}
        />
      </div>

      {/* Two Column Layout: Circle of Fifths & Deep Theory Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Circle of Fifths Section */}
        <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Circle of Fifths
            </h3>
            <span className="text-xs text-zinc-400">Click any key to inspect</span>
          </div>
          <p className="text-xs text-zinc-400 mb-4 text-center">
            Active key: <strong className="text-sky-400">{selectedKey.name}</strong> ({selectedKey.accidentalsCount === 0 ? 'No sharps or flats' : `${Math.abs(selectedKey.accidentalsCount)} ${selectedKey.accidentalType === '#' ? '♯' : '♭'}`})
          </p>

          <CircleOfFifths
            activeKey={selectedKey}
            scaleType={scaleType}
            onSelectKey={(newKey) => {
              soundEngine.stop();
              setIsPlaying(false);
              setActiveNoteIndex(null);
              setSelectedKey(newKey);
              // If newKey is major and scaleType was minor, switch to major; if newKey is minor and scaleType was major, switch to minor!
              if (newKey.mode === 'major' && scaleType !== 'major') {
                setScaleType('major');
              } else if (newKey.mode === 'minor' && scaleType === 'major') {
                setScaleType('melodic_minor');
              }
            }}
          />
        </div>

        {/* Piano & Scale Theory Details */}
        <div className="lg:col-span-7 space-y-4">
          {/* Keyboard Visualizer */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Keyboard Layout
              </h3>
              <span className="text-xs text-zinc-400">Interactive notes</span>
            </div>
            <PianoKeyboard
              notes={notes}
              activeNoteIndex={activeNoteIndex}
              onKeyClick={(midi) => {
                soundEngine.playTone(440 * Math.pow(2, (midi - 69) / 12), 0.5, 0.6);
              }}
            />
          </div>

          {/* Theory Breakdown Box */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white">
                {selectedKey.name} {SCALE_TYPE_DETAILS[scaleType].name} Deep Dive
              </h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {SCALE_TYPE_DETAILS[scaleType].explanation}
            </p>

            {/* Formula & Degree table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg">
                <span className="text-zinc-500 font-semibold block mb-1">Ascending Notes</span>
                <div className="flex flex-wrap gap-1 font-mono text-emerald-300 font-bold">
                  {notes.slice(0, 8).map((n, i) => (
                    <span key={`asc-${i}`} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                      {n.pitchName.replace(/\d/, '')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg">
                <span className="text-zinc-500 font-semibold block mb-1">Descending Notes</span>
                <div className="flex flex-wrap gap-1 font-mono text-blue-300 font-bold">
                  {notes.slice(7, 15).map((n, i) => (
                    <span key={`desc-${i}`} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                      {n.pitchName.replace(/\d/, '')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {scaleType === 'melodic_minor' && (
              <div className="p-3.5 bg-purple-950/30 border border-purple-500/40 rounded-lg text-xs space-y-1.5">
                <div className="font-bold text-purple-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  Why does Melodic Minor change descending?
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  In classical voice leading and melodic composition, the raised 6th and 7th degrees provide smooth melodic ascent to the tonic without the awkward augmented second gap (1.5 steps) of harmonic minor. However, when descending away from the tonic, the leading tone is no longer pulling upward to 1, so both the 7th and 6th are lowered back to the natural minor scale.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

