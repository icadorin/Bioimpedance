export const ROUTES = {
  dashboard: '/dashboard',
  newAssessment: '/new-assessment',
  newAssessmentWithClient: '/new-assessment/:clientId',
  clients: '/clients',
  clientProfile: '/clients/:id',
  history: '/history',
  pdfs: '/pdfs',
  settings: '/settings',
  payments: '/payments',
} as const;
