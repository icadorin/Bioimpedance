import { useNavigate } from 'react-router-dom';

interface Props {
  clientId: string;
}

export default function ClientQuickActions({ clientId }: Props) {
  const navigate = useNavigate();

  const handleNewAssessment = () => {
    navigate(`/new-assessment/${clientId}`);
  };

  return (
    <div className="client-quick-actions">
      <button onClick={handleNewAssessment}>+ Nova Avaliação</button>
      <button>Gerar PDF da Última Avaliação</button>
    </div>
  );
}
