// src/features/assessment/hooks/useAssessments.ts
import { useState, useCallback } from 'react';
import * as db from '../../../service/database';
import type { Assessment } from '../types/assessment.types';

export function useAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>(() => db.getAllAssessments());

  const refreshAssessments = useCallback(() => {
    setAssessments(db.getAllAssessments());
  }, []);

  const getClientAssessments = useCallback((clientId: string) => {
    return db.getClientAssessments(clientId);
  }, []);

  const addAssessment = useCallback(
    (data: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newAssessment = db.addAssessment(data);
      refreshAssessments();
      return newAssessment;
    },
    [refreshAssessments]
  );

  const deleteAssessment = useCallback(
    (id: string) => {
      const success = db.deleteAssessment(id);
      if (success) refreshAssessments();
      return success;
    },
    [refreshAssessments]
  );

  const duplicateAssessment = useCallback(
    (id: string) => {
      const duplicated = db.duplicateAssessment(id);
      if (duplicated) refreshAssessments();
      return duplicated;
    },
    [refreshAssessments]
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
