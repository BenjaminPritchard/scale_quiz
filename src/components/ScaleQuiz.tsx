/**
 * ScaleQuiz.tsx
 * Interactive Scale Recognition Quiz:
 * - Shows notated scale (1 octave up, 1 octave down)
 * - Rhythmic variety (Quarter, Eighths, Dotted, Triplets, Mixed)
 * - Random keys across all 15 major & minor key signatures
 * - Melodic minor correctly notates descending with restored degrees
 * - Multiple choice selection: Major, Natural Minor, Harmonic Minor, Melodic Minor
 * - Synchronized Circle of Fifths indicating the key signature and active key
 * - Audio playback with real-time note highlighting
 * - Score, streak tracking, and celebration confetti
 */

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Settings2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ClefType, KeyInfo, RhythmType, ScaleNote, ScaleType } from '../types/music';
import { generateQuizQuestion, RHYTHM_DEFINITIONS, SCALE_TYPE_DETAILS } from '../lib/musicTheory';
import { soundEngine } from '../lib/audioSynth';
import { NotationStaff } from './NotationStaff';
import { CircleOfFifths } from './CircleOfFifths';
import { PianoKeyboard } from './PianoKeyboard';

interface ScaleQuizProps {
  onSelectKeyToExplore?: (key: KeyInfo, scaleType: ScaleType) => void;
}

