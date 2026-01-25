import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  dataContato: string;
  status: 'novo' | 'aguardando_avaliacao' | 'em_tratamento' | 'finalizado';
}

@Component({
  selector: 'app-paciente-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './paciente-list.html',
  styleUrl: './paciente-list.scss',
})
export class PacienteList {
  mockLeads: Lead[] = [
    {
      id: '1',
      nome: 'Maria Silva',
      telefone: '(11) 98765-4321',
      dataContato: '2026-01-20',
      status: 'aguardando_avaliacao'
    },
    {
      id: '2',
      nome: 'João Santos',
      telefone: '(11) 97654-3210',
      dataContato: '2026-01-22',
      status: 'novo'
    },
    {
      id: '3',
      nome: 'Ana Costa',
      telefone: '(11) 96543-2109',
      dataContato: '2026-01-23',
      status: 'aguardando_avaliacao'
    },
    {
      id: '4',
      nome: 'Pedro Oliveira',
      telefone: '(11) 95432-1098',
      dataContato: '2026-01-24',
      status: 'novo'
    }
  ];

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

  constructor(private router: Router) {}

  onSelectLead(lead: Lead): void {
    // Navegar para avaliação passando o nome do paciente
    this.router.navigate(['/avaliacao'], { queryParams: { nome: lead.nome } });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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
}
