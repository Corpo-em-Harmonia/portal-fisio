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
  private readonly selectedPacienteQuerySignal = signal('');
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

  readonly sessoesBase = computed<SessaoComTipo[]>(() =>
    (this.sessoesResource.value() ?? []).map((s) => ({
      ...s,
      status: this.normalizeStatus(s.status),
      tipo: this.calcularTipo(s.dataHora),
    }))
  );

  readonly sessoes = computed<SessaoComTipo[]>(() => {
    const query = this.normalizeText(this.selectedPacienteQuerySignal());
    const base = this.sessoesBase();
    if (!query) return base;

    return base.filter((s) => {
      const cpf = String((s as unknown as Record<string, unknown>)['pacienteCpf'] ?? '');
      const nome = String(s.pacienteNome ?? '');
      const telefone = String(s.pacienteTelefone ?? '');
      const id = String(s.pacienteId ?? '');
      const blob = this.normalizeText(`${nome} ${telefone} ${cpf} ${id}`);
      return blob.includes(query);
    });
  });

  readonly pacientesSemProximaSessao = computed<
    Array<{ pacienteId: string; nome: string; telefone: string; ultimaSessao: string }>
  >(() => {
    const agora = new Date();
    const porPaciente = new Map<
      string,
      { nome: string; telefone: string; temFuturo: boolean; ultimaSessao: Date | null }
    >();

    for (const s of this.sessoesBase()) {
      const pacienteId = String(s.pacienteId ?? '').trim();
      const nome = String(s.pacienteNome ?? '').trim();
      if (!pacienteId || !nome) continue;
      if (s.status === 'cancelada') continue;

      const data = new Date(s.dataHora);
      if (isNaN(data.getTime())) continue;

      const atual = porPaciente.get(pacienteId) ?? {
        nome,
        telefone: String(s.pacienteTelefone ?? '-'),
        temFuturo: false,
        ultimaSessao: null,
      };

      if (data > agora) {
        atual.temFuturo = true;
      } else if (!atual.ultimaSessao || data > atual.ultimaSessao) {
        atual.ultimaSessao = data;
      }

      porPaciente.set(pacienteId, atual);
    }

    return Array.from(porPaciente.entries())
      .filter(([, v]) => !v.temFuturo && !!v.ultimaSessao)
      .map(([pacienteId, v]) => ({
        pacienteId,
        nome: v.nome,
        telefone: v.telefone,
        ultimaSessao: v.ultimaSessao?.toISOString() ?? '',
      }))
      .sort((a, b) => (a.ultimaSessao < b.ultimaSessao ? 1 : -1));
  });

  readonly estatisticas = computed(() => this.estatisticasResource.value());

  isRemarcarModalOpen = false;
  sessaoSelecionadaParaRemarcar: Sessao | null = null;
  novaDataRemarcacao = '';
  novaHoraRemarcacao = '';

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

  get selectedPacienteQuery(): string {
    return this.selectedPacienteQuerySignal();
  }

  set selectedPacienteQuery(value: string) {
    this.selectedPacienteQuerySignal.set(value);
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

  onPacienteQueryChange(value: string): void {
    this.selectedPacienteQuery = value;
  }

  aplicarFiltroPaciente(value: string): void {
    this.selectedPacienteQuery = value;
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
      this.abrirModalRemarcacao(sessao);
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

  getAgendamentoLabel(sessao: Sessao): string {
    if (sessao.serieId) {
      return `Recorrente${sessao.numeroOcorrencia ? ` #${sessao.numeroOcorrencia}` : ''}`;
    }
    return 'Avulso';
  }

  getAgendamentoClass(sessao: Sessao): string {
    return sessao.serieId ? 'tag-recorrente' : 'tag-avulso';
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

  abrirModalRemarcacao(sessao: Sessao): void {
    const atual = new Date(sessao.dataHora);
    if (isNaN(atual.getTime())) {
      window.alert('Não foi possível abrir edição: data atual inválida.');
      return;
    }

    this.sessaoSelecionadaParaRemarcar = sessao;
    this.novaDataRemarcacao = this.toDateInputValue(atual);
    this.novaHoraRemarcacao = this.toTimeInputValue(atual);
    this.isRemarcarModalOpen = true;
  }

  fecharModalRemarcacao(): void {
    this.isRemarcarModalOpen = false;
    this.sessaoSelecionadaParaRemarcar = null;
    this.novaDataRemarcacao = '';
    this.novaHoraRemarcacao = '';
  }

  confirmarRemarcacao(): void {
    const sessao = this.sessaoSelecionadaParaRemarcar;
    if (!sessao?.id) return;

    const combinada = new Date(`${this.novaDataRemarcacao}T${this.novaHoraRemarcacao}:00`);
    if (isNaN(combinada.getTime())) {
      window.alert('Data ou horário inválidos.');
      return;
    }

    if (this.isWeekend(combinada)) {
      window.alert('Sábado e domingo estão bloqueados para agendamento/remarcação.');
      return;
    }

    // Remarcação sempre manual por sessão para dar controle total para a recepção.
    this.sessaoService.remarcar(sessao.id, combinada.toISOString(), 'somente_esta').subscribe({
      next: () => {
        this.carregar();
        this.carregarEstatisticas();
        this.fecharModalRemarcacao();
      },
      error: (err) => {
        console.error('Erro ao remarcar', err);
        const mensagem = String(err?.error?.mensagem ?? 'Não foi possível remarcar a sessão.');
        window.alert(mensagem);
      },
    });
  }

  private toDateInputValue(date: Date): string {
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private toTimeInputValue(date: Date): string {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private normalizeText(value: unknown): string {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  private isPrimeiraAvaliacao(sessao: Sessao): boolean {
    const pacienteId = sessao.pacienteId;
    const leadId = sessao.leadId;
    return !pacienteId || !!leadId;
  }
}
