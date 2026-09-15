import { ScooterTelemetry, BatteryCell } from './types';
import scooterImg from './assets/images/ev_scooter_center_1788845412149.jpg';

export const SCOOTER_IMAGE_SRC = scooterImg;

// Generate 20 battery cells summing to 81.4V (average 4.07V per cell)
export const INITIAL_CELLS: BatteryCell[] = Array.from({ length: 20 }, (_, index) => {
  const cellId = index + 1;
  // Subtle natural cell variance between 4.062V and 4.078V
  const cellVariances = [
    4.072, 4.068, 4.071, 4.070, 4.069,
    4.073, 4.071, 4.068, 4.072, 4.070,
    4.069, 4.074, 4.071, 4.070, 4.068,
    4.072, 4.069, 4.071, 4.073, 4.070
  ];
  const voltage = cellVariances[index] || 4.070;
  
  return {
    id: cellId,
    label: `Cell ${cellId}`,
    voltage: Number(voltage.toFixed(3)),
    minVoltage: 3.2,
    maxVoltage: 4.2,
    temperature: 28 + (index % 3) * 0.4,
    isBalancing: cellId === 6 || cellId === 12,
    healthPercent: 99.2,
  };
});

export const INITIAL_TELEMETRY: ScooterTelemetry = {
  speed: 0,
  maxSpeedDisplay: 0,
  
  // Battery Section
  batterySOC: 0,
  batteryEnergy: 0,
  totalVoltage: 0,
  current: 0,
  chargingStatus: 'Discharging',
  remainingRange: 0,
  
  // Motor Section
  motorRPM: 0,
  motorTemp: 0,
  batteryTemp: 0,
  
  // Drive Mode
  driveMode: 'SPORT',
  
  // 20 Battery Cells
  cells: INITIAL_CELLS,
  
  // Top Status Bar Indicators
  indicators: {
    vehicleOn: true,
    headlight: 'high',
    gpsConnected: true,
    satellites: 14,
    warningMaster: false,
    warningBattery: false,
    warningTemp: false,
    turnSignalLeft: false,
    turnSignalRight: false,
    hazardLights: false,
    brakeActive: false,
    kickstandDown: false,
    absActive: true,
  },
  
  // Aux
  tripA: 0,
  odo: 0,
  estimatedPowerKW: 0,
  powerDrawKw: 0,
  ambientTemp: 0,
  bmsStatus: 'OPTIMAL',
  controllerStatus: 'RUNNING',
  firmwareVersion: 'v3.8.2-EV',
};
