import { LeadStatus } from '../models/lead';

// Labels exibidos na UI
export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  convertido: 'Convertido',
  perdido: 'Perdido',
};

// Classe CSS da badge (você vai criar no SCSS: .status-novo, .status-contatado, etc)
export const LEAD_STATUS_BADGE_CLASS: Record<LeadStatus, string> = {
  novo: 'status-novo',
  contatado: 'status-contatado',
  agendado: 'status-agendado',
  confirmado: 'status-confirmado',
  convertido: 'status-convertido',
  perdido: 'status-perdido',
};

// Fallback caso venha algo inesperado
export const LEAD_STATUS_FALLBACK_LABEL = 'Desconhecido';
export const LEAD_STATUS_FALLBACK_CLASS = 'status-desconhecido';

/**
 * Helper para obter o label de um status
 */
export function getStatusLabel(status: LeadStatus): string {
  return LEAD_STATUS_LABEL[status] ?? LEAD_STATUS_FALLBACK_LABEL;
}

/**
 * Helper para obter a classe CSS de um status
 */
export function getStatusClass(status: LeadStatus): string {
  return LEAD_STATUS_BADGE_CLASS[status] ?? LEAD_STATUS_FALLBACK_CLASS;
}
