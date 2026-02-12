export type SessaoStatus =
  | 'marcada'
  | 'compareceu'
  | 'faltou'
  | 'cancelada'
  | 'remarcada';

export interface Sessao {
  id: string;
  pacienteId: string;

  // opcional: se seu backend já retornar nome/telefone junto, melhor pra UI
  pacienteNome?: string;
  pacienteTelefone?: string;

  dataHora: string; // ISO
  status: SessaoStatus;
}
