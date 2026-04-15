import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { SessaoService, EstatisticasSessao } from '../../../../shared/service/sessao.service';
import { Sessao, SessaoStatus } from '../../../../shared/models/sessao';
import {
  SESSAO_STATUS_BADGE_CLASS,
  SESSAO_STATUS_FALLBACK_CLASS,
  SESSAO_STATUS_FALLBACK_LABEL,
  SESSAO_STATUS_LABEL,
} from '../../../../shared/constants/sessao-ui.constants';

type SessaoAcao = 'COMPARECEU' | 'FALTOU' | 'CANCELAR' | 'REMARCAR';
type TipoSessao = 'hoje' | 'passada' | 'futura';

interface SessaoComTipo extends Sessao {
  tipo?: TipoSessao;
}

@Component({
  selector: 'app-agenda-sessoes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
  ],
  templateUrl: './agenda-sessoes.html',
  styleUrls: ['./agenda-sessoes.scss'],
})
export class AgendaSessoesComponent {
  private readonly selectedDateSignal = signal(this.todayISO());
  private readonly selectedPeriodoSignal = signal<string>('pendentes');
  private readonly selectedStatusSignal = signal<string>('todas');
  private readonly refreshSessoesTick = signal(0);
  private readonly refreshStatsTick = signal(0);

  readonly sessoesResource = httpResource<Sessao[]>(
    () => {
      this.refreshSessoesTick();

      const periodo = this.selectedPeriodoSignal();
      const status = this.selectedStatusSignal();
      const date = this.selectedDateSignal();
      const params = new URLSearchParams();

      if (periodo === 'custom') {
        if (date) params.set('date', date);
      } else {
        params.set('periodo', periodo);
      }

      if (status !== 'todas') {
        params.set('status', status);
      }

      const query = params.toString();
      return query ? `/api/sessoes?${query}` : '/api/sessoes';
    },
    { defaultValue: [] }
  );

  readonly estatisticasResource = httpResource<EstatisticasSessao>(
    () => {
      this.refreshStatsTick();
      return '/api/sessoes/estatisticas';
    },
    {
      defaultValue: {
        total: 0,
        hoje: 0,
        pendentes: 0,
        marcadas: 0,
        comparecidas: 0,
        faltas: 0,
        canceladas: 0,
        remarcadas: 0,
      },
    }
  );

  readonly sessoes = computed<SessaoComTipo[]>(() =>
    (this.sessoesResource.value() ?? []).map((s) => ({
      ...s,
      status: this.normalizeStatus(s.status),
      tipo: this.calcularTipo(s.dataHora),
    }))
  );

  readonly estatisticas = computed(() => this.estatisticasResource.value());

  get selectedDate(): string {
    return this.selectedDateSignal();
  }

  set selectedDate(value: string) {
    this.selectedDateSignal.set(value);
  }

  get selectedPeriodo(): string {
    return this.selectedPeriodoSignal();
  }

  set selectedPeriodo(value: string) {
    this.selectedPeriodoSignal.set(value);
  }

  get selectedStatus(): string {
    return this.selectedStatusSignal();
  }

  set selectedStatus(value: string) {
    this.selectedStatusSignal.set(value);
  }

  periodos = [
    { value: 'pendentes', label: 'Pendentes (Hoje + Atrasadas)' },
    { value: 'hoje', label: 'Hoje' },
    { value: 'semana', label: 'Esta Semana' },
    { value: 'mes', label: 'Este Mês' },
    { value: 'todos', label: 'Todas' },
    { value: 'custom', label: 'Personalizado' },
  ];

  statusOptions = [
    { value: 'todas', label: 'Todas' },
    { value: 'marcada', label: 'Marcadas' },
    { value: 'remarcada', label: 'Remarcadas' },
    { value: 'aguardando_avaliacao', label: 'Aguardando Avaliação' },
    { value: 'avaliada', label: 'Avaliada' },
    { value: 'compareceu', label: 'Compareceu' },
    { value: 'faltou', label: 'Faltou' },
    { value: 'cancelada', label: 'Canceladas' },
  ];

  constructor(private sessaoService: SessaoService) {}

  carregar(): void {
    this.refreshSessoesTick.update((v) => v + 1);
  }

  carregarEstatisticas(): void {
    this.refreshStatsTick.update((v) => v + 1);
  }

