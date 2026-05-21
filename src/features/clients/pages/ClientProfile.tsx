import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../../services/api';
import type { Assessment } from '../../assessment/types';
import type { Client } from '../types';
import ClientProfileHeader from '../components/client-profile/ClientProfileHeader';
import ClientInfoCard from '../components/client-profile/ClientInfoCard';
import ClientQuickActions from '../components/client-profile/ClientQuickActions';
import ClientAssessmentSection from '../components/client-profile/ClientAssessmentSection';

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [clientData, assessmentData] = await Promise.all([
          api.getClientById(id),
          api.getClientAssessments(id),
        ]);

        if (!active) return;
        setClient(clientData);
        setAssessments(assessmentData);
      } catch (error) {
        console.error('Erro ao carregar perfil do cliente:', error);
        if (active) {
          setClient(null);
          setAssessments([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container">
        <h1>Carregando cliente...</h1>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container">
        <h1>Cliente não encontrado</h1>
      </div>
    );
  }

  return (
    <div className="client-profile-page">
      <ClientProfileHeader client={client} />
      <ClientQuickActions clientId={client.id} />
      <ClientInfoCard client={client} />
      <ClientAssessmentSection assessments={assessments} clientId={id || ''} />
    </div>
  );
}
