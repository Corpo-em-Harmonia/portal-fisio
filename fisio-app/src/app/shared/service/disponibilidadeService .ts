import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DisponibilidadeItem {
  time: string;      // "08:00"
  available: boolean;
}

@Injectable({ providedIn: 'root' })
export class DisponibilidadeService {
  private readonly baseUrl = '/api/agendamentos';

  constructor(private http: HttpClient) {}

  getDisponibilidade(dateISO: string): Observable<DisponibilidadeItem[]> {
    return this.http.get<DisponibilidadeItem[]>(`${this.baseUrl}/disponibilidade?date=${dateISO}`);
  }
}
