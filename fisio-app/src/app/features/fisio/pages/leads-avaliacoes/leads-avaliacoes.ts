
import { Component, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { Sessao } from '../../../../shared/models/sessao';

@Component({
  selector: 'app-leads-avaliacoes',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './leads-avaliacoes.html',
  styleUrls: ['./leads-avaliacoes.scss'],
})
export class LeadsAvaliacoes {
  constructor(private router: Router) {}

  private readonly sessoesResource = httpResource<Sessao[]>(
    () => '/api/sessoes?periodo=todos',
    { defaultValue: [] }
  );

  readonly avaliacoesPendentes = computed(() => this.mapPendentes(this.sessoesResource.value()));
  readonly pacientesAtivos = computed(() => this.mapPacientesAtivos(this.sessoesResource.value()));
  readonly historicoAvaliacoes = computed(() => this.mapHistorico(this.sessoesResource.value()));

  readonly carregando = computed(() => this.sessoesResource.isLoading());
  readonly erro = computed(() => this.sessoesResource.error());

  iniciarAvaliacao(lead: { id: string; nome: string }): void {
    this.router.navigate(['/avaliacao/form'], {
      queryParams: {
        sessaoId: lead.id,
        paciente: lead.nome,
      },
    });
  }

  registrarEvolucao(paciente: { nome: string }): void {
    this.router.navigate(['/avaliacao/form'], {
      queryParams: {
        paciente: paciente.nome,
        modo: 'evolucao',
      },
    });
  }

  navigateToDashboard(): void {
    this.router.navigate(['/admin']);
  }

  private mapPendentes(
    sessoes: Sessao[]
  ): Array<{ id: string; nome: string; data: Date | null; telefone: string; origem: 'Lead' | 'Paciente'; status: string }> {
    return (sessoes ?? [])
      .filter((s) => {
        const status = this.normalizeText(s.status);
        return status === 'aguardando_avaliacao' || status === 'compareceu';
      })
      .map((s) => ({
        id: String(s.id ?? ''),
        nome: String(s.pacienteNome ?? (s.pacienteId ? `Paciente ${s.pacienteId}` : 'Paciente')).trim(),
        telefone: String(s.pacienteTelefone ?? '-'),
        data: this.parseApiDate(s.dataHora),
        origem: (!s.pacienteId || !!s.leadId ? 'Lead' : 'Paciente') as 'Lead' | 'Paciente',
        status: this.normalizeText(s.status),
      }))
      .filter((p) => !!p.id)
      .sort((a, b) => {
        const ta = a.data?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const tb = b.data?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return ta - tb;
      });
  }

  private mapPacientesAtivos(
    sessoes: Sessao[]
  ): Array<{ nome: string; ultimaSessao: Date | null; proximaSessao: Date | null }> {
    const porPaciente = new Map<string, Date[]>();
    const agora = new Date();

    for (const s of sessoes ?? []) {
      const nome = String(s.pacienteNome ?? '').trim();
      if (!nome) continue;
      if (this.normalizeText(s.status) === 'cancelada') continue;
      if (this.normalizeText(s.tipoSessao) === 'avaliacao') continue;

      const data = this.parseApiDate(s.dataHora);
      if (!data) continue;

      const lista = porPaciente.get(nome) ?? [];
      lista.push(data);
      porPaciente.set(nome, lista);
    }

    return Array.from(porPaciente.entries()).map(([nome, datas]) => {
      datas.sort((a, b) => a.getTime() - b.getTime());
      const ultima = [...datas].reverse().find((d) => d.getTime() <= agora.getTime()) ?? null;
      const proxima = datas.find((d) => d.getTime() >= agora.getTime()) ?? null;
      return { nome, ultimaSessao: ultima, proximaSessao: proxima };
    });
  }

  private mapHistorico(sessoes: Sessao[]): Array<{ paciente: string; data: Date; resumo: string }> {
    return (sessoes ?? [])
      .filter((s) => this.normalizeText(s.tipoSessao) === 'avaliacao' && this.normalizeText(s.status) === 'avaliada')
      .map((s) => ({
        paciente: String(s.pacienteNome ?? 'Paciente').trim(),
        data: this.parseApiDate(s.dataHora) ?? new Date('1970-01-01T00:00:00Z'),
        resumo: 'Avaliação concluída',
      }))
      .filter((h) => !isNaN(h.data.getTime()))
      .sort((a, b) => b.data.getTime() - a.data.getTime());
  }

  private normalizeText(value: unknown): string {
    return String(value ?? '').trim().toLowerCase();
  }

  private parseApiDate(value: unknown): Date | null {
    if (!value) return null;

    const raw = String(value).trim();
    if (!raw) return null;

    const direct = new Date(raw);
    if (!isNaN(direct.getTime())) return direct;

    const br = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (br) {
      const [, dd, mm, yyyy, hh = '00', min = '00', ss = '00'] = br;
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), Number(ss));
      if (!isNaN(d.getTime())) return d;
    }

    const isoLoose = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (isoLoose) {
      const [, yyyy, mm, dd, hh, min, ss = '00'] = isoLoose;
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), Number(ss));
      if (!isNaN(d.getTime())) return d;
    }

    return null;
  }
}
