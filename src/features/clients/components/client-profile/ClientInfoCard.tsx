import type { Client } from '../../types';

interface Props {
  client: Client;
}

export default function ClientInfoCard({ client }: Props) {
  return (
    <div className="client-info-card">
      <h2>Informações Básicas</h2>

      <div className="client-info-card__grid">
        <div>
          <span>Email</span>
          <p>{client.email || '-'}</p>
        </div>
        <div>
          <span>Telefone</span>
          <p>{client.phone || '-'}</p>
        </div>
        <div>
          <span>Objetivo</span>
          <p>{client.goal || '-'}</p>
        </div>
        <div>
          <span>Data de Nascimento</span>
          <p>{client.birthDate ? new Date(client.birthDate).toLocaleDateString('pt-BR') : '-'}</p>
        </div>
      </div>
    </div>
  );
}
