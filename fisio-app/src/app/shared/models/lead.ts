export type LeadStatus =
  | 'novo'
  | 'contatado'
  | 'agendado'
  | 'confirmado'
  | 'convertido'
  | 'perdido';

export interface Lead {
    id?: string;
    nome: string;
    sobrenome?: string;
    email?: string;
    telefone?: string;
    observacao?: string;
    criadoEm?: string;
    status: LeadStatus;
}

/**
 * Helpers para trabalhar com Lead
 */
export class LeadHelper {
    /**
     * Verifica se o lead está em um status ativo (pode ser trabalhado)
     */
    static isAtivo(lead: Lead): boolean {
        return lead.status !== 'convertido' && lead.status !== 'perdido';
    }

    /**
     * Verifica se o lead foi finalizado (convertido ou perdido)
     */
    static isFinalizado(lead: Lead): boolean {
        return lead.status === 'convertido' || lead.status === 'perdido';
    }

    /**
     * Obtém o nome completo do lead
     */
    static getNomeCompleto(lead: Lead): string {
        return `${lead.nome} ${lead.sobrenome}`.trim();
    }

    /**
     * Obtém a inicial do lead
     */
    static getInicial(lead: Lead): string {
        return (lead.nome?.charAt(0) ?? '').toUpperCase();
    }

    /**
     * Formata a data de criação
     */
    static formatDataCriacao(lead: Lead): string {
        if (!lead.criadoEm) return '';
        const date = new Date(lead.criadoEm);
        return isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR');
    }
}
