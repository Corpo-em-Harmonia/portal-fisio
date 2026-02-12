/**
 * Configuração da API
 * Centraliza as URLs e configurações relacionadas à API
 */

export const API_CONFIG = {
    baseUrl: 'http://localhost:8080/api',
    endpoints: {
        leads: 'leads',
        pacientes: 'pacientes',
        avaliacoes: 'avaliacoes',
        agendamentos: 'agendamentos',
    },
    timeout: 30000, // 30 segundos
} as const;

/**
 * Helper para construir URLs completas
 */
export function buildApiUrl(endpoint: string, ...segments: (string | number)[]): string {
    const base = `${API_CONFIG.baseUrl}/${endpoint}`;
    return segments.length > 0 
        ? `${base}/${segments.join('/')}`
        : base;
}
