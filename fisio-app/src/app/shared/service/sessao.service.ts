import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sessao } from '../models/sessao';
import { BaseService } from '../../core/services/base.service';

@Injectable({ providedIn: 'root' })
export class SessaoService extends BaseService<Sessao> {
  protected override pathUrl = 'sessoes';

  constructor(override http: HttpClient) {
    super(http);
  }

  listarPorDia(date: string): Observable<Sessao[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<Sessao[]>(this.getFullUrl(), { params });
  }

  marcarCompareceu(id: string): Observable<Sessao> {
    return this.http.post<Sessao>(`${this.getFullUrl()}/${id}/compareceu`, {});
  }

  marcarFaltou(id: string): Observable<Sessao> {
    return this.http.post<Sessao>(`${this.getFullUrl()}/${id}/faltou`, {});
  }

  cancelar(id: string): Observable<Sessao> {
    return this.http.post<Sessao>(`${this.getFullUrl()}/${id}/cancelar`, {});
  }

  remarcar(id: string, novaDataHoraIso: string): Observable<Sessao> {
    const params = new HttpParams().set('novaDataHoraIso', novaDataHoraIso);
    return this.http.post<Sessao>(`${this.getFullUrl()}/${id}/remarcar`, {}, { params });
  }
}
