/**
 * CircleOfFifths.tsx
 * An exquisite, interactive Circle of Fifths visualizer:
 * - 12 Segments for Major & Relative Minor keys
 * - Direct visual tie to the notated key signature and accidental count
 * - Glowing aura and indicators for the active scale's root & mode
 * - Clickable sectors to explore or test any key
 */

import React from 'react';
import { KeyInfo } from '../types/music';
import { ALL_MINOR_KEYS, CIRCLE_OF_FIFTHS_DATA } from '../lib/musicTheory';

interface CircleOfFifthsProps {
  activeKey: KeyInfo;
  onSelectKey?: (key: KeyInfo) => void;
  scaleType?: string;
  className?: string;
}

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({
  activeKey,
  onSelectKey,
  scaleType,
  className = '',
}) => {
  const size = 380;
  const center = size / 2;
  const outerRadius = 175;
  const middleRadius = 125;
  const innerRadius = 78;
  const hubRadius = 56;

  // 12 positions: 0 is top (-90 degrees)
  const getAngleForIndex = (index: number) => {
    return (index * 30 - 90) * (Math.PI / 180);
  };

  // Helper to make an SVG arc path segment
  const makeArcPath = (
    rInner: number,
    rOuter: number,
    startAngle: number,
    endAngle: number
  ) => {
    const x1 = center + rOuter * Math.cos(startAngle);
    const y1 = center + rOuter * Math.sin(startAngle);
    const x2 = center + rOuter * Math.cos(endAngle);
    const y2 = center + rOuter * Math.sin(endAngle);

    const x3 = center + rInner * Math.cos(endAngle);
    const y3 = center + rInner * Math.sin(endAngle);
    const x4 = center + rInner * Math.cos(startAngle);
    const y4 = center + rInner * Math.sin(startAngle);

    return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 0 0 ${x4} ${y4} Z`;
  };

  // Check if position matches active key
  const isSectorActive = (item: KeyInfo) => {
    return item.circlePosition === activeKey.circlePosition;
  };

  const isMajorActive = activeKey.mode === 'major';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible drop-shadow-2xl"
        >
          <defs>
            <filter id="circle-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="hubGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#09090b" />
            </radialGradient>
            <linearGradient id="activeMajorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="activeMinorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
          </defs>

          {/* Background Outer Ring Track */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="#121215"
            stroke="#27272a"
            strokeWidth="1.5"
          />

          {/* 12 Sectors */}
          {CIRCLE_OF_FIFTHS_DATA.map((item, idx) => {
            const angleStep = (30 * Math.PI) / 180;
            const midAngle = getAngleForIndex(idx);
            const startAngle = midAngle - angleStep / 2 + 0.015;
            const endAngle = midAngle + angleStep / 2 - 0.015;

            const isThisSector = isSectorActive(item);
            const isThisMajor = isThisSector && isMajorActive;
            const isThisMinor = isThisSector && !isMajorActive;

            // Coordinates for text labels
            const outerTextR = (outerRadius + middleRadius) / 2;
            const innerTextR = (middleRadius + innerRadius) / 2;
            const badgeR = outerRadius + 14;

            const majorX = center + outerTextR * Math.cos(midAngle);
            const majorY = center + outerTextR * Math.sin(midAngle);

            const minorX = center + innerTextR * Math.cos(midAngle);
            const minorY = center + innerTextR * Math.sin(midAngle);

            const badgeX = center + badgeR * Math.cos(midAngle);
            const badgeY = center + badgeR * Math.sin(midAngle);

            // Minor key name formatting
            const minorName = item.relativeKey.replace(' Minor', 'm');

            // Key signature badge string
            let sigString = '♮';
            if (item.accidentalsCount > 0) sigString = `${item.accidentalsCount}♯`;
            else if (item.accidentalsCount < 0) sigString = `${Math.abs(item.accidentalsCount)}♭`;

            // Corresponding Minor KeyInfo for inner arc
            const minorKeyInfo = ALL_MINOR_KEYS.find(k => k.name === item.relativeKey) || {
              id: item.relativeKey.replace(' Minor', 'm'),
              root: item.relativeKey.replace(' Minor', ''),
              rootLetter: (item.relativeKey[0] as any),
              mode: 'minor' as const,
              name: item.relativeKey,
              accidentalsCount: item.accidentalsCount,
              accidentalType: item.accidentalType,
              keySignatureNotes: item.keySignatureNotes,
              relativeKey: item.name,
              parallelKey: item.parallelKey,
              circlePosition: item.circlePosition,
              trebleBaseOctave: 4,
              bassBaseOctave: 2,
            };

            return (
              <g
                key={`circle-segment-${item.id}`}
                className="transition-all duration-200 group"
              >
                {/* Outer Arc (Major Key) */}
                <path
                  d={makeArcPath(middleRadius + 1, outerRadius, startAngle, endAngle)}
                  fill={isThisMajor ? 'url(#activeMajorGrad)' : isThisSector ? '#1e293b' : '#18181b'}
                  stroke={isThisMajor ? '#38bdf8' : '#27272a'}
                  strokeWidth={isThisMajor ? '2' : '1'}
                  className="cursor-pointer transition-colors hover:fill-sky-950/60"
                  filter={isThisMajor ? 'url(#circle-glow)' : undefined}
                  onClick={() => onSelectKey && onSelectKey(item)}
                />

                {/* Inner Arc (Minor Key) */}
                <path
                  d={makeArcPath(innerRadius, middleRadius - 1, startAngle, endAngle)}
                  fill={isThisMinor ? 'url(#activeMinorGrad)' : isThisSector ? '#2e1065' : '#131316'}
                  stroke={isThisMinor ? '#c084fc' : '#27272a'}
                  strokeWidth={isThisMinor ? '2' : '1'}
                  className="cursor-pointer transition-colors hover:fill-purple-950/60"
                  filter={isThisMinor ? 'url(#circle-glow)' : undefined}
                  onClick={() => onSelectKey && onSelectKey(minorKeyInfo)}
                />

                {/* Major Key Label */}
                <text
                  x={majorX}
                  y={majorY + 5}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="bold"
                  fill={isThisMajor ? '#ffffff' : '#f4f4f5'}
                  className="pointer-events-none tracking-wide"
                >
                  {item.root}
                </text>

                {/* Minor Key Label */}
                <text
                  x={minorX}
                  y={minorY + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="semibold"
                  fill={isThisMinor ? '#ffffff' : '#a1a1aa'}
                  className="pointer-events-none"
                >
                  {minorName}
                </text>

                {/* Key Signature Accidentals Count Badge around Perimeter */}
                <text
                  x={badgeX}
                  y={badgeY + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={isThisSector ? '#38bdf8' : '#71717a'}
                  className="pointer-events-none font-mono"
                >
                  {sigString}
                </text>
              </g>
            );
          })}

          {/* Central Hub Area */}
          <circle
            cx={center}
            cy={center}
            r={hubRadius}
            fill="url(#hubGradient)"
            stroke={isMajorActive ? '#0284c7' : '#9333ea'}
            strokeWidth="2"
          />

          {/* Center Info Text */}
          <g className="pointer-events-none select-none">
            <text
              x={center}
              y={center - 22}
              textAnchor="middle"
              fontSize="9"
              letterSpacing="0.1em"
              fill="#a1a1aa"
              fontWeight="semibold"
              className="uppercase"
            >
              Current Key
            </text>
            <text
              x={center}
              y={center}
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
              fill={isMajorActive ? '#38bdf8' : '#c084fc'}
            >
              {activeKey.name}
            </text>
            <text
              x={center}
              y={center + 18}
              textAnchor="middle"
              fontSize="10"
              fontWeight="medium"
              fill="#cbd5e1"
            >
              {activeKey.accidentalsCount === 0
                ? 'No sharps/flats'
                : activeKey.accidentalsCount > 0
                ? `${activeKey.accidentalsCount} sharp${activeKey.accidentalsCount > 1 ? 's' : ''}`
                : `${Math.abs(activeKey.accidentalsCount)} flat${Math.abs(activeKey.accidentalsCount) > 1 ? 's' : ''}`}
            </text>
            {activeKey.keySignatureNotes.length > 0 && (
              <text
                x={center}
                y={center + 33}
                textAnchor="middle"
                fontSize="9"
                fill="#94a3b8"
                fontFamily="sans-serif"
              >
                ({activeKey.keySignatureNotes.map(n => n.replace('#', '♯').replace('b', '♭')).join(' ')})
              </text>
            )}
          </g>
        </svg>
      </div>

      {/* Circle of Fifths Footer Legend */}
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-sky-500/20 border border-sky-400"></span>
          Outer Ring: Major
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-purple-500/20 border border-purple-400"></span>
          Inner Ring: Minor
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
          Perimeter: Key Sig (♯/♭)
        </span>
      </div>
    </div>
  );
};
