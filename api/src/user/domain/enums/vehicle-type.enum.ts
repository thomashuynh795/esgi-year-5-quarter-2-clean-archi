import { freezeDeeply } from '../../../shared/utils/freeze-deeply';

export const VehicleType = freezeDeeply({
  None: 'NONE',
  Thermal: 'THERMAL',
  Hybrid: 'HYBRID',
  Electric: 'ELECTRIC',
} as const);

export type VehicleType = (typeof VehicleType)[keyof typeof VehicleType];
