import type {
  NavyAssessmentInput,
  NavyInputValues,
  BioimpedanceInput,
  BioimpedanceInputValues,
  SkinfoldInput,
  SkinfoldInputValues,
} from '../types';

export const initialNavyData: NavyAssessmentInput = {
  weight: 0,
  height: 0,
  age: 0,
  gender: 'male',
  activityLevel: 'sedentary',
  objective: 'maintenance',
  waist: 0,
  neck: 0,
  hip: 0,
};

export const initialNavyInputValues: NavyInputValues = {
  weight: '',
  height: '',
  age: '',
  waist: '',
  neck: '',
  hip: '',
};

export const initialBioData: BioimpedanceInput = {
  weight: 0,
  height: 0,
  age: 0,
  gender: 'male',
  activityLevel: 'sedentary',
  objective: 'maintenance',
  resistance: 0,
  reactance: 0,
};

export const initialBioInputValues: BioimpedanceInputValues = {
  weight: '',
  height: '',
  age: '',
  resistance: '',
  reactance: '',
};

export const initialSkinfoldData: SkinfoldInput = {
  weight: 0,
  height: 0,
  age: 0,
  gender: 'male',
  activityLevel: 'sedentary',
  objective: 'maintenance',
  protocol: 'jp3',
  biceps: 0,
  chest: 0,
  midaxillary: 0,
  triceps: 0,
  subscapular: 0,
  abdominal: 0,
  suprailiac: 0,
  thigh: 0,
};

export const initialSkinfoldInputValues: SkinfoldInputValues = {
  weight: '',
  height: '',
  age: '',
  biceps: '',
  chest: '',
  midaxillary: '',
  triceps: '',
  subscapular: '',
  abdominal: '',
  suprailiac: '',
  thigh: '',
};
