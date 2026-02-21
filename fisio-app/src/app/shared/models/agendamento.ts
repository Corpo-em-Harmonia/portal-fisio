export interface Agendamento {
  id?: number;
  leadId?: number;
  pacienteId?: number;
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm
  dataHora?: string; // ISO string completo
  observacao?: string;
  status?: 'agendado' | 'realizado' | 'cancelado';
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
