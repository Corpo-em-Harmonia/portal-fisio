import { Component, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { httpResource } from '@angular/common/http';

import {
  LeadService,
  LeadAcao,
  AgendarAvaliacaoRequest,
} from '../../../../shared/service/lead.service';
import { Lead, LeadStatus, LeadHelper } from '../../../../shared/models/lead';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { ModalCadastroComponent } from '../../../home/components/modal-cadastro/modal-cadastro.component';
import {
  ModalAgendarAvaliacaoComponent,
  ConfirmarAgendamentoPayload,
} from '../../../agenda/components/modal-agendar-avaliacao/modal-agendar-avaliacao.component';
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
export class LeadsList {
  private readonly refreshLeadsTick = signal(0);

  readonly leadsResource = httpResource<Lead[]>(
    () => {
      this.refreshLeadsTick();
      return '/api/leads?ativos=true';
    },
    { defaultValue: [] }
  );

  readonly leads = computed(() => this.leadsResource.value() ?? []);
  readonly isCadastroManualOpen = signal(false);
  readonly isLoading = computed(() => this.leadsResource.isLoading());
  readonly leadSelecionadoParaAgendar = signal<Lead | undefined>(undefined);
  readonly isAgendarModalOpen = signal(false);

  constructor(
    private router: Router,
    private leadService: LeadService
  ) { }

  private recarregarLeads(): void {
    this.refreshLeadsTick.update((v) => v + 1);
  }

  abrirModalAgendamento(lead: Lead): void {
    this.leadSelecionadoParaAgendar.set(lead);
    this.isAgendarModalOpen.set(true);
  }

  fecharModalAgendamento(): void {
    this.isAgendarModalOpen.set(false);
    this.leadSelecionadoParaAgendar.set(undefined);
  }

  onConfirmarAgendamento(evento: ConfirmarAgendamentoPayload): void {
    const leadSelecionado = this.leadSelecionadoParaAgendar();
    if (!leadSelecionado?.id) return;

    const payload: AgendarAvaliacaoRequest = {
      dataHora: `${evento.data}T${evento.hora}:00`,
      observacao: evento.observacao,
      modoAgendamento: evento.modoAgendamento,
      frequenciaSemanal: evento.frequenciaSemanal,
      quantidadeSessoes: evento.quantidadeSessoes,
      validadeGuiaDias: evento.validadeGuiaDias,
      diasSemanaPreferidos: evento.diasSemanaPreferidos,
    };

    this.leadService.agendarAvaliacao(leadSelecionado.id, payload).subscribe({
      next: () => {
        this.recarregarLeads();
        this.fecharModalAgendamento(); // ✅ aqui fecha
      },
      error: (err) => {
        const codigo = String(err?.error?.codigo ?? '');
        if (codigo === 'PLANO_FORA_DA_VALIDADE') {
          const detalhes = err?.error?.detalhes ?? {};
          const duracao = detalhes?.duracaoDias;
          const validade = detalhes?.validadeGuiaDias;
          const freq = detalhes?.frequenciaMinimaSugerida;
          const mensagem = [
            'Plano fora da validade da guia.',
            duracao ? `Duração estimada: ${duracao} dias.` : '',
            validade ? `Validade da guia: ${validade} dias.` : '',
            freq ? `Sugestão: pelo menos ${freq} sessões por semana.` : '',
          ]
            .filter(Boolean)
            .join('\n');

          window.alert(mensagem);
          return;
        }

        const mensagem = String(err?.error?.mensagem ?? 'Erro ao agendar avaliação.');
        window.alert(mensagem);
        console.error('Erro ao agendar avaliação', err);
      },
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
      next: () => {
        this.recarregarLeads();
      },
      error: (err) => this.handleError('Erro ao aplicar ação', err),
    });
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
    this.isCadastroManualOpen.set(true);
  }

  fecharCadastroManual(): void {
    this.isCadastroManualOpen.set(false);
  }

  excluirLead(lead: Lead): void {
    if (!lead.id) return; 
    if (!confirm(`Tem certeza que deseja excluir o lead "${LeadHelper.getNomeCompleto(lead)}"?`)) return;

    this.leadService.excluir(lead.id).subscribe({
      next: () => {
        this.recarregarLeads();
      },
      error: (err) => this.handleError('Erro ao excluir lead', err),
    });
  }


onCadastroManual(event: { action: 'criar-lead' | string; value?: Partial<Lead>; agendarAgora?: boolean }): void {
  if (event.action !== 'criar-lead' || !event.value) return;

  this.leadService.criarLead(event.value as Lead).subscribe({
    next: (novo) => {
      this.recarregarLeads();
      this.fecharCadastroManual();

      // ✅ Só abre se marcou a opção
      if (event.agendarAgora) {
        this.abrirModalAgendamento(novo);
      }
    },
    error: (err) => this.handleError('Erro ao criar lead manual', err),
  });
}



}
