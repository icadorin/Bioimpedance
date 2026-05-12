import { useClients } from '../hooks/useClients';
import ClientList from '../components/ClientList';
import ClientsHeader from '../components/ClientsHeader';
import '../styles/clients.css';
import '../styles/client-profile.css';

export default function Clients() {
  const { filteredClients, search, setSearch } = useClients();

  return (
    <div className="clients-page">
      <ClientsHeader search={search} onSearchChange={setSearch} />
      <ClientList clients={filteredClients} />
    </div>
  );
}
