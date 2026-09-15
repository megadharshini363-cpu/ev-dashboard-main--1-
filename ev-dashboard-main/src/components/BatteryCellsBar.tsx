import React, { useState } from 'react';
import { BatteryCell } from '../types';
import { Layers, ShieldCheck, Zap, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface BatteryCellsBarProps {
  cells: BatteryCell[];
  totalVoltage: number;
}

export const BatteryCellsBar: React.FC<BatteryCellsBarProps> = ({
  cells,
  totalVoltage,
}) => {
  const [selectedCell, setSelectedCell] = useState<BatteryCell | null>(null);

  // Calculate statistics across the 20 cells
  const voltages = cells.map((c) => c.voltage);
  const minV = Math.min(...voltages);
  const maxV = Math.max(...voltages);
  const deltaV = (maxV - minV) * 1000; // in millivolts
  const avgV = (totalVoltage / 20).toFixed(3);

  return (
    <div
      id="battery-cells-bar-card"
      className="relative flex flex-col bg-slate-950/85 border border-cyan-900/50 hover:border-cyan-500/60 rounded-2xl p-3.5 sm:p-4 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.8)] glow-cyan transition-all duration-300"
    >
      {/* Header with Title and Pack Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-300">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron text-xs sm:text-sm font-bold tracking-wider text-slate-100 flex items-center gap-2">
              BATTERY CELLS STATUS BAR (20S)
              <span className="px-2 py-0.2 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono-tech">
                BALANCED
              </span>
            </h3>
            <p className="font-mono-tech text-[10px] text-cyan-400/80">
              INDIVIDUAL CELL VOLTAGE MONITORING (CELL 1 - CELL 20)
            </p>
          </div>
        </div>

        {/* Quick BMS summary chips */}
        <div className="flex items-center gap-2 text-[10px] font-mono-tech">
          <div className="px-2 py-1 rounded bg-black/60 border border-slate-800 text-slate-300">
            AVG: <span className="text-cyan-400 font-semibold">{avgV}V</span>
          </div>
          <div className="px-2 py-1 rounded bg-black/60 border border-slate-800 text-slate-300">
            ΔV: <span className="text-emerald-400 font-semibold">{deltaV.toFixed(0)} mV</span>
          </div>
          <div className="hidden md:flex px-2 py-1 rounded bg-black/60 border border-slate-800 text-slate-300">
            MAX: <span className="text-cyan-300 font-semibold">{maxV.toFixed(3)}V</span>
          </div>
          <div className="hidden md:flex px-2 py-1 rounded bg-black/60 border border-slate-800 text-slate-300">
            MIN: <span className="text-cyan-300 font-semibold">{minV.toFixed(3)}V</span>
          </div>
        </div>
      </div>

      {/* 20 Individual Battery Cells Bar Layout */}
      {/* 20 cells rendered cleanly in a responsive 10x2 or 20x1 grid */}
      <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-20 gap-1.5 sm:gap-2">
        {cells.map((cell) => {
          // Normalized level between 3.2V (0%) and 4.2V (100%)
          const cellPercentage = Math.max(
            0,
            Math.min(100, ((cell.voltage - 3.2) / (4.2 - 3.2)) * 100)
          );
          const isSelected = selectedCell?.id === cell.id;

          return (
            <button
              key={cell.id}
              id={`cell-bar-${cell.id}`}
              onClick={() => setSelectedCell(isSelected ? null : cell)}
              className={`relative flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-lg border transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/80 border-cyan-400 ring-1 ring-cyan-400 glow-cyan'
                  : 'bg-black/60 border-slate-800/90 hover:border-cyan-800/80 hover:bg-slate-900/60'
              }`}
            >
              {/* Cell Number Header */}
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-mono-tech text-[9px] font-bold text-slate-300">
                  C{cell.id}
                </span>
                {cell.isBalancing && (
                  <span
                    title="Active Cell Balancing"
                    className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"
                  />
                )}
              </div>

              {/* Vertical Voltage Level Gauge */}
              <div className="relative w-full h-12 sm:h-14 bg-slate-900/90 rounded border border-slate-800 flex flex-col justify-end p-0.5 overflow-hidden">
                {/* Horizontal reference tick line for 4.0V */}
                <div className="absolute inset-x-0 bottom-3/4 border-b border-cyan-500/20 pointer-events-none" />

                {/* Fill bar */}
                <div
                  className="w-full bg-gradient-to-t from-cyan-600 via-teal-400 to-emerald-400 rounded-sm transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  style={{ height: `${cellPercentage}%` }}
                />
              </div>

              {/* Cell Voltage Readout */}
              <div className="mt-1 text-center w-full">
                <span className="font-mono-tech text-[9px] sm:text-[10px] font-semibold text-cyan-300 block leading-tight">
                  {cell.voltage.toFixed(2)}
                  <span className="text-[7px] text-slate-500 ml-0.5">V</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Cell Detail Inspector Banner (Shows details when a cell is clicked) */}
      {selectedCell ? (
        <div className="mt-3 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between text-xs font-mono-tech text-cyan-200">
          <div className="flex items-center gap-3">
            <span className="font-orbitron font-bold text-white text-sm">
              Cell {selectedCell.id}
            </span>
            <span>Voltage: <strong className="text-cyan-300">{selectedCell.voltage.toFixed(3)} V</strong></span>
            <span>Temp: <strong className="text-slate-300">{selectedCell.temperature.toFixed(1)} °C</strong></span>
            <span>Health: <strong className="text-emerald-400">{selectedCell.healthPercent}%</strong></span>
          </div>
          <button
            onClick={() => setSelectedCell(null)}
            className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-black/40 border border-slate-800"
          >
            Close
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-2 pt-1.5 text-[10px] font-mono-tech text-slate-500">
          <span>Click any cell to inspect individual cell telemetry</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Amber dot = Active Balancing
          </span>
        </div>
      )}
    </div>
  );
};
