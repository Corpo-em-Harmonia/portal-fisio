import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildApiUrl, API_CONFIG } from '../../core/config/api.config';

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AgendamentoRequest {
  leadId?: number;
  pacienteId?: number;
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm
  observacao?: string;
}

export interface AgendamentoResponse {
  id: number;
  leadId?: number;
  pacienteId?: number;
  data: string;
  hora: string;
  observacao?: string;
  status: 'agendado' | 'realizado' | 'cancelado';
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  constructor(private http: HttpClient) {}

  /**
   * Busca horários disponíveis para uma data específica
   */
  getHorariosDisponiveis(date: string): Observable<TimeSlot[]> {
    const url = buildApiUrl(API_CONFIG.endpoints.agendamentos, 'disponibilidade');
    return this.http.get<TimeSlot[]>(url, {
      params: { date }
    });
  }

  /**
   * Cria um novo agendamento
   */
  criarAgendamento(agendamento: AgendamentoRequest): Observable<AgendamentoResponse> {
    const url = buildApiUrl(API_CONFIG.endpoints.agendamentos);
    return this.http.post<AgendamentoResponse>(url, agendamento);
  }

  /**
   * Lista todos os agendamentos
   */
  listarAgendamentos(): Observable<AgendamentoResponse[]> {
    const url = buildApiUrl(API_CONFIG.endpoints.agendamentos);
    return this.http.get<AgendamentoResponse[]>(url);
  }

  /**
   * Cancela um agendamento
   */
  cancelarAgendamento(id: number): Observable<void> {
    const url = buildApiUrl(API_CONFIG.endpoints.agendamentos, id);
    return this.http.delete<void>(url);
  }
}
