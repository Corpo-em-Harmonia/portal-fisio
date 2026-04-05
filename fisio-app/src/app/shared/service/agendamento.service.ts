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
      params: { date } // <-- era "data"
    });
  }

  /**
   * Cria um novo agendamento
   */
  criarAgendamento(agendamento: AgendamentoRequest): Observable<any> {
    const url = buildApiUrl(API_CONFIG.endpoints.agendamentos);
    return this.http.post(url, agendamento);
  }

  /**
   * Lista todos os agendamentos
   */
  listarAgendamentos(): Observable<any[]> {
    const url = buildApiUrl(API_CONFIG.endpoints.agendamentos);
    return this.http.get<any[]>(url);
  }

  /**
   * Cancela um agendamento
   */
  cancelarAgendamento(id: number): Observable<void> {
    const url = buildApiUrl(API_CONFIG.endpoints.agendamentos, id);
    return this.http.delete<void>(url);
  }
}
