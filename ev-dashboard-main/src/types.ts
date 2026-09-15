export type DriveMode = 'ECO' | 'NORMAL' | 'SPORT';

export type ChargingStatus = 'Discharging' | 'Charging' | 'Regenerating' | 'Idle';

export interface BatteryCell {
  id: number;
  label: string; // "Cell 1", "Cell 2", etc.
  voltage: number; // e.g. 4.07 V
  minVoltage: number;
  maxVoltage: number;
  temperature: number; // e.g. 28°C
  isBalancing?: boolean;
  healthPercent: number;
}

export interface ClusterIndicators {
  vehicleOn: boolean;
  headlight: 'off' | 'low' | 'high';
  gpsConnected: boolean;
  satellites: number;
  warningMaster: boolean;
  warningBattery: boolean;
  warningTemp: boolean;
  turnSignalLeft: boolean;
  turnSignalRight: boolean;
  hazardLights: boolean;
  brakeActive: boolean;
  kickstandDown: boolean;
  absActive: boolean;
}

export interface ScooterTelemetry {
  // Speedometer
  speed: number; // km/h (default 45)
  maxSpeedDisplay: number; // km/h (e.g. 100)
  
  // Battery Section
  batterySOC: number; // % (default 92)
  batteryEnergy: number; // kWh (default 26.4)
  totalVoltage: number; // V (default 81.4)
  current: number; // A (default -12.5)
  chargingStatus: ChargingStatus; // "Discharging"
  remainingRange: number; // km (default 118)
  
  // Motor Section
  motorRPM: number; // RPM (default 3200)
  motorTemp: number; // °C (default 36)
  batteryTemp: number; // °C (default 28)
  
  // Drive Mode
  driveMode: DriveMode; // "NORMAL", "ECO", "SPORT"
  
  // 20 Battery Cells
  cells: BatteryCell[];
  
  // Indicators
  indicators: ClusterIndicators;
  
  // Trip & Aux Telemetry
  tripA: number; // km
  odo: number; // km
  estimatedPowerKW: number; // kW = (V * A) / 1000
  powerDrawKw: number;
  ambientTemp: number; // °C
  bmsStatus: 'OPTIMAL' | 'BALANCING' | 'PROTECTED';
  controllerStatus: 'RUNNING' | 'STANDBY' | 'FAULT';
  firmwareVersion: string;
}
