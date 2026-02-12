
import { Injectable } from '@angular/core';
import { Lead, LeadStatus } from '../models/lead';
import { BaseService } from '../../core/services/base.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export type LeadAcao =
  | 'REGISTRAR_CONTATO'
  | 'AGENDAR_AVALIACAO'
  | 'CONFIRMAR_COMPARECIMENTO'
  | 'CANCELAR'
  | 'FALTOU';

interface AplicarAcaoResponse {
    acao: LeadAcao;
    lead: Lead;
}

@Injectable({
    providedIn: 'root'
})
export class LeadService extends BaseService<Lead> {
    protected override pathUrl: string = 'leads';

    constructor(override http: HttpClient) {
        super(http);
    }

    /**
     * Obtém todos os leads
     */
    getLeads(): Observable<Lead[]> {
        return this.getAll().pipe(
            map(leads => leads.map(lead => this.normalizeLead(lead)))
        );
    }

    /**
     * Obtém um lead específico por ID
     */
    getLeadById(id: string | number): Observable<Lead> {
        return this.getById(id).pipe(
            map(lead => this.normalizeLead(lead))
        );
    }

    /**
     * Cria um novo lead
     */
    criarLead(lead: Partial<Lead>): Observable<Lead> {
        const novoLead: Partial<Lead> = {
            ...lead,
            status: lead.status || 'novo',
            criadoEm: lead.criadoEm || new Date().toISOString()
        };
        return this.create(novoLead as Lead).pipe(
            map(createdLead => this.normalizeLead(createdLead))
        );
    }

    /**
     * Atualiza um lead existente
     */
    atualizarLead(id: string | number, lead: Partial<Lead>): Observable<Lead> {
        return this.update(id, lead).pipe(
            map(updatedLead => this.normalizeLead(updatedLead))
        );
    }

    /**
     * Aplica uma ação a um lead (workflow)
     */
    aplicarAcao(leadId: string | number, acao: LeadAcao): Observable<Lead> {
        const url = `${this.getFullUrl()}/${leadId}/acoes`;
        return this.http.post<Lead>(url, { acao }).pipe(
            map(lead => this.normalizeLead(lead))
        );
    }

    /**
     * Verifica se uma ação pode ser executada no lead
     * Esta lógica reflete as regras de negócio
     */
    podeExecutarAcao(lead: Lead, acao: LeadAcao): boolean {
        const status = lead.status;

        switch (acao) {
            case 'REGISTRAR_CONTATO':
                return status === 'novo';

            case 'AGENDAR_AVALIACAO':
                return status === 'contatado';

            case 'CONFIRMAR_COMPARECIMENTO':
                return status === 'agendado';

            case 'FALTOU':
                return status === 'agendado';

            case 'CANCELAR':
                return status !== 'convertido' && status !== 'perdido';

            default:
                return false;
        }
    }

    /**
     * Normaliza um lead recebido da API
     * Converte status em maiúsculas para o formato esperado
     */
    private normalizeLead(lead: any): Lead {
        return {
            ...lead,
            status: this.normalizeStatus(lead.status)
        };
    }

    /**
     * Normaliza status recebidos da API que possam estar em formato diferente
     * Suporta: maiúsculas, minúsculas, underscores, e mapeamentos específicos
     */
    private normalizeStatus(value: unknown): LeadStatus {
        if (!value) return 'novo';
        
        const s = String(value).toLowerCase().trim();
        
        // Mapeamento de valores da API para o modelo
        const statusMap: Record<string, LeadStatus> = {
            'novo': 'novo',
            'contatado': 'contatado',
            'agendado': 'agendado',
            'confirmado': 'confirmado',
            'convertido': 'convertido',
            'perdido': 'perdido',
            'faltou': 'faltou',
            // Possíveis variações da API
            'aguardando_avaliacao': 'agendado',
            'em_tratamento': 'convertido',
            'cancelado': 'perdido',
        };
        
        return statusMap[s] || 'novo';
    }
}
