import { Agendamento } from '../../../../shared/models/agendamento';

export type DashboardAgendamento = Omit<Agendamento, 'id' | 'pacienteId' | 'status'> & {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  horario: string;
  duracao: number;
  tipo: 'avaliacao' | 'sessao' | 'retorno';
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado' | 'faltou';
};

export interface DashboardPaciente {
  id: string;
  nome: string;
  ultimaSessao: string;
  proximaSessao: string;
  totalSessoes: number;
  status: 'ativo' | 'inativo';
}
