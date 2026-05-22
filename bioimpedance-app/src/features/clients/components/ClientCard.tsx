import type { Client } from '../types';
import ClientActions from './ClientActions';

interface Props {
  client: Client;
}

export default function ClientCard({ client }: Props) {
  return (
    <div className="client-card">
      <div className="client-card__header">
        <h3>{client.name}</h3>

        <span className={`client-card__status client-card__status--${client.status}`}>
          {client.status}
        </span>
      </div>

      <div className="client-card__content">
        <p>{client.goal}</p>

        {/* <small>Last assessment: {client.lastAssessment}</small> */}
      </div>

      <ClientActions clientId={client.id} />
    </div>
  );
}
