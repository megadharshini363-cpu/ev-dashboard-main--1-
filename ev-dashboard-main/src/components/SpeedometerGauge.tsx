import React from 'react';
import { DriveMode } from '../types';
import { SCOOTER_IMAGE_SRC } from '../constants';
import { motion } from 'motion/react';
import { Zap, Gauge, Sparkles } from 'lucide-react';

interface SpeedometerGaugeProps {
  speed: number;
  maxSpeed?: number;
  driveMode: DriveMode;
  motorRPM: number;
  current: number;
  isVehicleOn: boolean;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  speed,
  maxSpeed = 100,
  driveMode,
  motorRPM,
  current,
  isVehicleOn,
}) => {
  // SVG Arc calculations
  // Gauge sweeps from 140 degrees (bottom-left) to 400 degrees (bottom-right), total 260 degrees
  const radius = 175;
  const cx = 210;
  const cy = 210;
  const strokeWidth = 14;

  const startAngle = 140;
  const totalSweep = 260;
  const clampedSpeed = Math.max(0, Math.min(maxSpeed, speed));
  const speedRatio = isVehicleOn ? clampedSpeed / maxSpeed : 0;
  const currentAngle = startAngle + speedRatio * totalSweep;

  // Convert polar coordinates to Cartesian
  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, r, endA);
    const end = polarToCartesian(x, y, r, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  // Background track path
  const bgArcPath = describeArc(cx, cy, radius, startAngle, startAngle + totalSweep);
  // Active speed arc path
  const activeArcPath =
    speedRatio > 0.005
      ? describeArc(cx, cy, radius, startAngle, Math.min(startAngle + totalSweep, currentAngle))
      : '';

  // Tick marks every 10 km/h
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const tickSpeed = i * 10;
    const tickAngle = startAngle + (i / 10) * totalSweep;
    const pInner = polarToCartesian(cx, cy, radius - 18, tickAngle);
    const pOuter = polarToCartesian(cx, cy, radius - 6, tickAngle);
    const pText = polarToCartesian(cx, cy, radius - 32, tickAngle);
    const isMajor = i % 2 === 0;
    return {
      tickSpeed,
      pInner,
      pOuter,
      pText,
      isMajor,
    };
  });

  // Mode accent colors
  const modeColors = {
    ECO: {
      gradientStart: '#10b981',
      gradientEnd: '#06b6d4',
      glow: 'shadow-[0_0_40px_rgba(16,185,129,0.3)]',
      borderGlow: 'border-emerald-500/40',
      textGlow: 'text-glow-green',
      accentText: 'text-emerald-400',
    },
    NORMAL: {
      gradientStart: '#06b6d4',
      gradientEnd: '#3b82f6',
      glow: 'shadow-[0_0_40px_rgba(6,182,212,0.35)]',
      borderGlow: 'border-cyan-500/40',
      textGlow: 'text-glow-cyan',
      accentText: 'text-cyan-400',
    },
    SPORT: {
      gradientStart: '#06b6d4',
      gradientEnd: '#8b5cf6',
      glow: 'shadow-[0_0_45px_rgba(6,182,212,0.4)]',
      borderGlow: 'border-cyan-400/50',
      textGlow: 'text-glow-cyan',
      accentText: 'text-cyan-300',
    },
  }[driveMode];

  // Current power status (-12.5A discharging, positive for regen)
  const isRegen = current > 0.5;

  return (
    <div className="relative flex flex-col items-center justify-center p-2">
      {/* Outer Dial Container with futuristic bevel and ambient backlight */}
      <div
        className={`relative w-[340px] sm:w-[410px] md:w-[450px] aspect-square rounded-full flex items-center justify-center bg-radial from-slate-950/90 via-black to-slate-950/95 border-2 ${modeColors.borderGlow} ${modeColors.glow} backdrop-blur-xl transition-all duration-500`}
      >
        {/* Subtle decorative concentric rings */}
        <div className="absolute inset-4 rounded-full border border-cyan-900/30 pointer-events-none" />
        <div className="absolute inset-10 rounded-full border border-cyan-500/10 border-dashed pointer-events-none animate-[spin_120s_linear_infinite]" />
        <div className="absolute inset-16 rounded-full border border-slate-800/40 pointer-events-none" />

        {/* SVG Circular Speedometer Dial */}
        <svg
          viewBox="0 0 420 420"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          <defs>
            {/* Speed Gradient */}
            <linearGradient id="speedArcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={modeColors.gradientStart} />
              <stop offset="100%" stopColor={modeColors.gradientEnd} />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d={bgArcPath}
            fill="none"
            stroke="#111827"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Subtle track inner border */}
          <path
            d={bgArcPath}
            fill="none"
            stroke="#1f2937"
            strokeWidth={2}
            strokeDasharray="3 4"
            className="opacity-50"
          />

          {/* Active Speed Arc with Glow */}
          {activeArcPath && isVehicleOn && (
            <path
              d={activeArcPath}
              fill="none"
              stroke="url(#speedArcGrad)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              filter="url(#arcGlow)"
              className="transition-all duration-150"
            />
          )}

          {/* Speedometer Tick Marks and Numbers */}
          {ticks.map(({ tickSpeed, pInner, pOuter, pText, isMajor }) => {
            const isPassed = isVehicleOn && tickSpeed <= clampedSpeed;
            return (
              <g key={tickSpeed}>
                <line
                  x1={pInner.x}
                  y1={pInner.y}
                  x2={pOuter.x}
                  y2={pOuter.y}
                  stroke={isPassed ? '#38bdf8' : '#334155'}
                  strokeWidth={isMajor ? 2.5 : 1.2}
                  className="transition-colors duration-150"
                />
                {isMajor && (
                  <text
                    x={pText.x}
                    y={pText.y + 4}
                    fill={isPassed ? '#e2e8f0' : '#475569'}
                    fontSize="11"
                    fontFamily="Share Tech Mono, monospace"
                    textAnchor="middle"
                    className="font-semibold transition-colors duration-150 select-none"
                  >
                    {tickSpeed}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* CENTER CONTENT: Realistic Electric Scooter Image & Speedometer Readout */}
        <div className="relative z-20 flex flex-col items-center justify-center w-full h-full px-6 pt-4 pb-2">
          {/* Top of Center: Drive Status & Ready Indicator */}
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/50 text-[10px] font-mono-tech tracking-wider text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              DRIVE MODE: {driveMode}
            </span>
          </div>

          {/* MAIN SPEED NUMBER READOUT */}
          <div className="flex flex-col items-center justify-center my-0.5">
            <div className="relative flex items-baseline justify-center">
              <motion.span
                key={isVehicleOn ? speed : 'off'}
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`font-orbitron font-extrabold text-6xl sm:text-7xl md:text-8xl tracking-tight text-white ${modeColors.textGlow}`}
              >
                {isVehicleOn ? speed : '0'}
              </motion.span>
              <div className="flex flex-col ml-2 text-left">
                <span className="font-orbitron text-xs sm:text-sm font-bold text-cyan-400 tracking-widest">
                  KM/H
                </span>
                <span className="font-mono-tech text-[10px] text-slate-400">
                  SPEED
                </span>
              </div>
            </div>
          </div>

          {/* REALISTIC ELECTRIC SCOOTER IMAGE CENTERPIECE */}
          <div className="relative w-48 sm:w-56 md:w-60 h-28 sm:h-32 -mt-1 mb-1 flex items-center justify-center">
            {/* Ambient Sci-Fi Pedestal Glow under scooter */}
            <div className="absolute inset-x-4 bottom-2 h-8 bg-gradient-to-t from-cyan-500/30 via-cyan-400/15 to-transparent blur-md rounded-full pointer-events-none" />
            <div className="absolute -inset-1 bg-radial from-cyan-500/10 to-transparent rounded-full pointer-events-none" />

            {/* Scooter Image with clean blending */}
            <img
              src={SCOOTER_IMAGE_SRC}
              alt="Electric Smart Scooter"
              referrerPolicy="no-referrer"
              className="relative z-10 w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(6,182,212,0.4)] filter contrast-105 brightness-105"
            />

            {/* Sci-Fi Target Reticle HUD lines */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent pointer-events-none" />
          </div>

          {/* BOTTOM OF SPEEDOMETER: RPM, Power Flow, and Status Indicator */}
          <div className="flex items-center justify-between w-4/5 pt-1 border-t border-slate-800/80">
            {/* Motor RPM mini */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <div className="text-left leading-none">
                <div className="font-orbitron text-xs sm:text-sm font-bold text-white tracking-wide">
                  {isVehicleOn ? motorRPM : 0}
                </div>
                <span className="font-mono-tech text-[9px] text-slate-500">RPM</span>
              </div>
            </div>

            {/* Gear / Status indicator */}
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700">
              <span className={`font-orbitron text-xs font-bold ${isRegen ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {isRegen ? 'REGEN' : 'D'}
              </span>
            </div>

            {/* Current draw mini */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <div className="text-right leading-none">
                <div className={`font-orbitron text-xs sm:text-sm font-bold tracking-wide ${current < 0 ? 'text-cyan-300' : 'text-emerald-400'}`}>
                  {isVehicleOn ? current.toFixed(1) : '0.0'}
                </div>
                <span className="font-mono-tech text-[9px] text-slate-500">AMP (A)</span>
              </div>
              <Zap className={`w-3.5 h-3.5 ${current < 0 ? 'text-cyan-400' : 'text-emerald-400'}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
