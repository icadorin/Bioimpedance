import type { SkinfoldInput, SkinfoldMeasurementKey } from '../types/skinfold.types';

export function getRequiredSkinfoldFields(
  data: Pick<SkinfoldInput, 'gender' | 'protocol'>
): SkinfoldMeasurementKey[] {
  if (data.protocol === 'dw4') {
    return ['biceps', 'triceps', 'subscapular', 'suprailiac'];
  }

  if (data.protocol === 'jp7') {
    return ['chest', 'midaxillary', 'triceps', 'subscapular', 'abdominal', 'suprailiac', 'thigh'];
  }

  return data.gender === 'male'
    ? ['chest', 'abdominal', 'thigh']
    : ['triceps', 'suprailiac', 'thigh'];
}

function densityToBodyFat(bodyDensity: number): number {
  if (!bodyDensity) return 0;

  const bodyFat = 495 / bodyDensity - 450;

  return isFinite(bodyFat) && bodyFat > 0 ? bodyFat : 0;
}

function calculateJp3Density(data: SkinfoldInput): number {
  const { age, gender } = data;

  const sum =
    gender === 'male'
      ? data.chest + data.abdominal + data.thigh
      : data.triceps + data.suprailiac + data.thigh;

  if (!sum || !age) return 0;

  if (gender === 'male') {
    return 1.10938 - 0.0008267 * sum + 0.0000016 * sum ** 2 - 0.0002574 * age;
  }

  return 1.0994921 - 0.0009929 * sum + 0.0000023 * sum ** 2 - 0.0001392 * age;
}

function calculateJp7Density(data: SkinfoldInput): number {
  const { age, gender } = data;
  const sum =
    data.chest +
    data.midaxillary +
    data.triceps +
    data.subscapular +
    data.abdominal +
    data.suprailiac +
    data.thigh;

  if (!sum || !age) return 0;

  if (gender === 'male') {
    return 1.112 - 0.00043499 * sum + 0.00000055 * sum ** 2 - 0.00028826 * age;
  }

  return 1.097 - 0.00046971 * sum + 0.00000056 * sum ** 2 - 0.00012828 * age;
}

function calculateDurninWomersleyDensity(data: SkinfoldInput): number {
  const sum = calculateSkinfoldSum(data);

  if (!sum || !data.age) return 0;

  const logSum = Math.log10(sum);

  if (data.gender === 'male') {
    if (data.age < 17) return 1.1533 - 0.0643 * logSum;
    if (data.age < 20) return 1.162 - 0.063 * logSum;
    if (data.age < 30) return 1.1631 - 0.0632 * logSum;
    if (data.age < 40) return 1.1422 - 0.0544 * logSum;
    if (data.age < 50) return 1.162 - 0.07 * logSum;

    return 1.1715 - 0.0779 * logSum;
  }

  if (data.age < 17) return 1.1369 - 0.0598 * logSum;
  if (data.age < 20) return 1.1549 - 0.0678 * logSum;
  if (data.age < 30) return 1.1599 - 0.0717 * logSum;
  if (data.age < 40) return 1.1423 - 0.0632 * logSum;
  if (data.age < 50) return 1.1333 - 0.0612 * logSum;

  return 1.1339 - 0.0645 * logSum;
}

export function calculateSkinfoldSum(data: SkinfoldInput): number {
  return getRequiredSkinfoldFields(data).reduce((sum, field) => sum + data[field], 0);
}

export function calculateSkinfoldDensity(data: SkinfoldInput): number {
  if (data.protocol === 'jp3') return calculateJp3Density(data);
  if (data.protocol === 'jp7') return calculateJp7Density(data);

  return calculateDurninWomersleyDensity(data);
}

export function calculateBodyFatSkinfold(data: SkinfoldInput): number {
  return densityToBodyFat(calculateSkinfoldDensity(data));
}
