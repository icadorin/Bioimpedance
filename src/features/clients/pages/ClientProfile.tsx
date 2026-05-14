import { useParams } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import ClientProfileHeader from '../components/client-profile/ClientProfileHeader';
import ClientInfoCard from '../components/client-profile/ClientInfoCard';
import ClientQuickActions from '../components/client-profile/ClientQuickActions';
import ClientAssessmentSection from '../components/client-profile/ClientAssessmentSection';

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();

  const { getClientById, getClientAssessments } = useClients();

  const client = id ? getClientById(id) : undefined;
  const assessments = id ? getClientAssessments(id) : [];

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
      <ClientAssessmentSection assessments={assessments} clientId={id || ''} />{' '}
    </div>
  );
}
