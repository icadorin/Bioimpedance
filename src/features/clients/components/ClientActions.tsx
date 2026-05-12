import { useNavigate } from 'react-router-dom';

interface Props {
  clientId: string;
}

export default function ClientActions({ clientId }: Props) {
  const navigate = useNavigate();

  function handleProfile() {
    navigate(`/clients/${clientId}`);
  }

  return (
    <div className="client-actions">
      <button onClick={handleProfile}>Perfil</button>
      <button>Avaliar</button>
      <button>PDF</button>
    </div>
  );
}
