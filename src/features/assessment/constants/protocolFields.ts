export const PROTOCOL_FIELDS = {
  jp3: {
    male: ['chest', 'abdominal', 'thigh'],
    female: ['triceps', 'suprailiac', 'thigh'],
    toReset: {
      male: ['triceps', 'suprailiac'],
      female: ['chest', 'abdominal'],
    },
  },
} as const;
