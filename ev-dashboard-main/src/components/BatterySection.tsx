import React from 'react';
import { ChargingStatus } from '../types';
import { Battery, Zap, Compass, Activity, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface BatterySectionProps {
  soc: number; // 92%
  energy: number; // 26.4 kWh
  totalVoltage: number; // 81.4 V
  current: number; // -12.5 A
  chargingStatus: ChargingStatus; // Discharging
  remainingRange: number; // 118 km
  isVehicleOn: boolean;
}

export const BatterySection: React.FC<BatterySectionProps> = ({
  soc,
  energy,
  totalVoltage,
  current,
  chargingStatus,
  remainingRange,
  isVehicleOn,
}) => {
  // Determine color theme based on SOC and status
  const isCharging = chargingStatus === 'Charging';
  const isRegen = chargingStatus === 'Regenerating';

  // SVG circular mini SOC gauge
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (soc / 100) * circumference;

  return (
    <div
      id="battery-section-card"
      className="relative flex flex-col justify-between bg-slate-950/85 border border-cyan-900/50 hover:border-cyan-500/60 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.8)] glow-cyan transition-all duration-300 overflow-hidden group"
    >
      {/* Subtle corner accent lights */}
      <div className="absolute -top-10 -left-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-2xl pointer-events-none" />

      {/* Header with Title and Charging Status Badge */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-300">
            <Battery className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-orbitron text-xs sm:text-sm font-bold tracking-wider text-slate-100 flex items-center gap-1.5">
              BATTERY SYSTEM
            </h2>
            <p className="font-mono-tech text-[10px] text-cyan-400/80">HIGH-VOLTAGE BMS</p>
          </div>
        </div>

        {/* Charging Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-chakra font-semibold ${
            isCharging
              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 glow-green'
              : isRegen
              ? 'bg-teal-950/80 border-teal-400 text-teal-300 glow-cyan'
              : 'bg-slate-900/80 border-cyan-800/50 text-cyan-300'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isCharging
                ? 'bg-emerald-400 animate-ping'
                : isRegen
                ? 'bg-teal-400 animate-pulse'
                : 'bg-cyan-400'
            }`}
          />
          <span className="uppercase tracking-wider font-mono-tech">
            {chargingStatus}
          </span>
        </div>
      </div>

      {/* Primary Row: Circular SOC Gauge + Remaining Range Big Display */}
      <div className="grid grid-cols-2 gap-3 my-3.5 items-center">
        {/* SOC Circular Gauge */}
        <div className="flex items-center gap-3 bg-black/50 p-2.5 rounded-xl border border-slate-800/80">
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-cyan-400 transition-all duration-500"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-orbitron font-extrabold text-base sm:text-lg text-white text-glow-cyan">
                {soc}%
              </span>
              <span className="font-mono-tech text-[8px] text-cyan-400 uppercase">SOC</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-chakra text-xs text-slate-400">STATE OF CHARGE</span>
            <span className="font-orbitron text-xs font-bold text-emerald-400">HEALTHY</span>
            <span className="font-mono-tech text-[10px] text-slate-500">20S Li-ion</span>
          </div>
        </div>

        {/* Remaining Range Display */}
        <div className="flex flex-col justify-center bg-black/50 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-0.5">
            <span className="font-chakra text-xs tracking-wider">RANGE</span>
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-orbitron text-2xl sm:text-3xl font-extrabold text-white text-glow-cyan">
              {remainingRange}
            </span>
            <span className="font-orbitron text-xs font-bold text-cyan-400">KM</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (remainingRange / 130) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Key Telemetry Parameters: Energy, Voltage, Current */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80">
        {/* Battery Energy */}
        <div className="bg-black/60 p-2 sm:p-2.5 rounded-xl border border-slate-800/90 flex flex-col">
          <span className="font-chakra text-[10px] text-slate-400 tracking-wide">
            ENERGY
          </span>
          <div className="flex items-baseline gap-0.5 mt-0.5">
            <span className="font-orbitron text-sm sm:text-base font-bold text-white">
              {energy.toFixed(1)}
            </span>
            <span className="font-mono-tech text-[9px] text-cyan-400">kWh</span>
          </div>
          <span className="font-mono-tech text-[9px] text-slate-500 mt-0.5">Total Cap</span>
        </div>

        {/* Total Voltage */}
        <div className="bg-black/60 p-2 sm:p-2.5 rounded-xl border border-slate-800/90 flex flex-col">
          <span className="font-chakra text-[10px] text-slate-400 tracking-wide">
            VOLTAGE
          </span>
          <div className="flex items-baseline gap-0.5 mt-0.5">
            <span className="font-orbitron text-sm sm:text-base font-bold text-white">
              {totalVoltage.toFixed(1)}
            </span>
            <span className="font-mono-tech text-[9px] text-cyan-400">V</span>
          </div>
          <span className="font-mono-tech text-[9px] text-emerald-400/90 mt-0.5">Nominal 81.4V</span>
        </div>

        {/* Current */}
        <div className="bg-black/60 p-2 sm:p-2.5 rounded-xl border border-slate-800/90 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="font-chakra text-[10px] text-slate-400 tracking-wide">
              CURRENT
            </span>
            {current < 0 ? (
              <ArrowDownRight className="w-3 h-3 text-cyan-400" />
            ) : (
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            )}
          </div>
          <div className="flex items-baseline gap-0.5 mt-0.5">
            <span
              className={`font-orbitron text-sm sm:text-base font-bold ${
                current < 0 ? 'text-cyan-300' : 'text-emerald-400'
              }`}
            >
              {current.toFixed(1)}
            </span>
            <span className="font-mono-tech text-[9px] text-cyan-400">A</span>
          </div>
          <span className="font-mono-tech text-[9px] text-slate-500 mt-0.5">
            {current < 0 ? 'Draw' : 'Regen'}
          </span>
        </div>
      </div>
    </div>
  );
};
