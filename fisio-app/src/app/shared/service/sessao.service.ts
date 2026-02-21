import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sessao } from '../models/sessao';

export interface FiltrosSessao {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  periodo?: 'hoje' | 'semana' | 'mes' | 'pendentes' | 'todos';
}

export interface EstatisticasSessao {
  total: number;
  hoje: number;
  pendentes: number;
  marcadas: number;
  comparecidas: number;
  faltas: number;
  canceladas: number;
  remarcadas: number;
}

@Injectable({ providedIn: 'root' })
export class SessaoService {
  private readonly baseUrl = '/api/sessoes';

  constructor(private http: HttpClient) {}

  listarPorDia(dateISO: string): Observable<Sessao[]> {
    return this.http.get<Sessao[]>(`${this.baseUrl}?date=${dateISO}`);
  }

  listar(filtros?: FiltrosSessao): Observable<Sessao[]> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.date) params = params.set('date', filtros.date);
      if (filtros.dateFrom) params = params.set('dateFrom', filtros.dateFrom);
      if (filtros.dateTo) params = params.set('dateTo', filtros.dateTo);
      if (filtros.status) params = params.set('status', filtros.status);
      if (filtros.periodo) params = params.set('periodo', filtros.periodo);
    }

    return this.http.get<Sessao[]>(this.baseUrl, { params });
  }

  obterEstatisticas(): Observable<EstatisticasSessao> {
    return this.http.get<EstatisticasSessao>(`${this.baseUrl}/estatisticas`);
  }

  marcarCompareceu(id: string): Observable<Sessao> {
    return this.http.patch<Sessao>(`${this.baseUrl}/${id}/compareceu`, {});
  }

  marcarFaltou(id: string): Observable<Sessao> {
    return this.http.patch<Sessao>(`${this.baseUrl}/${id}/faltou`, {});
  }

  cancelar(id: string): Observable<Sessao> {
    return this.http.patch<Sessao>(`${this.baseUrl}/${id}/cancelar`, {});
  }

  remarcar(id: string, novaDataHoraISO: string): Observable<Sessao> {
    // backend espera Instant, ex: 2026-02-14T14:00:00.000Z
    return this.http.patch<Sessao>(`${this.baseUrl}/${id}/remarcar`, {
      dataHora: novaDataHoraISO,
    });
  }

  // Métodos para workflow de avaliação
  marcarCompareceuAvaliacao(id: string): Observable<Sessao> {
    return this.http.patch<Sessao>(`${this.baseUrl}/${id}/compareceu-avaliacao`, {});
  }

  marcarAvaliada(id: string): Observable<Sessao> {
    return this.http.patch<Sessao>(`${this.baseUrl}/${id}/avaliar`, {});
  }

  listarAguardandoAvaliacao(): Observable<Sessao[]> {
    return this.http.get<Sessao[]>(`${this.baseUrl}/aguardando-avaliacao`);
  }


}
