import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { LeadService, LeadAcao } from '../../../../shared/service/lead.service';
import { Lead, LeadStatus, LeadHelper } from '../../../../shared/models/lead';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { ModalCadastroComponent } from '../../../home/components/modal-cadastro/modal-cadastro.component';
import { ModalAgendarAvaliacaoComponent } from '../../../agenda/components/modal-agendar-avaliacao/modal-agendar-avaliacao.component';
import {
  getStatusLabel,
  getStatusClass,
} from '../../../../shared/constants/lead-ui.constants';

@Component({
  selector: 'app-leads-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    ModalCadastroComponent,
    ModalAgendarAvaliacaoComponent,
  ],
  templateUrl: './leads-list.html',
  styleUrls: ['./leads-list.scss'],
})
export class LeadsList implements OnInit {
  leads: Lead[] = [];
  isCadastroManualOpen = false;
  isLoading = false;
  leadSelecionadoParaAgendar?: Lead;
  isAgendarModalOpen = false;
  constructor(
    private router: Router,
    private leadService: LeadService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.carregarLeads();
  }

  private carregarLeads(): void {
    this.isLoading = true;

    this.leadService.getLeadsAtivos().subscribe({
      next: (leads) => {
        this.leads = [...leads]; // Cria nova referência
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.handleError('Erro ao buscar leads', err);
        this.cdr.markForCheck();
      },
    });
  }

  abrirModalAgendamento(lead: Lead): void {
    this.leadSelecionadoParaAgendar = lead;
    this.isAgendarModalOpen = true;
  }

  fecharModalAgendamento(): void {
    this.isAgendarModalOpen = false;
    this.leadSelecionadoParaAgendar = undefined;
  }

  onConfirmarAgendamento(evento: { data: string; hora: string; observacao?: string }): void {
    if (!this.leadSelecionadoParaAgendar?.id) return;

    const payload = {
      dataHora: `${evento.data}T${evento.hora}:00`,
      observacao: evento.observacao
    };

    this.leadService.agendarAvaliacao(this.leadSelecionadoParaAgendar.id, payload).subscribe({
      next: () => {
        this.carregarLeads();
        this.fecharModalAgendamento(); // ✅ aqui fecha
      },
      error: (err) => console.error('Erro ao agendar avaliação', err),
    });
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
  }

  onSelectLead(lead: Lead): void {
    this.router.navigate(['/avaliacao'], { queryParams: { nome: lead.nome } });
  }

  private toInstantISO(date: string, time: string): string {
    // date: "2026-02-14", time: "14:00"
    // transforma em ISO Z (UTC)
    const local = new Date(`${date}T${time}:00`);
    return local.toISOString();
  }

  pode(acao: LeadAcao, lead: Lead): boolean {
    return this.leadService.podeExecutarAcao(lead, acao);
  }

  aplicarAcao(lead: Lead, acao: LeadAcao): void {
    if (!lead.id) return;

    this.leadService.aplicarAcao(lead.id, acao).subscribe({
      next: (updated) => {
        this.atualizarLeadNaLista(updated);
        this.cdr.markForCheck();
      },
      error: (err) => this.handleError('Erro ao aplicar ação', err),
    });
  }

  private atualizarLeadNaLista(updated: Lead): void {
    this.leads = this.leads.map((l) =>
      String(l.id) === String(updated.id) ? updated : l
    );
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR');
  }

  getInitial(name: string): string {
    return (name?.charAt(0) ?? '').toUpperCase();
  }

  getStatusClass(status: LeadStatus): string {
    return getStatusClass(status);
  }

  getStatusLabel(status: LeadStatus): string {
    return getStatusLabel(status);
  }

  trackById(_index: number, lead: Lead): string | number | undefined {
    return lead.id ?? _index;
  }

  abrirCadastroManual(): void {
    this.isCadastroManualOpen = true;
  }

  fecharCadastroManual(): void {
    this.isCadastroManualOpen = false;
  }

  excluirLead(lead: Lead): void {
    if (!lead.id) return; 
    if (!confirm(`Tem certeza que deseja excluir o lead "${LeadHelper.getNomeCompleto(lead)}"?`)) return;

    this.leadService.excluir(lead.id).subscribe({
      next: () => {
        this.leads = this.leads.filter(l => l.id !== lead.id);
        this.cdr.markForCheck();
      },
      error: (err) => this.handleError('Erro ao excluir lead', err),
    });
  }


onCadastroManual(event: { action: 'criar-lead' | string; value?: Partial<Lead>; agendarAgora?: boolean }): void {
  if (event.action !== 'criar-lead' || !event.value) return;

  this.leadService.criarLead(event.value as Lead).subscribe({
    next: (novo) => {
      this.leads = [novo, ...this.leads];
      this.fecharCadastroManual();

      // ✅ Só abre se marcou a opção
      if (event.agendarAgora) {
        this.abrirModalAgendamento(novo);
      }

      this.cdr.markForCheck();
    },
    error: (err) => this.handleError('Erro ao criar lead manual', err),
  });
}



}
