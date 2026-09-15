import React, { useState } from 'react';
import {
  Play,
  Pause,
  Sliders,
  Maximize2,
  Minimize2,
  Radio,
  ChevronLeft,
  ChevronRight,
  Sun,
  AlertTriangle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { DriveMode } from '../types';

interface ClusterControlsProps {
  speed: number;
  throttleInput: number;
  onThrottleChange: (val: number) => void;
  isBraking: boolean;
  onBrakeChange: (braking: boolean) => void;
  isSimulating: boolean;
  onToggleSimulating: () => void;
  onResetDefaults: () => void;
  driveMode: DriveMode;
  onSelectMode: (mode: DriveMode) => void;
  onCycleHeadlights: () => void;
  onToggleHazard: () => void;
  isHazardOn: boolean;
}

export const ClusterControls: React.FC<ClusterControlsProps> = ({
  speed,
  throttleInput,
  onThrottleChange,
  isBraking,
  onBrakeChange,
  isSimulating,
  onToggleSimulating,
  onResetDefaults,
  driveMode,
  onSelectMode,
  onCycleHeadlights,
  onToggleHazard,
  isHazardOn,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <footer className="w-full bg-slate-950/90 border-t border-cyan-950/80 backdrop-blur-xl px-4 py-2.5 z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* LEFT: Handlebar Throttle & Regen Brake Simulators */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Simulation Status Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/60 border border-slate-800">
            <Radio
              className={`w-3.5 h-3.5 ${
                isSimulating ? 'text-cyan-400 animate-pulse' : 'text-slate-600'
              }`}
            />
            <span className="font-mono-tech text-[11px] text-slate-300">
              CAN-BUS: <strong className="text-cyan-300">{isSimulating ? 'STREAMING (50Hz)' : 'PAUSED'}</strong>
            </span>
            <button
              onClick={onToggleSimulating}
              id="btn-toggle-sim"
              title="Pause/Resume live BMS telemetry jitter"
              className="text-[10px] text-cyan-400 hover:text-cyan-300 underline ml-1 cursor-pointer"
            >
              {isSimulating ? 'Pause' : 'Stream'}
            </button>
          </div>

          {/* Interactive Accelerator / Throttle Slider */}
          <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-lg border border-slate-800 flex-1 sm:flex-initial">
            <span className="font-chakra text-[11px] text-slate-400 whitespace-nowrap">THROTTLE:</span>
            <input
              id="slider-throttle"
              type="range"
              min="0"
              max="95"
              value={throttleInput}
              onChange={(e) => onThrottleChange(Number(e.target.value))}
              className="w-24 sm:w-32 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <span className="font-orbitron font-bold text-cyan-300 w-12 text-right">
              {throttleInput} <span className="text-[9px] text-slate-500 font-normal">km/h</span>
            </span>
          </div>

          {/* Regen Brake Button (Press & Hold or Click) */}
          <button
            id="btn-regen-brake"
            onMouseDown={() => onBrakeChange(true)}
            onMouseUp={() => onBrakeChange(false)}
            onTouchStart={() => onBrakeChange(true)}
            onTouchEnd={() => onBrakeChange(false)}
            className={`px-3 py-1.5 rounded-lg border font-orbitron text-xs font-bold transition-all cursor-pointer ${
              isBraking
                ? 'bg-emerald-600 border-emerald-400 text-black glow-green scale-95'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isBraking ? 'REGEN BRAKING ACTIVE' : 'HOLD TO REGEN BRAKE'}
          </button>
        </div>

        {/* RIGHT: Quick Presets & Cluster View Utilities */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Reset to User Specified Baseline (45 km/h, 92% SOC, 81.4V, -12.5A) */}
          <button
            id="btn-reset-baseline"
            onClick={onResetDefaults}
            title="Reset display to exact prompt specification baseline (45 km/h, 92% SOC, 81.4V)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-800/80 transition-colors cursor-pointer text-[11px] font-mono-tech"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET 45 KM/H</span>
          </button>

          {/* Hazard Lights Quick Switch */}
          <button
            id="btn-hazard-quick"
            onClick={onToggleHazard}
            title="Hazard Warning Lights"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-mono-tech transition-colors cursor-pointer ${
              isHazardOn
                ? 'bg-amber-950/80 border-amber-400 text-amber-300 glow-amber animate-pulse'
                : 'bg-black/60 border-slate-800 text-slate-500 hover:text-amber-400'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>HAZARD</span>
          </button>

          {/* Display Cluster Fullscreen Toggle */}
          <button
            id="btn-toggle-fullscreen"
            onClick={toggleFullscreen}
            title="Toggle Dashboard Fullscreen"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px] font-mono-tech"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3 h-3" />
                <span className="hidden sm:inline">WINDOWED</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3" />
                <span className="hidden sm:inline">FULLSCREEN</span>
              </>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
};
