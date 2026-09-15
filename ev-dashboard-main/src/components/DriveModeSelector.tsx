import React from 'react';
import { DriveMode } from '../types';
import { Leaf, Compass, Flame, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface DriveModeSelectorProps {
  currentMode: DriveMode;
  onSelectMode: (mode: DriveMode) => void;
}

export const DriveModeSelector: React.FC<DriveModeSelectorProps> = ({
  currentMode,
  onSelectMode,
}) => {
  const modes: {
    id: DriveMode;
    label: string;
    sub: string;
    desc: string;
    icon: React.ReactNode;
    activeBorder: string;
    activeBg: string;
    activeText: string;
    glowClass: string;
    badgeColor: string;
  }[] = [
    {
      id: 'ECO',
      label: 'ECO',
      sub: 'RANGE MAX',
      desc: 'Regen Priority • Smooth Acceleration',
      icon: <Leaf className="w-4 h-4" />,
      activeBorder: 'border-emerald-400',
      activeBg: 'bg-emerald-950/70',
      activeText: 'text-emerald-300',
      glowClass: 'glow-green shadow-[0_0_25px_rgba(16,185,129,0.35)]',
      badgeColor: 'bg-emerald-500 text-black',
    },
    {
      id: 'NORMAL',
      label: 'NORMAL',
      sub: 'BALANCED',
      desc: 'Daily City Commuting • Linear Output',
      icon: <Compass className="w-4 h-4" />,
      activeBorder: 'border-cyan-400',
      activeBg: 'bg-cyan-950/70',
      activeText: 'text-cyan-300',
      glowClass: 'glow-cyan shadow-[0_0_25px_rgba(6,182,212,0.35)]',
      badgeColor: 'bg-cyan-400 text-black',
    },
    {
      id: 'SPORT',
      label: 'SPORT',
      sub: 'MAX PERFORMANCE',
      desc: '100% Instant Torque • Dynamic Agility',
      icon: <Flame className="w-4 h-4" />,
      activeBorder: 'border-cyan-300 ring-1 ring-cyan-400',
      activeBg: 'bg-gradient-to-br from-cyan-950/90 via-slate-950 to-blue-950/80',
      activeText: 'text-cyan-200',
      glowClass: 'glow-cyan shadow-[0_0_30px_rgba(6,182,212,0.45)]',
      badgeColor: 'bg-cyan-300 text-black',
    },
  ];

  return (
    <div
      id="drive-mode-section"
      className="relative flex flex-col justify-between bg-slate-950/85 border border-cyan-900/50 rounded-2xl p-3.5 sm:p-4 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.8)] glow-cyan transition-all duration-300"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="font-orbitron text-xs sm:text-sm font-bold tracking-wider text-slate-200">
            DRIVE MODE SELECTOR
          </h3>
        </div>
        <span className="font-mono-tech text-[10px] text-cyan-400/80">THROTTLE MAPPING</span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              id={`btn-mode-${mode.id.toLowerCase()}`}
              onClick={() => onSelectMode(mode.id)}
              className={`relative flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left ${
                isActive
                  ? `${mode.activeBorder} ${mode.activeBg} ${mode.glowClass}`
                  : 'bg-black/60 border-slate-800/90 text-slate-500 hover:border-slate-700 hover:text-slate-400'
              }`}
            >
              {/* Active Indicator Top Tag */}
              {isActive && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full bg-cyan-400 text-black font-orbitron font-extrabold text-[8px] tracking-wider shadow-sm uppercase">
                  ACTIVE
                </div>
              )}

              <div className="flex items-center justify-between w-full mb-1">
                <div
                  className={`p-1 rounded-lg ${
                    isActive ? 'bg-black/40 text-cyan-300' : 'text-slate-600'
                  }`}
                >
                  {mode.icon}
                </div>
                {isActive && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                )}
              </div>

              <div className="flex flex-col items-center text-center my-0.5">
                <span
                  className={`font-orbitron font-bold text-sm sm:text-base tracking-wider ${
                    isActive ? mode.activeText : 'text-slate-400'
                  }`}
                >
                  {mode.label}
                </span>
                <span className="font-mono-tech text-[9px] text-slate-500 uppercase tracking-tight">
                  {mode.sub}
                </span>
              </div>

              <div className="w-full text-center mt-1 pt-1 border-t border-slate-800/60 hidden sm:block">
                <span className="font-chakra text-[9px] text-slate-500 line-clamp-1">
                  {mode.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
