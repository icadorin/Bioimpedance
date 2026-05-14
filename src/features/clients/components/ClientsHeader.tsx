import ClientSearch from './ClientSearch';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  onNewClient: () => void;
}

export default function ClientsHeader({ search, onSearchChange, onNewClient }: Props) {
  return (
    <div className="clients-header">
      <div className="clients-header__content">
        <h1>Clientes</h1>
        <p>Gerencie seus clientes e avaliações.</p>
      </div>
      <div className="clients-header__actions">
        <ClientSearch value={search} onChange={onSearchChange} />
        <button className="clients-header__button" onClick={onNewClient}>
          + Novo cliente
        </button>
      </div>
    </div>
  );
}
