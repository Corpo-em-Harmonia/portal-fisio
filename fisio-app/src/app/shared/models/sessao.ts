export type SessaoStatus =
  | 'marcada'
  | 'compareceu'
  | 'faltou'
  | 'cancelada'
  | 'remarcada'
  | 'aguardando_avaliacao'
  | 'avaliada';

export type TipoSessao = 'avaliacao' | 'sessao' | 'retorno';

export interface Sessao {
  id: string;
  pacienteId: string;
  leadId?: string;

  // opcional: se seu backend já retornar nome/telefone junto, melhor pra UI
  pacienteNome?: string;
  pacienteTelefone?: string;

  dataHora: string; // ISO
  status: SessaoStatus;
  tipoSessao?: TipoSessao;
  
  // Contadores de faltas/comparecimentos
  totalFaltas?: number;
  totalComparecimentos?: number;
}
