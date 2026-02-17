import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sessao } from '../models/sessao';

@Injectable({ providedIn: 'root' })
export class SessaoService {
  private readonly baseUrl = '/api/sessoes';

  constructor(private http: HttpClient) {}

  listarPorDia(dateISO: string): Observable<Sessao[]> {
    return this.http.get<Sessao[]>(`${this.baseUrl}?date=${dateISO}`);
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
}
