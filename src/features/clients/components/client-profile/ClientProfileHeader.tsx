import type { Client } from '../../types';

interface Props {
  client: Client;
}

export default function ClientProfileHeader({ client }: Props) {
  return (
    <div className="client-profile-header">
      <div>
        <h1>{client.name}</h1>
        <p>Acompanhe avaliações e progresso corporal.</p>
      </div>

      <span
        className={`client-profile-header__status client-profile-header__status--${client.status}`}
      >
        {client.status}
      </span>
    </div>
  );
}
