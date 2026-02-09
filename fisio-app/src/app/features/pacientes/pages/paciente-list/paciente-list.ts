import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LeadService } from '../../../../shared/service/lead.service';
import { OnInit } from '@angular/core';
import { Lead } from '../../../../shared/models/lead';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
@Component({
  selector: 'app-paciente-list',
  standalone: true,
  imports: [CommonModule, RouterModule,MatIconModule, MatMenuModule, MatButtonModule],
  templateUrl: './paciente-list.html',
  styleUrl: './paciente-list.scss',
})
export class PacienteList implements OnInit {
  leads: Lead[] = [];

  statusColors: Record<Lead['status'], string> = {
    novo: 'bg-blue-100 text-blue-700',
    aguardando_avaliacao: 'bg-purple-100 text-purple-700',
    em_tratamento: 'bg-green-100 text-green-700',
    finalizado: 'bg-gray-100 text-gray-700'
  };

  statusLabels: Record<Lead['status'], string> = {
    novo: 'Novo',
    aguardando_avaliacao: 'Aguardando Avaliação',
    em_tratamento: 'Em Tratamento',
    finalizado: 'Finalizado'
  };

  constructor(private router: Router, private leadService: LeadService,  private cdr: ChangeDetectorRef) { }


    ngOnInit(): void {
      this.leadService.getLeads().subscribe({
        next: (dados) => {
          this.leads = dados.map(lead => ({
            ...lead,
            status: lead.status.toLowerCase() as Lead['status'],
          }));
             this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao buscar leads', err)
      });
    }

  onSelectLead(lead: Lead): void {
    // Navegar para avaliação passando o nome do paciente
    this.router.navigate(['/avaliacao'], { queryParams: { nome: lead.nome } });
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR');
  }

  getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  getStatusClass(status: Lead['status']): string {
    return this.statusColors[status];
  }

  getStatusLabel(status: Lead['status']): string {
    return this.statusLabels[status];
  }

  trackById(index: number, lead: Lead) {
    return lead.id;
  }

  onEditarLead(lead: any) {
  // lógica para editar o lead
}

onExcluirLead(lead: any) {
  // lógica para excluir o lead
}
}
