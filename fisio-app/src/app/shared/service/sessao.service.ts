import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Sessao } from '../models/sessao';
import {
  FisioFilaItem,
  FisioPacienteAtivoItem,
  FisioHistoricoAvaliacaoItem,
} from '../models/fisio-workflow';

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
  private readonly avaliacoesBaseUrl = '/api/avaliacoes';
  private readonly pacientesBaseUrl = '/api/pacientes';

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

  listarFilaAvaliacaoFisio(): Observable<FisioFilaItem[]> {
    return this.http.get<unknown>(`${this.avaliacoesBaseUrl}/pendentes`).pipe(
      map((payload) => this.mapPendentesPayload(this.extractList(payload))),
      catchError(() =>
        this.listarAguardandoAvaliacao().pipe(
          map((sessoes) => this.mapSessoesToFila(sessoes ?? []))
        )
      )
    );
  }

  listarPacientesAtivosFisio(): Observable<FisioPacienteAtivoItem[]> {
    return this.http.get<unknown>(`${this.pacientesBaseUrl}/ativos`).pipe(
      map((payload) => {
        return this.extractList(payload).map((row) => {
          const r = this.asRecord(row);
          return {
            nome: String(r['nome'] ?? r['paciente'] ?? '').trim(),
            ultimaSessao: (r['ultimaSessao'] ?? r['ultima_sessao'] ?? null) as string | null,
            proximaSessao: (r['proximaSessao'] ?? r['proxima_sessao'] ?? null) as string | null,
          };
        }).filter((item) => !!item.nome);
      }),
      catchError(() =>
        this.listar({ periodo: 'todos' }).pipe(
          map((sessoes) => this.mapSessoesToPacientesAtivos(sessoes ?? []))
        )
      )
    );
  }

  listarHistoricoAvaliacoesFisio(): Observable<FisioHistoricoAvaliacaoItem[]> {
    return this.http.get<unknown>(`${this.avaliacoesBaseUrl}/historico`).pipe(
      map((payload) => {
        return this.extractList(payload).map((row) => {
          const r = this.asRecord(row);
          return {
            paciente: String(r['paciente'] ?? r['nome'] ?? 'Paciente'),
            data: String(r['data'] ?? r['dataHora'] ?? r['data_hora'] ?? ''),
            resumo: String(r['resumo'] ?? 'Avaliação concluída'),
          };
        }).filter((item) => !!item.data);
      }),
      catchError(() =>
        this.listar({ periodo: 'todos' }).pipe(
          map((sessoes) =>
            (sessoes ?? [])
              .filter((s) => {
                const tipoSessao = this.normalizeText(s.tipoSessao);
                const status = this.normalizeText(s.status);
                return tipoSessao === 'avaliacao' && status === 'avaliada' && !!s.pacienteNome;
              })
              .map((s) => ({
                paciente: String(s.pacienteNome),
                data: s.dataHora,
                resumo: 'Avaliação concluída',
              }))
          )
        )
      )
    );
  }

  private mapPendentesPayload(rows: unknown[] | null | undefined): FisioFilaItem[] {
    const list = rows ?? [];
    return list
      .map((row) => {
        const r = this.asRecord(row);
        return {
          idSessao: String(r['idSessao'] ?? r['sessaoId'] ?? r['id_sessao'] ?? r['id'] ?? ''),
          idLead: (r['idLead'] ?? r['leadId'] ?? r['id_lead'] ?? null) as string | null,
          idPaciente: (r['idPaciente'] ?? r['pacienteId'] ?? r['id_paciente'] ?? null) as string | null,
          nome: String(r['nome'] ?? r['pacienteNome'] ?? 'Paciente').trim(),
          telefone: String(r['telefone'] ?? r['pacienteTelefone'] ?? '-'),
          dataHora: String(r['dataHora'] ?? r['data_hora'] ?? r['data'] ?? ''),
          status: String(r['status'] ?? 'aguardando_avaliacao'),
          origem: (String(r['origem'] ?? '').toUpperCase() === 'PACIENTE' ? 'PACIENTE' : 'LEAD') as
            | 'LEAD'
            | 'PACIENTE',
        };
      })
      .filter((item) => !!item.idSessao && !!item.dataHora);
  }

  private extractList(payload: unknown): unknown[] {
    if (Array.isArray(payload)) return payload;

    const record = this.asRecord(payload);
    const maybeList =
      record['content'] ??
      record['items'] ??
      record['data'] ??
      record['result'] ??
      record['rows'];

    return Array.isArray(maybeList) ? maybeList : [];
  }

  private mapSessoesToFila(sessoes: Sessao[]): FisioFilaItem[] {
    return (sessoes ?? [])
      .filter((s) => {
        const status = this.normalizeText(s.status);
        return status === 'aguardando_avaliacao' || status === 'compareceu';
      })
      .map((s) => {
        const isLead = !s.pacienteId || !!s.leadId;
        return {
          idSessao: String(s.id),
          idLead: s.leadId ?? null,
          idPaciente: s.pacienteId ?? null,
          nome: String(s.pacienteNome ?? (s.pacienteId ? `Paciente ${s.pacienteId}` : 'Paciente')).trim(),
          telefone: String(s.pacienteTelefone ?? '-'),
          dataHora: s.dataHora,
          status: this.normalizeText(s.status),
          origem: isLead ? 'LEAD' : 'PACIENTE',
        };
      });
  }

  private mapSessoesToPacientesAtivos(sessoes: Sessao[]): FisioPacienteAtivoItem[] {
    const porPaciente = new Map<string, Date[]>();
    const agora = new Date();

    for (const s of sessoes) {
      const nome = String(s.pacienteNome ?? '').trim();
      if (!nome || s.status === 'cancelada' || s.tipoSessao === 'avaliacao') continue;
      const d = new Date(s.dataHora);
      if (isNaN(d.getTime())) continue;
      const lista = porPaciente.get(nome) ?? [];
      lista.push(d);
      porPaciente.set(nome, lista);
    }

    return Array.from(porPaciente.entries()).map(([nome, datas]) => {
      datas.sort((a, b) => a.getTime() - b.getTime());
      const ultima = [...datas].reverse().find((d) => d.getTime() <= agora.getTime()) ?? null;
      const proxima = datas.find((d) => d.getTime() >= agora.getTime()) ?? null;
      return {
        nome,
        ultimaSessao: ultima ? ultima.toISOString() : null,
        proximaSessao: proxima ? proxima.toISOString() : null,
      };
    });
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  }

  private normalizeText(value: unknown): string {
    return String(value ?? '').trim().toLowerCase();
  }


}