  onPeriodoChange(periodo: string): void {
    this.selectedPeriodo = periodo;
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
  }

  onDateChange(value: string): void {
    this.selectedDate = value;
  }

  pode(acao: SessaoAcao, sessao: Sessao): boolean {
    const s = sessao.status;

    switch (acao) {
      case 'COMPARECEU':
        return s !== 'cancelada';
      case 'FALTOU':
        return s !== 'cancelada';
      case 'REMARCAR':
        return s !== 'cancelada';
      case 'CANCELAR':
        return s !== 'cancelada';
      default:
        return false;
    }
  }

  isAvaliacao(sessao: Sessao): boolean {
    return sessao.tipoSessao === 'avaliacao' || this.isPrimeiraAvaliacao(sessao);
  }

  marcarCompareceuAvaliacao(sessao: Sessao): void {
    if (!sessao.id) return;

    this.sessaoService.marcarCompareceuAvaliacao(sessao.id).subscribe({
      next: () => {
        this.carregar();
        this.carregarEstatisticas();
      },
      error: (err) => console.error('Erro ao marcar compareceu avaliação', err),
    });
  }

  aplicarAcao(sessao: Sessao, acao: SessaoAcao): void {
    if (!sessao.id) return;

    if (acao === 'REMARCAR') {
      const novaIso = this.addOneDay(sessao.dataHora);
      this.sessaoService.remarcar(sessao.id, novaIso).subscribe({
        next: () => {
          this.carregar();
          this.carregarEstatisticas();
        },
        error: (err) => console.error('Erro ao remarcar', err),
      });
      return;
    }

    const call =
      acao === 'COMPARECEU'
        ? this.isPrimeiraAvaliacao(sessao)
          ? this.sessaoService.marcarCompareceuAvaliacao(sessao.id)
          : this.sessaoService.marcarCompareceu(sessao.id)
        : acao === 'FALTOU'
        ? this.sessaoService.marcarFaltou(sessao.id)
        : this.sessaoService.cancelar(sessao.id);

    call.subscribe({
      next: () => {
        this.carregar();
        this.carregarEstatisticas();
      },
      error: (err) => console.error('Erro ao aplicar ação', err),
    });
  }

  getStatusClass(status: SessaoStatus): string {
    return SESSAO_STATUS_BADGE_CLASS[status] ?? SESSAO_STATUS_FALLBACK_CLASS;
  }

  getStatusLabel(status: SessaoStatus): string {
    return SESSAO_STATUS_LABEL[status] ?? SESSAO_STATUS_FALLBACK_LABEL;
  }

  getTipoClass(tipo?: TipoSessao): string {
    switch (tipo) {
      case 'hoje':
        return 'tipo-hoje';
      case 'passada':
        return 'tipo-passada';
      case 'futura':
        return 'tipo-futura';
      default:
        return '';
    }
  }

  getTipoLabel(tipo?: TipoSessao): string {
    switch (tipo) {
      case 'hoje':
        return 'HOJE';
      case 'passada':
        return 'ATRASADA';
      case 'futura':
        return 'FUTURA';
      default:
        return '';
    }
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('pt-BR');
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  private calcularTipo(dataHoraISO: string): TipoSessao {
    const hoje = this.todayISO();
    const dataSessao = dataHoraISO.split('T')[0];

    if (dataSessao === hoje) return 'hoje';
    if (dataSessao < hoje) return 'passada';
    return 'futura';
  }

  private normalizeStatus(value: unknown): SessaoStatus {
    const s = String(value ?? '').toLowerCase();
    const allowed: SessaoStatus[] = [
      'marcada',
      'compareceu',
      'faltou',
      'cancelada',
      'remarcada',
      'aguardando_avaliacao',
      'avaliada',
    ];
    return allowed.includes(s as SessaoStatus) ? (s as SessaoStatus) : 'marcada';
  }

  private todayISO(): string {
    const d = new Date();
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private addOneDay(iso: string): string {
    const d = new Date(iso);
    d.setDate(d.getDate() + 1);
    return d.toISOString();
  }

  private isPrimeiraAvaliacao(sessao: Sessao): boolean {
    const pacienteId = sessao.pacienteId;
    const leadId = sessao.leadId;
    return !pacienteId || !!leadId;
  }
}
