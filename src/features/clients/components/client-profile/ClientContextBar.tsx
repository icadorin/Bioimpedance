import { useNavigate } from 'react-router-dom';
import type { Client } from '../../types';

interface Props {
  client: Client;
}

export default function ClientContextBar({ client }: Props) {
  const navigate = useNavigate();

  function handleGoProfile() {
    navigate(`/clients/${client.id}`);
  }

  function handleRemoveContext() {
    navigate('/new-assessment');
  }

  return (
    <div className="client-context-bar">
      <div className="client-info">
        <span className="avatar">{client.name.charAt(0).toUpperCase()}</span>

        <div className="client-meta">
          <strong>{client.name}</strong>
          <small>{client.email}</small>
        </div>
      </div>

      <div className="client-actions">
        <button onClick={handleGoProfile}>Ver perfil</button>

        <button onClick={handleRemoveContext}>Remover</button>
      </div>
    </div>
  );
}
