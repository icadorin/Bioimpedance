import type { SkinfoldMeasurementKey } from './skinfold.types';

export type CommonInputValues = Record<'weight' | 'height' | 'age', string>;

export type NavySpecificInputValues = Record<'waist' | 'neck' | 'hip', string>;

export type BioSpecificInputValues = Record<'resistance' | 'reactance', string>;

export type SkinfoldSpecificInputValues = Record<SkinfoldMeasurementKey, string>;

// tipos completos para passar às calculadoras
export type NavyInputValues = CommonInputValues & NavySpecificInputValues;
export type BioimpedanceInputValues = CommonInputValues & BioSpecificInputValues;
export type SkinfoldInputValues = CommonInputValues & SkinfoldSpecificInputValues;