export const ScaleQuiz: React.FC<ScaleQuizProps> = () => {
  // Quiz configuration filters
  const [keyFilter, setKeyFilter] = useState<'all' | 'circle' | 'white' | 'sharps' | 'flats'>('all');
  const [clefChoice, setClefChoice] = useState<'auto' | 'treble' | 'bass'>('auto');
  const [rhythmChoice, setRhythmChoice] = useState<RhythmType | 'random'>('random');
  const [tempo, setTempo] = useState<number>(100);

  // Active question state
  const [currentQuestion, setCurrentQuestion] = useState(() =>
    generateQuizQuestion('all', ['major', 'natural_minor', 'harmonic_minor', 'melodic_minor'], 'auto', 'random')
  );

  // Quiz state
  const [selectedAnswer, setSelectedAnswer] = useState<ScaleType | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [showNoteNames, setShowNoteNames] = useState<boolean>(false);
  const [showScaleDegrees, setShowScaleDegrees] = useState<boolean>(false);
  const [showPiano, setShowPiano] = useState<boolean>(true);
  const [showCircle, setShowCircle] = useState<boolean>(true);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(false);

  // Audio playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
  });

  // Available scale choices
  const scaleChoices: Array<{ type: ScaleType; label: string; sub: string }> = [
    { type: 'major', label: 'Major', sub: 'Natural 3rd, 6th, 7th' },
    { type: 'natural_minor', label: 'Natural Minor', sub: '♭3, ♭6, ♭7 (Aeolian)' },
    { type: 'harmonic_minor', label: 'Harmonic Minor', sub: 'Raised 7th (both ways)' },
    { type: 'melodic_minor', label: 'Melodic Minor', sub: 'Raised 6th & 7th up, lowered down' },
  ];

  // Stop sound when unmounting
  useEffect(() => {
    return () => {
      soundEngine.stop();
    };
  }, []);

  // Generate next question
  const nextQuestion = useCallback(() => {
    soundEngine.stop();
    setIsPlaying(false);
    setActiveNoteIndex(null);
    setSelectedAnswer(null);
    setIsAnswered(false);

    const newQuestion = generateQuizQuestion(keyFilter, ['major', 'natural_minor', 'harmonic_minor', 'melodic_minor'], clefChoice, rhythmChoice);
    setCurrentQuestion(newQuestion);
  }, [keyFilter, clefChoice, rhythmChoice]);

  // Audio Playback
  const handlePlayScale = () => {
    if (isPlaying) {
      soundEngine.stop();
      setIsPlaying(false);
      setActiveNoteIndex(null);
      return;
    }

    setIsPlaying(true);
    soundEngine.playScaleSequence(
      currentQuestion.notes,
      tempo,
      (idx) => {
        setActiveNoteIndex(idx);
      },
      () => {
        setIsPlaying(false);
        setActiveNoteIndex(null);
      }
    );
  };

  // Play individual note on click
  const handleNoteClick = (note: ScaleNote, idx: number) => {
    setActiveNoteIndex(idx);
    soundEngine.playTone(note.frequency, 0.5, 0.6);
    setTimeout(() => {
      if (!isPlaying) setActiveNoteIndex(null);
    }, 400);
  };

  // Handle user answer
  const handleSelectChoice = (choice: ScaleType) => {
    if (isAnswered) return;

    setSelectedAnswer(choice);
    setIsAnswered(true);

    const isCorrect = choice === currentQuestion.scaleType;

    if (isCorrect) {
      soundEngine.playCelebrationChime();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#34d399', '#fbbf24', '#a855f7'],
      });

      setStats((prev) => {
        const newStreak = prev.streak + 1;
        return {
          total: prev.total + 1,
          correct: prev.correct + 1,
          streak: newStreak,
          bestStreak: Math.max(prev.bestStreak, newStreak),
        };
      });

      if (autoAdvance) {
        setTimeout(() => {
          nextQuestion();
        }, 2200);
      }
    } else {
      soundEngine.playIncorrectSound();
      setStats((prev) => ({
        ...prev,
        total: prev.total + 1,
        streak: 0,
      }));
    }
  };

  const isCorrect = selectedAnswer === currentQuestion.scaleType;
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 shadow-lg backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Scale Identification Drill</h2>
            <p className="text-xs text-zinc-400">
              Listen, observe the notation & key signature, and identify the scale type.
            </p>
          </div>
        </div>

        {/* Live Scorecard */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-400">Streak:</span>
            <span className="font-bold text-amber-400">{stats.streak}</span>
            {stats.bestStreak > 0 && (
              <span className="text-zinc-500 text-[10px]">(best {stats.bestStreak})</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700">
            <span className="text-zinc-400">Accuracy:</span>
            <span className="font-bold text-emerald-400">{accuracy}%</span>
            <span className="text-zinc-500">
              ({stats.correct}/{stats.total})
            </span>
          </div>

          <button
            onClick={() => setStats({ total: 0, correct: 0, streak: 0, bestStreak: 0 })}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            title="Reset score"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage: Notation Staff + Controls */}
      <div className="space-y-4">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/60">
          <div className="flex items-center gap-3">
            {/* Audio Play Button */}
            <button
              onClick={handlePlayScale}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-md cursor-pointer ${
                isPlaying
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold'
              }`}
            >
              {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Stop Audio' : 'Play Scale Audio'}</span>
            </button>

            {/* Tempo Slider */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 pl-2 border-l border-zinc-800">
              <span>{tempo} BPM</span>
              <input
                type="range"
                min="60"
                max="160"
                step="5"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-20 accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Clef indicator badge */}
            <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-xs font-mono capitalize">
              {currentQuestion.clef} Clef
            </span>

            {/* Rhythm badge */}
            <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-xs font-mono">
              {currentQuestion.rhythm.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Note Names */}
            <button
              onClick={() => setShowNoteNames(!showNoteNames)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                showNoteNames ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Show note names under the staff"
            >
              {showNoteNames ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Note Names</span>
            </button>

            {/* Toggle Circle of Fifths */}
            <button
              onClick={() => setShowCircle(!showCircle)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                showCircle ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Circle of Fifths</span>
            </button>

            {/* Toggle Piano Keyboard */}
            <button
              onClick={() => setShowPiano(!showPiano)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                showPiano ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Piano</span>
            </button>
          </div>
        </div>

        {/* Notated Staff */}
        <NotationStaff
          notes={currentQuestion.notes}
          keyInfo={currentQuestion.keyInfo}
          scaleType={currentQuestion.scaleType}
          clef={currentQuestion.clef}
          rhythm={currentQuestion.rhythm}
          activeNoteIndex={activeNoteIndex}
          showNoteNames={showNoteNames || isAnswered}
          showScaleDegrees={showScaleDegrees || isAnswered}
          onNoteClick={handleNoteClick}
        />

        {/* Visualizer Row: Circle of Fifths & Piano Keyboard */}
        {(showCircle || showPiano) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {showCircle && (
              <div className={`${showPiano ? 'lg:col-span-5' : 'lg:col-span-12'} bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex flex-col items-center justify-center`}>
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Key Signature in Circle of Fifths
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-sky-400 font-mono">
                    {isAnswered
                      ? currentQuestion.keyInfo.name
                      : `Tonic: ${currentQuestion.keyInfo.root} (${currentQuestion.keyInfo.accidentalsCount === 0 ? '0 ♮' : `${Math.abs(currentQuestion.keyInfo.accidentalsCount)}${currentQuestion.keyInfo.accidentalType === '#' ? '♯' : '♭'}`})`}
                  </span>
                </div>
                <CircleOfFifths activeKey={currentQuestion.keyInfo} scaleType={currentQuestion.scaleType} />
              </div>
            )}

            {showPiano && (
              <div className={`${showCircle ? 'lg:col-span-7' : 'lg:col-span-12'} bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Keyboard Mapping (Ascending & Descending)
                    </span>
                    <span className="text-xs text-zinc-500">
                      Highlighted keys belong to {currentQuestion.keyInfo.root}
                    </span>
                  </div>
                  <PianoKeyboard
                    notes={currentQuestion.notes}
                    activeNoteIndex={activeNoteIndex}
                    onKeyClick={(midi) => {
                      soundEngine.playTone(440 * Math.pow(2, (midi - 69) / 12), 0.5, 0.6);
                    }}
                  />
                </div>

                <div className="mt-3 p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg text-xs text-zinc-400 space-y-1">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-zinc-300">Target Scale:</span>
                    <span className="text-sky-400 font-mono">
                      {isAnswered ? `${currentQuestion.keyInfo.root} ${SCALE_TYPE_DETAILS[currentQuestion.scaleType].name}` : '??? (Hidden until answered)'}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Observe the accidentals on the 6th and 7th degrees. Are they natural, raised, or restored descending?
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Multiple Choice Quiz Area */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Which scale is notated above?</h3>
            <p className="text-xs text-zinc-400">
              Key: <span className="font-semibold text-sky-400">{currentQuestion.keyInfo.root}</span> ({currentQuestion.keyInfo.accidentalsCount === 0 ? 'No sharps or flats' : currentQuestion.keyInfo.keySignatureNotes.map(n => n.replace('#', '♯').replace('b', '♭')).join(', ')})
            </p>
          </div>

          {isAnswered && (
            <button
              onClick={nextQuestion}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm transition-all shadow-lg cursor-pointer animate-bounce"
            >
              <span>Next Scale</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* The 4 Choices Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scaleChoices.map((choice) => {
            const isSelected = selectedAnswer === choice.type;
            const isThisCorrect = currentQuestion.scaleType === choice.type;

            let buttonStyle = 'bg-zinc-850 hover:bg-zinc-800 border-zinc-750 text-zinc-200';

            if (isAnswered) {
              if (isThisCorrect) {
                buttonStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50';
              } else if (isSelected) {
                buttonStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/50';
              } else {
                buttonStyle = 'bg-zinc-900/50 border-zinc-800/50 text-zinc-500 opacity-60';
              }
            } else if (isSelected) {
              buttonStyle = 'bg-sky-950 border-sky-500 text-sky-200 ring-2 ring-sky-500/50';
            }

            return (
              <button
                key={choice.type}
                disabled={isAnswered}
                onClick={() => handleSelectChoice(choice.type)}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${buttonStyle}`}
              >
                <div className="mt-0.5">
                  {isAnswered ? (
                    isThisCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-zinc-700" />
                    )
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-zinc-600 flex items-center justify-center text-xs font-mono text-zinc-400">
                      •
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="text-base font-bold text-white flex items-center justify-between">
                    <span>{choice.label}</span>
                    {isAnswered && isThisCorrect && (
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Correct Answer
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">{choice.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Answer Feedback & Pedagogical Explanation */}
        {isAnswered && (
          <div
            className={`p-4 rounded-xl border text-sm transition-all ${
              isCorrect
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-1.5 text-base">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Spot on! That is {currentQuestion.keyInfo.root} {SCALE_TYPE_DETAILS[currentQuestion.scaleType].name}.</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  <span>
                    Incorrect. It was{' '}
                    <strong className="underline">{currentQuestion.keyInfo.root} {SCALE_TYPE_DETAILS[currentQuestion.scaleType].name}</strong>.
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-3">
              {currentQuestion.explanation}
            </p>

            <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200">Scale Formula: </span>
              <span className="font-mono text-sky-300">
                {SCALE_TYPE_DETAILS[currentQuestion.scaleType].formula}
              </span>
            </div>
          </div>
        )}

        {/* Quiz Preferences Drawer / Quick Filters */}
        <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 font-medium text-zinc-300">
              <Settings2 className="w-3.5 h-3.5" />
              Practice Filters:
            </span>

            {/* Key Filter Dropdown */}
            <select
              value={keyFilter}
              onChange={(e) => {
                setKeyFilter(e.target.value as any);
                setTimeout(nextQuestion, 50);
              }}
              className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-200 cursor-pointer"
            >
              <option value="all">All Keys (15 Keys: 0–7 ♯/♭)</option>
              <option value="circle">12 Circle Keys</option>
              <option value="white">Natural / White Keys (C & Am)</option>
              <option value="sharps">Sharp Keys Only (♯)</option>
              <option value="flats">Flat Keys Only (♭)</option>
            </select>

            {/* Clef Choice */}
            <select
              value={clefChoice}
              onChange={(e) => {
                setClefChoice(e.target.value as any);
                setTimeout(nextQuestion, 50);
              }}
              className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-200 cursor-pointer"
            >
              <option value="auto">Auto Clef (Treble & Bass)</option>
              <option value="treble">Treble Clef Only</option>
              <option value="bass">Bass Clef Only</option>
            </select>

            {/* Rhythm Filter */}
            <select
              value={rhythmChoice}
              onChange={(e) => {
                setRhythmChoice(e.target.value as any);
                setTimeout(nextQuestion, 50);
              }}
              className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-200 cursor-pointer"
            >
              <option value="random">Random Rhythms</option>
              {RHYTHM_DEFINITIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="rounded accent-sky-400 cursor-pointer"
            />
            <span>Auto-advance on correct</span>
          </label>
        </div>
      </div>
    </div>
  );
};
