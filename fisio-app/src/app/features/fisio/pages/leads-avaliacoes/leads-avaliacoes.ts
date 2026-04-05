
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SessaoService } from '../../../../shared/service/sessao.service';
import {
  FisioFilaItem,
  FisioPacienteAtivoItem,
  FisioHistoricoAvaliacaoItem,
} from '../../../../shared/models/fisio-workflow';

@Component({
  selector: 'app-leads-avaliacoes',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './leads-avaliacoes.html',
  styleUrls: ['./leads-avaliacoes.scss'],
})
export class LeadsAvaliacoes implements OnInit {
  constructor(private router: Router, private sessaoService: SessaoService) {}

  avaliacoesPendentes: Array<{
    id: string;
    nome: string;
    data: Date;
    telefone: string;
    origem: 'Lead' | 'Paciente';
    status: string;
  }> = [];
  pacientesAtivos: Array<{ nome: string; ultimaSessao: Date | null; proximaSessao: Date | null }> = [];
  historicoAvaliacoes: Array<{ paciente: string; data: Date; resumo: string }> = [];

  ngOnInit(): void {
    this.carregarDados();
  }

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

  private carregarDados(): void {
    forkJoin({
      pendentes: this.sessaoService.listarFilaAvaliacaoFisio(),
      ativos: this.sessaoService.listarPacientesAtivosFisio(),
      historico: this.sessaoService.listarHistoricoAvaliacoesFisio(),
    }).subscribe({
      next: ({ pendentes, ativos, historico }) => {
        this.avaliacoesPendentes = this.mapPendentes(pendentes ?? []);
        this.pacientesAtivos = this.mapPacientesAtivos(ativos ?? []);
        this.historicoAvaliacoes = this.mapHistorico(historico ?? []);
      },
      error: (err) => {
        console.error('Erro ao carregar Leads/Avaliações', err);
        this.avaliacoesPendentes = [];
        this.pacientesAtivos = [];
        this.historicoAvaliacoes = [];
      },
    });
  }

  private mapPendentes(
    pendentes: FisioFilaItem[]
  ): Array<{ id: string; nome: string; data: Date; telefone: string; origem: 'Lead' | 'Paciente'; status: string }> {
    return (pendentes ?? [])
      .map((p) => ({
        id: String(p.idSessao),
        nome: String(p.nome ?? 'Paciente').trim(),
        telefone: String(p.telefone ?? '-'),
        data: new Date(p.dataHora),
        origem: (p.origem === 'PACIENTE' ? 'Paciente' : 'Lead') as 'Lead' | 'Paciente',
        status: String(p.status ?? ''),
      }))
      .filter((p) => !isNaN(p.data.getTime()))
      .sort((a, b) => a.data.getTime() - b.data.getTime());
  }

  private mapPacientesAtivos(
    ativos: FisioPacienteAtivoItem[]
  ): Array<{ nome: string; ultimaSessao: Date | null; proximaSessao: Date | null }> {
    return (ativos ?? []).map((a) => ({
      nome: String(a.nome ?? 'Paciente').trim(),
      ultimaSessao: a.ultimaSessao ? new Date(a.ultimaSessao) : null,
      proximaSessao: a.proximaSessao ? new Date(a.proximaSessao) : null,
    }));
  }

  private mapHistorico(historico: FisioHistoricoAvaliacaoItem[]): Array<{ paciente: string; data: Date; resumo: string }> {
    return (historico ?? [])
      .map((h) => ({
        paciente: String(h.paciente ?? 'Paciente').trim(),
        data: new Date(h.data),
        resumo: String(h.resumo ?? 'Avaliação concluída'),
      }))
      .filter((h) => !isNaN(h.data.getTime()))
      .sort((a, b) => b.data.getTime() - a.data.getTime());
  }
}
