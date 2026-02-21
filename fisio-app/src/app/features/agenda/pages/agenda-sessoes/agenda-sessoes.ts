import { Component, OnInit } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { SessaoService, FiltrosSessao, EstatisticasSessao } from '../../../../shared/service/sessao.service';
import { Sessao, SessaoStatus, TipoSessao as TipoSessaoModel } from '../../../../shared/models/sessao';
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
export class AgendaSessoesComponent implements OnInit {
  sessoes: SessaoComTipo[] = [];
  selectedDate = this.todayISO();
  selectedPeriodo: string = 'pendentes';
  selectedStatus: string = 'todas';
  
  estatisticas: EstatisticasSessao = {
    total: 0,
    hoje: 0,
    pendentes: 0,
    marcadas: 0,
    comparecidas: 0,
    faltas: 0,
    canceladas: 0,
    remarcadas: 0,
  };

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

  ngOnInit(): void {
    console.log('🔄 AgendaSessoesComponent - Iniciando carregamento...');
    this.carregar();
    this.carregarEstatisticas();
  }

  carregar(): void {
    const filtros: FiltrosSessao = {};

    if (this.selectedPeriodo === 'custom') {
      filtros.date = this.selectedDate;
    } else {
      filtros.periodo = this.selectedPeriodo as any;
    }

    if (this.selectedStatus !== 'todas') {
      filtros.status = this.selectedStatus;
    }

    console.log('📊 Carregando sessões com filtros:', filtros);

    this.sessaoService.listar(filtros).subscribe({
      next: (dados) => {
        console.log('✅ Sessões recebidas:', dados?.length || 0, 'registros');
        this.sessoes = (dados ?? []).map((s) => ({
          ...s,
          status: this.normalizeStatus(s.status),
          tipo: this.calcularTipo(s.dataHora),
        }));
        console.log('✅ Sessões processadas:', this.sessoes);
      },
      error: (err) => {
        console.error('❌ Erro ao buscar sessões:', err);
        console.error('❌ Status:', err.status);
        console.error('❌ Message:', err.message);
      },
    });
  }

  carregarEstatisticas(): void {
    console.log('📈 Carregando estatísticas...');
    this.sessaoService.obterEstatisticas().subscribe({
      next: (stats) => {
        console.log('✅ Estatísticas recebidas:', stats);
        this.estatisticas = stats;
      },
      error: (err) => {
        console.error('❌ Erro ao buscar estatísticas:', err);
        console.error('❌ Status:', err.status);
      },
    });
  }

  onPeriodoChange(periodo: string): void {
    this.selectedPeriodo = periodo;
    this.carregar();
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.carregar();
  }

  onDateChange(value: string): void {
    this.selectedDate = value;
    if (this.selectedPeriodo === 'custom') {
      this.carregar();
    }
  }

  pode(acao: SessaoAcao, sessao: Sessao): boolean {
    const s = sessao.status;

    switch (acao) {
      case 'COMPARECEU':
        // Para avaliações, usa endpoint diferente (compareceu-avaliacao)
        // Para sessões normais, pode marcar compareceu se não está cancelada
        return s !== 'cancelada';

      case 'FALTOU':
        // Pode marcar falta se não está cancelada
        return s !== 'cancelada';

      case 'REMARCAR':
        // Pode remarcar qualquer status (exceto cancelada)
        // Mesmo que faltou, pode remarcar na mesma semana
        return s !== 'cancelada';

      case 'CANCELAR':
        // Pode cancelar qualquer uma (menos já cancelada)
        return s !== 'cancelada';

      default:
        return false;
    }
  }

  isAvaliacao(sessao: Sessao): boolean {
    return sessao.tipoSessao === 'avaliacao';
  }

  marcarCompareceuAvaliacao(sessao: Sessao): void {
    if (!sessao.id) return;
    
    this.sessaoService.marcarCompareceuAvaliacao(sessao.id).subscribe({
      next: (updated) => {
        this.updateRow(updated);
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
        next: (updated) => {
          this.updateRow(updated);
          this.carregarEstatisticas();
        },
        error: (err) => console.error('Erro ao remarcar', err),
      });
      return;
    }

    const call =
      acao === 'COMPARECEU'
        ? this.sessaoService.marcarCompareceu(sessao.id)
        : acao === 'FALTOU'
        ? this.sessaoService.marcarFaltou(sessao.id)
        : this.sessaoService.cancelar(sessao.id);

    call.subscribe({
      next: (updated) => {
        this.updateRow(updated);
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

  formatDateTime(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
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

  private updateRow(updated: Sessao): void {
    const normalized: SessaoComTipo = {
      ...updated,
      status: this.normalizeStatus(updated.status),
      tipo: this.calcularTipo(updated.dataHora),
    };
    this.sessoes = this.sessoes.map((s) => (s.id === normalized.id ? normalized : s));
  }

  private normalizeStatus(value: unknown): SessaoStatus {
    const s = String(value ?? '').toLowerCase();
    const allowed: SessaoStatus[] = ['marcada', 'compareceu', 'faltou', 'cancelada', 'remarcada', 'aguardando_avaliacao', 'avaliada'];
    return (allowed.includes(s as SessaoStatus) ? (s as SessaoStatus) : 'marcada');
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
}
