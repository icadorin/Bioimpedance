import { useState } from 'react';
import { useClients } from '../hooks/useClients';
import ClientList from '../components/ClientList';
import ClientsHeader from '../components/ClientsHeader';
import NewClientModal from '../components/NewClientModal';
import '../styles/clients.css';
import '../styles/client-profile.css';
import '../styles/clients-modal.css';

export default function Clients() {
  const { filteredClients, search, setSearch, addClient } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="clients-page">
      <ClientsHeader search={search} onSearchChange={setSearch} onNewClient={handleOpenModal} />
      <ClientList clients={filteredClients} />

      <NewClientModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={addClient} />
    </div>
  );
}
