import { useCallback, useState } from 'react';
import { api } from '../../../services/api';
import type { Assessment } from '../types/assessment.types';

type AssessmentPayload = Parameters<typeof api.saveAssessment>[0];

export function useAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const refreshAssessments = useCallback(async (clientId: string) => {
    const data = await api.getClientAssessments(clientId);
    setAssessments(data);
    return data;
  }, []);

  const getClientAssessments = useCallback((clientId: string) => {
    return api.getClientAssessments(clientId);
  }, []);

  const addAssessment = useCallback(async (data: AssessmentPayload) => {
    const newAssessment = await api.saveAssessment(data);
    setAssessments((prev) => [newAssessment, ...prev]);
    return newAssessment;
  }, []);

  const deleteAssessment = useCallback(async () => {
    throw new Error('Exclusao de avaliacoes ainda nao esta disponivel no backend.');
  }, []);

  const duplicateAssessment = useCallback(
    async (id: string) => {
      const original = assessments.find((assessment) => assessment.id === id);
      if (!original) return undefined;

      return addAssessment({
        clientId: original.clientId,
        date: new Date().toISOString().split('T')[0],
        method: original.method,
        weight: original.weight,
        height: original.height,
        age: original.age,
        gender: original.gender,
        observations: original.observations,
      });
    },
    [addAssessment, assessments]
  );

  return {
    assessments,
    getClientAssessments,
    addAssessment,
    deleteAssessment,
    duplicateAssessment,
    refreshAssessments,
  };
}
