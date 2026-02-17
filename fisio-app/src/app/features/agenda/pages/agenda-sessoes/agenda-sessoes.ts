import { Component, OnInit } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SessaoService } from '../../../../shared/service/sessao.service';
import { Sessao, SessaoStatus } from '../../../../shared/models/sessao';
import {
  SESSAO_STATUS_BADGE_CLASS,
  SESSAO_STATUS_FALLBACK_CLASS,
  SESSAO_STATUS_FALLBACK_LABEL,
  SESSAO_STATUS_LABEL,
} from '../../../../shared/constants/sessao-ui.constants';

type SessaoAcao = 'COMPARECEU' | 'FALTOU' | 'CANCELAR' | 'REMARCAR';

@Component({
  selector: 'app-agenda-sessoes',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './agenda-sessoes.html',
  styleUrls: ['./agenda-sessoes.scss'],
})
export class AgendaSessoesComponent implements OnInit {
  sessoes: Sessao[] = [];
  selectedDate = this.todayISO();

  constructor(private sessaoService: SessaoService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.sessaoService.listarPorDia(this.selectedDate).subscribe({
      next: (dados) => {
        this.sessoes = (dados ?? []).map((s) => ({
          ...s,
          status: this.normalizeStatus(s.status),
        }));
      },
      error: (err) => console.error('Erro ao buscar sessões', err),
    });
  }

  onDateChange(value: string): void {
    this.selectedDate = value;
    this.carregar();
  }

  pode(acao: SessaoAcao, sessao: Sessao): boolean {
    const s = sessao.status;

    switch (acao) {
      case 'COMPARECEU':
      case 'FALTOU':
        return s === 'marcada' || s === 'remarcada';

      case 'REMARCAR':
        return s !== 'cancelada' && s !== 'compareceu';

      case 'CANCELAR':
        return s !== 'cancelada' && s !== 'compareceu';

      default:
        return false;
    }
  }

  aplicarAcao(sessao: Sessao, acao: SessaoAcao): void {
    if (!sessao.id) return;

    if (acao === 'REMARCAR') {
      const novaIso = this.addOneDay(sessao.dataHora);
      this.sessaoService.remarcar(sessao.id, novaIso).subscribe({
        next: (updated) => this.updateRow(updated),
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
      next: (updated) => this.updateRow(updated),
      error: (err) => console.error('Erro ao aplicar ação', err),
    });
  }

  getStatusClass(status: SessaoStatus): string {
    return SESSAO_STATUS_BADGE_CLASS[status] ?? SESSAO_STATUS_FALLBACK_CLASS;
  }

  getStatusLabel(status: SessaoStatus): string {
    return SESSAO_STATUS_LABEL[status] ?? SESSAO_STATUS_FALLBACK_LABEL;
  }

  formatDateTime(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

  private updateRow(updated: Sessao): void {
    const normalized: Sessao = {
      ...updated,
      status: this.normalizeStatus(updated.status),
    };
    this.sessoes = this.sessoes.map((s) => (s.id === normalized.id ? normalized : s));
  }

  private normalizeStatus(value: unknown): SessaoStatus {
    const s = String(value ?? '').toLowerCase();
    const allowed: SessaoStatus[] = ['marcada', 'compareceu', 'faltou', 'cancelada', 'remarcada'];
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
