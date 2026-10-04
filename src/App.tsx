/**
 * App.tsx
 * ScaleMaster: Interactive Music Theory & Scale Notation Trainer
 */

import React, { useState } from 'react';
import {
  Music2,
  GraduationCap,
  Compass,
  BookOpen,
  Volume2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { ScaleQuiz } from './components/ScaleQuiz';
import { ScaleExplorer } from './components/ScaleExplorer';

type AppTab = 'quiz' | 'explorer' | 'guide';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('quiz');
  const [showTheoryGuideModal, setShowTheoryGuideModal] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-zinc-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-zinc-950">
              <Music2 className="w-5 h-5 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  ScaleMaster
                </h1>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Theory Studio
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-zinc-400">
                Scale Notation, Melodic Restorations & Circle of Fifths
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-sky-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Practice Drill</span>
            </button>

            <button
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'explorer'
                  ? 'bg-sky-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explorer</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-sky-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Theory Guide</span>
            </button>
          </nav>

          {/* Right Action: Help Modal */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTheoryGuideModal(true)}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
              title="Quick music theory rules"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'quiz' && <ScaleQuiz />}

        {activeTab === 'explorer' && <ScaleExplorer />}

        {activeTab === 'guide' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Guide Header */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-sky-400" />
                <h2 className="text-xl font-bold text-white">Music Theory Guide: The 4 Core Scales</h2>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Mastering scale identification starts with recognizing key signatures, altered accidentals, and the unique voice leading of minor scales.
              </p>
            </div>

            {/* Scale Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Major */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">1. Major Scale</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    W-W-H-W-W-W-H
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The standard diatonic scale. Notes correspond exactly to the key signature. Natural 3rd, 6th, and 7th degrees.
                </p>
                <div className="pt-2 text-xs font-mono text-zinc-300 bg-zinc-950/60 p-2.5 rounded border border-zinc-850">
                  Formula: 1 - 2 - 3 - 4 - 5 - 6 - 7 - 8
                </div>
              </div>

              {/* Natural Minor */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">2. Natural Minor (Aeolian)</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                    W-H-W-W-H-W-W
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Shares the key signature of its relative major. Features lowered ♭3, ♭6, and ♭7. Has a whole-step subtonic rather than a leading tone.
                </p>
                <div className="pt-2 text-xs font-mono text-zinc-300 bg-zinc-950/60 p-2.5 rounded border border-zinc-850">
                  Formula: 1 - 2 - ♭3 - 4 - 5 - ♭6 - ♭7 - 8
                </div>
              </div>

              {/* Harmonic Minor */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">3. Harmonic Minor</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
                    Raised 7th (Both ways)
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Raises the 7th degree by a half step both ascending AND descending. This creates an exotic augmented 2nd interval between ♭6 and 7.
                </p>
                <div className="pt-2 text-xs font-mono text-zinc-300 bg-zinc-950/60 p-2.5 rounded border border-zinc-850">
                  Formula: 1 - 2 - ♭3 - 4 - 5 - ♭6 - 7 - 8
                </div>
              </div>

              {/* Melodic Minor */}
              <div className="bg-zinc-900/50 border border-purple-500/30 bg-purple-950/10 rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-purple-200 text-base">4. Melodic Minor</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    Dynamic Direction
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Ascending: Raises the 6th and 7th degrees for smooth melodic pull.
                  <br />
                  Descending: Restores the lowered ♭7 and ♭6 degrees (natural minor).
                </p>
                <div className="pt-2 text-xs font-mono text-purple-300 bg-zinc-950/60 p-2.5 rounded border border-zinc-850">
                  Up: 1-2-♭3-4-5-6-7-8 | Down: 8-♭7-♭6-5-4-♭3-2-1
                </div>
              </div>
            </div>

            {/* How to Read the Circle of Fifths */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-3">
              <h3 className="text-base font-bold text-white">How the Circle of Fifths Works</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                The Circle of Fifths arranges keys by pitch distance:
              </p>
              <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside">
                <li>
                  <strong className="text-zinc-200">Moving Clockwise:</strong> Each step adds 1 Sharp (♯) to the key signature (C ➔ G ➔ D ➔ A ➔ E ➔ B ➔ F♯/C♯).
                </li>
                <li>
                  <strong className="text-zinc-200">Moving Counter-Clockwise:</strong> Each step adds 1 Flat (♭) to the key signature (C ➔ F ➔ B♭ ➔ E♭ ➔ A♭ ➔ D♭ ➔ G♭).
                </li>
                <li>
                  <strong className="text-zinc-200">Relative Minors:</strong> Displayed on the inner circle (e.g. A minor shares 0 accidentals with C major; E minor shares 1 sharp with G major).
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Quick Theory Help Modal */}
      {showTheoryGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Scale Recognition Cheat Sheet</h3>
              </div>
              <button
                onClick={() => setShowTheoryGuideModal(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1">
                <strong className="text-emerald-400 block font-semibold">Major Scale</strong>
                <p className="text-zinc-400">All notes follow key signature. 3rd, 6th, and 7th are major intervals.</p>
              </div>

              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1">
                <strong className="text-blue-400 block font-semibold">Natural Minor</strong>
                <p className="text-zinc-400">Identical ascending and descending with lowered ♭3, ♭6, ♭7.</p>
              </div>

              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1">
                <strong className="text-amber-400 block font-semibold">Harmonic Minor</strong>
                <p className="text-zinc-400">Look for an accidental raising the 7th degree in BOTH ascending and descending passages.</p>
              </div>

              <div className="p-3 bg-zinc-950 rounded-lg border border-purple-500/30 space-y-1 bg-purple-950/20">
                <strong className="text-purple-300 block font-semibold">Melodic Minor (Crucial)</strong>
                <p className="text-zinc-300">
                  Ascending raises 6th & 7th degrees. Descending restores the lowered ♭7 and ♭6 with natural or flat accidentals!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowTheoryGuideModal(false)}
              className="w-full py-2.5 rounded-lg bg-sky-500 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-sky-400 transition-colors cursor-pointer"
            >
              Got it, back to practice
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-4 text-center text-xs text-zinc-500">
        ScaleMaster • Interactive Music Theory & Ear Training Studio
      </footer>
    </div>
  );
}
