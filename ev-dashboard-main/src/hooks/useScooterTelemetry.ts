import { useState, useEffect, useCallback, useRef } from 'react';
import { ScooterTelemetry, DriveMode, BatteryCell } from '../types';
import { INITIAL_TELEMETRY } from '../constants';

export function useScooterTelemetry() {
  const [telemetry, setTelemetry] = useState<ScooterTelemetry>(INITIAL_TELEMETRY);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [throttleInput, setThrottleInput] = useState<number>(0); // Target speed or throttle %
  const [isBraking, setIsBraking] = useState<boolean>(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState<boolean>(true);
  const [blinkerState, setBlinkerState] = useState<boolean>(false);

  // Turn signal blinking timer
  useEffect(() => {
    const hasActiveSignal =
      telemetry.indicators.turnSignalLeft ||
      telemetry.indicators.turnSignalRight ||
      telemetry.indicators.hazardLights;

    if (!hasActiveSignal) {
      setBlinkerState(false);
      return;
    }

    const interval = setInterval(() => {
      setBlinkerState((prev) => !prev);
    }, 450);

    return () => clearInterval(interval);
  }, [
    telemetry.indicators.turnSignalLeft,
    telemetry.indicators.turnSignalRight,
    telemetry.indicators.hazardLights,
  ]);

  // Handle Drive Mode change
  const setDriveMode = useCallback((mode: DriveMode) => {
    setTelemetry((prev) => {
      let rangeMultiplier = 1.0;
      if (mode === 'ECO') rangeMultiplier = 1.15;
      if (mode === 'SPORT') rangeMultiplier = 0.88;
      
      const newRange = Math.round(118 * (mode === 'SPORT' ? 0.95 : mode === 'ECO' ? 1.12 : 1.0));
      return {
        ...prev,
        driveMode: mode,
        remainingRange: newRange,
      };
    });
  }, []);

  // Toggle vehicle status
  const toggleVehiclePower = useCallback(() => {
    setTelemetry((prev) => ({
      ...prev,
      indicators: {
        ...prev.indicators,
        vehicleOn: !prev.indicators.vehicleOn,
      },
    }));
  }, []);

  // Toggle headlights
  const cycleHeadlights = useCallback(() => {
    setTelemetry((prev) => {
      const nextMode =
        prev.indicators.headlight === 'off'
          ? 'low'
          : prev.indicators.headlight === 'low'
          ? 'high'
          : 'off';
      return {
        ...prev,
        indicators: {
          ...prev.indicators,
          headlight: nextMode,
        },
      };
    });
  }, []);

  // Toggle indicators
  const toggleIndicator = useCallback(
    (type: 'turnSignalLeft' | 'turnSignalRight' | 'hazardLights' | 'warningMaster' | 'warningBattery' | 'warningTemp') => {
      setTelemetry((prev) => {
        if (type === 'turnSignalLeft') {
          return {
            ...prev,
            indicators: {
              ...prev.indicators,
              turnSignalLeft: !prev.indicators.turnSignalLeft,
              turnSignalRight: false,
              hazardLights: false,
            },
          };
        }
        if (type === 'turnSignalRight') {
          return {
            ...prev,
            indicators: {
              ...prev.indicators,
              turnSignalRight: !prev.indicators.turnSignalRight,
              turnSignalLeft: false,
              hazardLights: false,
            },
          };
        }
        if (type === 'hazardLights') {
          const nextVal = !prev.indicators.hazardLights;
          return {
            ...prev,
            indicators: {
              ...prev.indicators,
              hazardLights: nextVal,
              turnSignalLeft: nextVal,
              turnSignalRight: nextVal,
            },
          };
        }
        return {
          ...prev,
          indicators: {
            ...prev.indicators,
            [type]: !prev.indicators[type],
          },
        };
      });
    },
    []
  );

  // Simulation loop for realistic real-time BMS and motor telemetry
  useEffect(() => {
    if (!isSimulating || !telemetry.indicators.vehicleOn) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        // Target speed smooth convergence
        let targetSpeed = throttleInput;
        if (isBraking) targetSpeed = Math.max(0, prev.speed - 8);

        // Smooth speed step
        const speedDelta = (targetSpeed - prev.speed) * 0.12;
        const currentSpeed = Math.max(0, Math.min(prev.maxSpeedDisplay, prev.speed + speedDelta));
        const roundedSpeed = Math.round(currentSpeed);

        // Motor RPM correlates to speed (at 45 km/h => 3200 RPM)
        const baseRPM = Math.round(currentSpeed * (3200 / 45));
        const jitterRPM = baseRPM > 0 ? (Math.random() * 20 - 10) : 0;
        const motorRPM = Math.max(0, Math.round(baseRPM + jitterRPM));

        // Current draw depends on acceleration and speed
        let currentA = -12.5;
        if (isBraking && prev.speed > 5) {
          // Regenerative braking sends positive current back to battery!
          currentA = +(prev.speed * 0.35 + (Math.random() * 0.6 - 0.3));
        } else if (speedDelta > 0.5) {
          // Accelerating pulls more current
          currentA = -(15 + speedDelta * 4 + (Math.random() * 0.8 - 0.4));
        } else if (roundedSpeed === 0) {
          currentA = -0.8; // Idle electronics draw
        } else {
          // Cruising around 45 km/h
          const loadMultiplier = prev.driveMode === 'SPORT' ? 1.0 : prev.driveMode === 'NORMAL' ? 0.9 : 0.75;
          currentA = -(12.5 * (roundedSpeed / 45) * loadMultiplier + (Math.random() * 0.4 - 0.2));
        }

        const chargingStatus =
          currentA > 0.5 ? 'Regenerating' : currentA < -0.2 ? 'Discharging' : 'Idle';

        // Voltage drops slightly under load (IR drop)
        const nominalV = 81.4;
        const voltageSag = (Math.abs(currentA) / 30) * 0.3;
        const totalVoltage = Number((nominalV - voltageSag + (Math.random() * 0.04 - 0.02)).toFixed(1));

        // Power in kW
        const powerKw = Number(((totalVoltage * Math.abs(currentA)) / 1000).toFixed(2));

        // Thermal slight gentle drift
        const motorTemp = Number(
          (36 + (motorRPM > 3000 ? 0.2 : -0.1) * (Math.random() * 0.2)).toFixed(1)
        );
        const batteryTemp = 28;

        // Subtle micro-fluctuations in 20 cells
        const updatedCells: BatteryCell[] = prev.cells.map((cell, idx) => {
          const baseV = totalVoltage / 20;
          const variance = (idx % 2 === 0 ? 0.002 : -0.002) + (Math.random() * 0.002 - 0.001);
          return {
            ...cell,
            voltage: Number((baseV + variance).toFixed(3)),
          };
        });

        return {
          ...prev,
          speed: roundedSpeed,
          motorRPM,
          current: Number(currentA.toFixed(1)),
          chargingStatus,
          totalVoltage,
          powerDrawKw: powerKw,
          estimatedPowerKW: powerKw,
          motorTemp: Math.min(85, Math.max(25, motorTemp)),
          batteryTemp,
          cells: updatedCells,
          tripA: Number((prev.tripA + (roundedSpeed > 0 ? 0.003 : 0)).toFixed(2)),
          odo: Number((prev.odo + (roundedSpeed > 0 ? 0.003 : 0)).toFixed(1)),
        };
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isSimulating, throttleInput, isBraking, telemetry.indicators.vehicleOn]);

  // Support for external BMS/Motor WebSocket or REST dispatch
  useEffect(() => {
    const handleExternalBmsEvent = (e: CustomEvent<Partial<ScooterTelemetry>>) => {
      if (e.detail) {
        setTelemetry((prev) => ({ ...prev, ...e.detail }));
      }
    };

    window.addEventListener('ev-bms-packet' as any, handleExternalBmsEvent);
    return () => window.removeEventListener('ev-bms-packet' as any, handleExternalBmsEvent);
  }, []);

  return {
    telemetry,
    setTelemetry,
    isSimulating,
    setIsSimulating,
    throttleInput,
    setThrottleInput,
    isBraking,
    setIsBraking,
    isWebSocketConnected,
    setIsWebSocketConnected,
    blinkerState,
    setDriveMode,
    toggleVehiclePower,
    cycleHeadlights,
    toggleIndicator,
  };
}
