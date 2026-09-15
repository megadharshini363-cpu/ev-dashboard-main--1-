import React, { useState, useEffect } from 'react';
import { ClusterIndicators } from '../types';
import {
  Power,
  Zap,
  MapPin,
  AlertTriangle,
  BatteryCharging,
  Thermometer,
  ChevronLeft,
  ChevronRight,
  Sun,
  Radio,
} from 'lucide-react';

interface TopStatusBarProps {
  indicators: ClusterIndicators;
  blinkerState: boolean;
  onToggleIndicator: (type: 'turnSignalLeft' | 'turnSignalRight' | 'hazardLights' | 'warningMaster' | 'warningBattery' | 'warningTemp') => void;
  onCycleHeadlights: () => void;
  onToggleVehiclePower: () => void;
  tripA: number;
  odo: number;
  ambientTemp: number;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  indicators,
  blinkerState,
  onToggleIndicator,
  onCycleHeadlights,
  onToggleVehiclePower,
  tripA,
  odo,
  ambientTemp,
}) => {
  const [timeStr, setTimeStr] = useState<string>('12:45:00');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative w-full border-b border-cyan-950/70 bg-black/90 px-4 py-2.5 backdrop-blur-md z-30">
      {/* Top subtle decorative neon hairline */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/80 to-transparent" />

      <div className="flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* LEFT: Left Turn Signal & Vehicle ON Status & Headlight */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Left Blinker */}
          <button
            id="btn-turn-left"
            onClick={() => onToggleIndicator('turnSignalLeft')}
            title="Left Turn Signal (Toggle)"
            aria-label="Left turn signal"
            className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 cursor-pointer ${
              indicators.turnSignalLeft && blinkerState
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 glow-green'
                : 'bg-slate-900/60 border-slate-800 text-slate-600 hover:text-slate-400'
            }`}
          >
            <ChevronLeft className="w-5 h-5 stroke-[3]" />
          </button>

          {/* Vehicle ON Status Badge */}
          <button
            id="btn-vehicle-power"
            onClick={onToggleVehiclePower}
            title="Vehicle System Power (Click to Toggle READY state)"
            className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-300 cursor-pointer ${
              indicators.vehicleOn
                ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300 glow-green'
                : 'bg-red-950/40 border-red-800 text-red-400'
            }`}
          >
            <Power className={`w-3.5 h-3.5 ${indicators.vehicleOn ? 'text-emerald-400 animate-pulse' : 'text-red-500'}`} />
            <span className="font-orbitron text-xs font-bold tracking-wider">
              {indicators.vehicleOn ? 'READY' : 'OFFLINE'}
            </span>
          </button>

          {/* Headlight Indicator */}
          <button
            id="btn-headlight-toggle"
            onClick={onCycleHeadlights}
            title={`Headlight: ${indicators.headlight.toUpperCase()} (Click to cycle)`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-chakra font-semibold transition-all cursor-pointer ${
              indicators.headlight === 'high'
                ? 'bg-blue-950/70 border-blue-400 text-blue-300 glow-blue'
                : indicators.headlight === 'low'
                ? 'bg-cyan-950/50 border-cyan-500/70 text-cyan-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-600 hover:text-slate-400'
            }`}
          >
            <Sun className={`w-3.5 h-3.5 ${indicators.headlight !== 'off' ? 'text-cyan-300' : ''}`} />
            <span className="hidden sm:inline uppercase text-[10px] tracking-wide">
              {indicators.headlight === 'high' ? 'HIGH BEAM' : indicators.headlight === 'low' ? 'LOW BEAM' : 'LIGHTS OFF'}
            </span>
          </button>

          {/* Trip Telemetry mini */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono-tech text-slate-400 pl-2 border-l border-slate-800">
            <span>TRIP <span className="text-cyan-400 font-semibold">{tripA.toFixed(1)} km</span></span>
            <span className="text-slate-700">|</span>
            <span>ODO <span className="text-slate-300">{odo.toFixed(0)} km</span></span>
          </div>
        </div>

        {/* CENTER: Digital Clock & CAN-Bus / Telemetry Stream Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-lg border border-cyan-900/40">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="font-mono-tech text-xs text-cyan-300/90 tracking-widest">{timeStr}</span>
            <span className="text-slate-600 text-xs">|</span>
            <span className="font-chakra text-xs text-slate-400">{ambientTemp}°C</span>
          </div>
        </div>

        {/* RIGHT: Status Warnings, GPS, and Right Turn Signal */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* GPS / Location Indicator */}
          <div
            title={`GPS: ${indicators.gpsConnected ? '3D Lock (14 Satellites)' : 'Searching'}`}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-chakra transition-all ${
              indicators.gpsConnected
                ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900/50 border-slate-800 text-slate-500'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline text-[11px] font-mono-tech">GPS 14 SAT</span>
          </div>

          {/* Battery Warning Indicator */}
          <button
            id="btn-battery-warning"
            onClick={() => onToggleIndicator('warningBattery')}
            title="Battery BMS Health Warning (Click to toggle alert)"
            className={`flex items-center justify-center w-7 h-7 rounded-md border transition-all cursor-pointer ${
              indicators.warningBattery
                ? 'bg-amber-950/80 border-amber-400 text-amber-300 glow-amber animate-pulse'
                : 'bg-slate-950/60 border-slate-800 text-slate-600 hover:text-slate-400'
            }`}
          >
            <BatteryCharging className="w-3.5 h-3.5" />
          </button>

          {/* Temperature Warning Indicator */}
          <button
            id="btn-temp-warning"
            onClick={() => onToggleIndicator('warningTemp')}
            title="Thermal Warning Indicator (Click to toggle alert)"
            className={`flex items-center justify-center w-7 h-7 rounded-md border transition-all cursor-pointer ${
              indicators.warningTemp
                ? 'bg-red-950/80 border-red-500 text-red-400 glow-red animate-pulse'
                : 'bg-slate-950/60 border-slate-800 text-slate-600 hover:text-slate-400'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
          </button>

          {/* Master Warning / Caution Indicator */}
          <button
            id="btn-master-warning"
            onClick={() => onToggleIndicator('warningMaster')}
            title="Master Caution Warning Indicator"
            className={`flex items-center justify-center w-7 h-7 rounded-md border transition-all cursor-pointer ${
              indicators.warningMaster
                ? 'bg-amber-950/80 border-amber-400 text-amber-300 glow-amber animate-bounce'
                : 'bg-slate-950/60 border-slate-800 text-slate-600 hover:text-slate-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
          </button>

          {/* Right Turn Signal */}
          <button
            id="btn-turn-right"
            onClick={() => onToggleIndicator('turnSignalRight')}
            title="Right Turn Signal (Toggle)"
            aria-label="Right turn signal"
            className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 cursor-pointer ${
              indicators.turnSignalRight && blinkerState
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 glow-green'
                : 'bg-slate-900/60 border-slate-800 text-slate-600 hover:text-slate-400'
            }`}
          >
            <ChevronRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>
    </header>
  );
};
