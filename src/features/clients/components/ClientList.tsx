import type { Client } from '../types';
import ClientCard from './ClientCard';
import EmptyClients from './EmptyClients';

interface Props {
  clients: Client[];
}

export default function ClientList({ clients }: Props) {
  if (!clients.length) {
    return <EmptyClients />;
  }

  return (
    <div className="client-list">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
}
