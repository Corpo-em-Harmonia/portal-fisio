export interface FisioFilaItem {
  idSessao: string;
  idLead?: string | null;
  idPaciente?: string | null;
  nome: string;
  telefone?: string;
  dataHora: string;
  status: string;
  origem: 'LEAD' | 'PACIENTE';
}

export interface FisioPacienteAtivoItem {
  nome: string;
  ultimaSessao?: string | null;
  proximaSessao?: string | null;
}

export interface FisioHistoricoAvaliacaoItem {
  paciente: string;
  data: string;
  resumo: string;
}
