interface EmptyClientsProps {
  onNewClient: () => void;
}

export default function EmptyClients({ onNewClient }: EmptyClientsProps) {
  return (
    <div className="empty-clients">
      <h2>Nenhum cliente encontrado</h2>
      <p>Comece adicionando seu primeiro cliente.</p>
      <button onClick={onNewClient}>+ Novo cliente</button>
    </div>
  );
}
