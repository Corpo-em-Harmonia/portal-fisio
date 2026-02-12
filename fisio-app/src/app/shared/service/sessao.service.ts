import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sessao } from '../models/sessao';

@Injectable({ providedIn: 'root' })
export class SessaoService {
  private baseUrl = 'http://localhost:8080/api/sessoes'; // ajuste

  constructor(private http: HttpClient) {}

  listarPorDia(date: string): Observable<Sessao[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<Sessao[]>(this.baseUrl, { params });
  }

  marcarCompareceu(id: string): Observable<Sessao> {
    return this.http.post<Sessao>(`${this.baseUrl}/${id}/compareceu`, {});
  }

  marcarFaltou(id: string): Observable<Sessao> {
    return this.http.post<Sessao>(`${this.baseUrl}/${id}/faltou`, {});
  }

  cancelar(id: string): Observable<Sessao> {
    return this.http.post<Sessao>(`${this.baseUrl}/${id}/cancelar`, {});
  }

  remarcar(id: string, novaDataHoraIso: string): Observable<Sessao> {
    const params = new HttpParams().set('novaDataHoraIso', novaDataHoraIso);
    return this.http.post<Sessao>(`${this.baseUrl}/${id}/remarcar`, {}, { params });
  }
}
