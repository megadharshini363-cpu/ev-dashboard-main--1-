import React from 'react';
import { Gauge, Thermometer, Cpu, Activity, Zap } from 'lucide-react';

interface MotorSectionProps {
  motorRPM: number; // 3200 RPM
  motorTemp: number; // 36°C
  batteryTemp: number; // 28°C
  powerKw: number; // 1.02 kW
  isVehicleOn: boolean;
}

export const MotorSection: React.FC<MotorSectionProps> = ({
  motorRPM,
  motorTemp,
  batteryTemp,
  powerKw,
  isVehicleOn,
}) => {
  // Max RPM for gauge calculation (e.g. 6000 RPM)
  const maxRPM = 6000;
  const rpmPercent = Math.min(100, (motorRPM / maxRPM) * 100);

  // Motor temp state
  const isMotorWarm = motorTemp > 65;
  const isMotorHot = motorTemp > 80;

  return (
    <div
      id="motor-section-card"
      className="relative flex flex-col justify-between bg-slate-950/85 border border-cyan-900/50 hover:border-cyan-500/60 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.8)] glow-cyan transition-all duration-300 overflow-hidden group"
    >
      {/* Corner accent glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-2xl pointer-events-none" />

      {/* Header with Title and Controller Status */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-950/70 border border-blue-500/40 text-blue-300">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-orbitron text-xs sm:text-sm font-bold tracking-wider text-slate-100 flex items-center gap-1.5">
              MOTOR CONTROLLER
            </h2>
            <p className="font-mono-tech text-[10px] text-cyan-400/80">PMSM 3-PHASE DRIVE</p>
          </div>
        </div>

        {/* Controller Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 text-[11px] font-chakra font-semibold glow-green">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="uppercase tracking-wider font-mono-tech">RUNNING</span>
        </div>
      </div>

      {/* Primary Tachometer RPM Gauge */}
      <div className="bg-black/50 p-3 rounded-xl border border-slate-800/80 my-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span className="font-chakra text-xs tracking-wider">MOTOR TACHOMETER</span>
          </div>
          <span className="font-mono-tech text-[11px] text-slate-500">MAX 6000 RPM</span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-orbitron text-2xl sm:text-3xl font-extrabold text-white text-glow-cyan">
              {isVehicleOn ? motorRPM : 0}
            </span>
            <span className="font-orbitron text-xs font-bold text-cyan-400">RPM</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono-tech text-xs text-slate-400">OUTPUT:</span>
            <span className="font-orbitron text-sm font-bold text-cyan-300">
              {isVehicleOn ? powerKw.toFixed(2) : '0.00'} kW
            </span>
          </div>
        </div>

        {/* RPM Dynamic Segmented Bar Gauge */}
        <div className="w-full bg-slate-900 h-2.5 rounded-full mt-2 p-0.5 border border-slate-800 flex items-center gap-1 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${isVehicleOn ? rpmPercent : 0}%` }}
          />
        </div>
      </div>

      {/* Grid of Key Thermal Parameters: Motor Temp & Battery Temp */}
      <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-800/80">
        {/* Motor Temperature */}
        <div className="bg-black/60 p-2.5 rounded-xl border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-chakra text-[10px] tracking-wide">MOTOR TEMP</span>
            <Thermometer
              className={`w-3.5 h-3.5 ${
                isMotorHot ? 'text-red-400' : isMotorWarm ? 'text-amber-400' : 'text-cyan-400'
              }`}
            />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`font-orbitron text-base sm:text-lg font-bold ${
                isMotorHot ? 'text-red-400' : isMotorWarm ? 'text-amber-400' : 'text-white'
              }`}
            >
              {motorTemp}
            </span>
            <span className="font-mono-tech text-[10px] text-cyan-400">°C</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono-tech text-[9px] text-emerald-400">Normal Range</span>
          </div>
        </div>

        {/* Battery Temperature */}
        <div className="bg-black/60 p-2.5 rounded-xl border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-chakra text-[10px] tracking-wide">BATTERY TEMP</span>
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-orbitron text-base sm:text-lg font-bold text-white">
              {batteryTemp}
            </span>
            <span className="font-mono-tech text-[10px] text-cyan-400">°C</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono-tech text-[9px] text-emerald-400">Optimal Pack</span>
          </div>
        </div>
      </div>
    </div>
  );
};
