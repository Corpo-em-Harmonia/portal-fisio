import { SessaoStatus } from '../models/sessao';

export const SESSAO_STATUS_LABEL: Record<SessaoStatus, string> = {
  marcada: 'Marcada',
  compareceu: 'Compareceu',
  faltou: 'Faltou',
  cancelada: 'Cancelada',
  remarcada: 'Remarcada',
};

export const SESSAO_STATUS_BADGE_CLASS: Record<SessaoStatus, string> = {
  marcada: 'status-marcada',
  compareceu: 'status-compareceu',
  faltou: 'status-faltou',
  cancelada: 'status-cancelada',
  remarcada: 'status-remarcada',
};

export const SESSAO_STATUS_FALLBACK_LABEL = 'Desconhecido';
export const SESSAO_STATUS_FALLBACK_CLASS = 'status-desconhecido';
