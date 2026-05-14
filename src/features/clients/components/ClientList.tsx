import type { Client } from '../types';
import ClientCard from './ClientCard';
import EmptyClients from './EmptyClients';

interface Props {
  clients: Client[];
  onNewClient?: () => void;
}

export default function ClientList({ clients, onNewClient }: Props) {
  if (!clients.length) {
    return <EmptyClients onNewClient={onNewClient || (() => {})} />;
  }

  return (
    <div className="client-list">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
}
