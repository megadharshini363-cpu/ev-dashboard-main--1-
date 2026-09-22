/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useScooterTelemetry } from './hooks/useScooterTelemetry';
import { TopStatusBar } from './components/TopStatusBar';
import { SpeedometerGauge } from './components/SpeedometerGauge';
import { BatterySection } from './components/BatterySection';
import { MotorSection } from './components/MotorSection';
import { DriveModeSelector } from './components/DriveModeSelector';
import { BatteryCellsBar } from './components/BatteryCellsBar';
import { ClusterControls } from './components/ClusterControls';
import { INITIAL_TELEMETRY } from './constants';
export default function App() {
 const [evData, setEvData] = useState<any>(null);


  const {
    telemetry,
    setTelemetry,
    isSimulating,
    setIsSimulating,
    throttleInput,
    setThrottleInput,
    isBraking,
    setIsBraking,
    blinkerState,
    setDriveMode,
    toggleVehiclePower,
    cycleHeadlights,
    toggleIndicator,
  } = useScooterTelemetry();
  useEffect(() => {
  const fetchEVData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/ev-data");
      const data = await response.json();

      setEvData(data);

      setTelemetry((prev) => ({
        ...prev,

        // Battery live data
        batterySOC:
          data.SOC !== undefined
            ? data.SOC / 10
            : 0,

        totalVoltage:
          data.Total_Voltage !== undefined
            ? data.Total_Voltage / 10
            : 0,

        current:
          data.Current !== undefined
            ? data.Current
            : 0,

        batteryTemp:
          data.Temp_Sensor1 !== undefined
            ? data.Temp_Sensor1
            : 0,

        // Speed from kit, if available
        speed:
          data.Speed !== undefined
           ? data.Speed
           : 0,

        cells: Array.from({ length: 20 }, (_, i) => {
  const voltage = data[`V${i + 1}`] !== undefined
    ? data[`V${i + 1}`] / 1000
    :  0;

  const temperature = data.Temp_Sensor1 !== undefined
    ? data.Temp_Sensor1
    :  0;

  return {
    id: i + 1,
    label: `Cell ${i + 1}`,
    voltage,
    minVoltage: voltage,
    maxVoltage: voltage,
    temperature,
    isBalancing: false,
    healthPercent: 100,
  };
}),
      }))


    } catch (error) {
      console.error("EV data error:", error);
    }
  };

  fetchEVData();

  const interval = setInterval(fetchEVData, 500);

  return () => clearInterval(interval);
}, []);
  const handleResetDefaults = () => {
    setThrottleInput(0);
    setIsBraking(false);
    setTelemetry(INITIAL_TELEMETRY);
  };

  return (
    <div className="min-h-screen w-full bg-black text-slate-100 flex flex-col justify-between overflow-x-hidden relative bg-cluster-grid select-none">
      {/* Background ambient radial gradients for authentic EV glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[500px] bg-cyan-950/25 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-emerald-950/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-blue-950/20 rounded-full blur-[120px]" />
      </div>

      {/* Cockpit Shell / Automotive Bezel Container */}
      <div className="relative z-10 flex flex-col flex-1 w-full max-w-[1550px] mx-auto">
        {/* TOP STATUS BAR */}
        <TopStatusBar
          indicators={telemetry.indicators}
          blinkerState={blinkerState}
          onToggleIndicator={toggleIndicator}
          onCycleHeadlights={cycleHeadlights}
          onToggleVehiclePower={toggleVehiclePower}
          tripA={telemetry.tripA}
          odo={telemetry.odo}
          ambientTemp={telemetry.ambientTemp}
        />

        {/* MAIN INSTRUMENT CLUSTER SCREEN */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 flex flex-col justify-center gap-4 sm:gap-5">
          {/* TOP SECTION: Left (Battery) | Center (Speedometer + Scooter Image) | Right (Motor & Drive Mode) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
            {/* LEFT: Battery Telemetry Section (Span 4 cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              <BatterySection
                soc={telemetry.batterySOC}
                energy={telemetry.batteryEnergy}
                totalVoltage={telemetry.totalVoltage}
                current={telemetry.current}
                chargingStatus={telemetry.chargingStatus}
                remainingRange={telemetry.remainingRange}
                isVehicleOn={telemetry.indicators.vehicleOn}
              />
            </div>

            {/* CENTER: Large Circular Speedometer with Center Electric Scooter Image (Span 4 cols) */}
            <div className="lg:col-span-4 flex items-center justify-center">
              <SpeedometerGauge
                speed={telemetry.speed}
                maxSpeed={telemetry.maxSpeedDisplay}
                driveMode={telemetry.driveMode}
                motorRPM={telemetry.motorRPM}
                current={telemetry.current}
                isVehicleOn={telemetry.indicators.vehicleOn}
              />
            </div>

            {/* RIGHT: Motor Section & Drive Mode Selector (Span 4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-4 justify-between">
              <MotorSection
                motorRPM={telemetry.motorRPM}
                motorTemp={telemetry.motorTemp}
                batteryTemp={telemetry.batteryTemp}
                powerKw={telemetry.powerDrawKw}
                isVehicleOn={telemetry.indicators.vehicleOn}
              />

              <DriveModeSelector
                currentMode={telemetry.driveMode}
                onSelectMode={setDriveMode}
              />
            </div>
          </div>

          {/* LOWER SECTION: 20 Individual Battery Cells Bar */}
          <section aria-label="Battery Cells Monitoring">
            <BatteryCellsBar
              cells={telemetry.cells}
              totalVoltage={telemetry.totalVoltage}
            />
          </section>
        </main>
      </div>

      {/* DOCK / HANDLEBAR CONTROLS BAR */}
      <ClusterControls
        speed={telemetry.speed}
        throttleInput={throttleInput}
        onThrottleChange={(val) => setThrottleInput(val)}
        isBraking={isBraking}
        onBrakeChange={(braking) => setIsBraking(braking)}
        isSimulating={isSimulating}
        onToggleSimulating={() => setIsSimulating(!isSimulating)}
        onResetDefaults={handleResetDefaults}
        driveMode={telemetry.driveMode}
        onSelectMode={setDriveMode}
        onCycleHeadlights={cycleHeadlights}
        onToggleHazard={() => toggleIndicator('hazardLights')}
        isHazardOn={telemetry.indicators.hazardLights}
      />
    </div>
  );
}
