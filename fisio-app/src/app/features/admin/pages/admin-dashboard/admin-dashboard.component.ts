import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';


interface Agendamento {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  data: string;
  horario: string;
  duracao: number;
  tipo: 'avaliacao' | 'sessao' | 'retorno';
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado' | 'faltou';
}

interface Paciente {
  id: string;
  nome: string;
  ultimaSessao: string;
  proximaSessao: string;
  totalSessoes: number;
  status: 'ativo' | 'inativo';
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class AdminDashboardComponent {
  currentDate = new Date();
  selectedPaciente = '';
  searchTerm = '';
  filterStatus = 'todos';
  showDatePicker = false;
  
  months = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' }
  ];

  years: number[] = [];

  constructor(private router: Router) {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      this.years.push(i);
    }
  }

  agendamentos: Agendamento[] = [
    { id: '1', pacienteId: '1', pacienteNome: 'Maria Silva', data: '2026-01-27', horario: '09:00', duracao: 50, tipo: 'sessao', status: 'confirmado' },
    { id: '2', pacienteId: '2', pacienteNome: 'João Santos', data: '2026-01-27', horario: '10:00', duracao: 50, tipo: 'avaliacao', status: 'agendado' },
    { id: '3', pacienteId: '3', pacienteNome: 'Ana Costa', data: '2026-01-27', horario: '14:00', duracao: 50, tipo: 'sessao', status: 'confirmado' },
    { id: '4', pacienteId: '1', pacienteNome: 'Maria Silva', data: '2026-01-28', horario: '09:00', duracao: 50, tipo: 'sessao', status: 'agendado' },
    { id: '5', pacienteId: '4', pacienteNome: 'Pedro Oliveira', data: '2026-01-28', horario: '15:00', duracao: 50, tipo: 'retorno', status: 'agendado' },
    { id: '6', pacienteId: '2', pacienteNome: 'João Santos', data: '2026-01-29', horario: '11:00', duracao: 50, tipo: 'sessao', status: 'agendado' }
  ];

  pacientes: Paciente[] = [
    { id: '1', nome: 'Maria Silva', ultimaSessao: '2026-01-20', proximaSessao: '2026-01-27', totalSessoes: 12, status: 'ativo' },
    { id: '2', nome: 'João Santos', ultimaSessao: '2026-01-22', proximaSessao: '2026-01-27', totalSessoes: 5, status: 'ativo' },
    { id: '3', nome: 'Ana Costa', ultimaSessao: '2026-01-23', proximaSessao: '2026-01-27', totalSessoes: 8, status: 'ativo' },
    { id: '4', nome: 'Pedro Oliveira', ultimaSessao: '2026-01-15', proximaSessao: '2026-01-28', totalSessoes: 3, status: 'ativo' }
  ];

  getWeekDays() {
    const days = [];
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }

  getAgendamentosForDay(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    return this.agendamentos.filter(ag => {
      const matchDate = ag.data === dateStr;
      const matchPaciente = this.selectedPaciente ? ag.pacienteId === this.selectedPaciente : true;
      const matchStatus = this.filterStatus !== 'todos' ? ag.status === this.filterStatus : true;
      return matchDate && matchPaciente && matchStatus;
    });
  }

  previousWeek() {
    const newDate = new Date(this.currentDate);
    newDate.setDate(this.currentDate.getDate() - 7);
    this.currentDate = newDate;
  }

  nextWeek() {
    const newDate = new Date(this.currentDate);
    newDate.setDate(this.currentDate.getDate() + 7);
    this.currentDate = newDate;
  }

  get filteredPacientes() {
    return this.pacientes.filter(p =>
      p.nome.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get stats() {
    const weekDays = this.getWeekDays();
    return {
      totalPacientes: this.pacientes.filter(p => p.status === 'ativo').length,
      sessoesHoje: this.agendamentos.filter(a => a.data === new Date().toISOString().split('T')[0]).length,
      sessoesSemana: this.agendamentos.filter(a => {
        const agDate = new Date(a.data);
        return agDate >= weekDays[0] && agDate <= weekDays[6];
      }).length,
      taxaPresenca: 92
    };
  }

  getStatusColor(status: Agendamento['status']): string {
    switch (status) {
      case 'agendado':
        return 'status-agendado';
      case 'confirmado':
        return 'status-confirmado';
      case 'realizado':
        return 'status-realizado';
      case 'cancelado':
        return 'status-cancelado';
      case 'faltou':
        return 'status-faltou';
    }
  }

  getTipoLabel(tipo: Agendamento['tipo']): string {
    switch (tipo) {
      case 'avaliacao':
        return 'Avaliação';
      case 'sessao':
        return 'Sessão';
      case 'retorno':
        return 'Retorno';
    }
  }

  formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  }

  getDay(date: string): number {
    return new Date(date).getDate();
  }

  getMonthShort(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', { month: 'short' });
  }

  getMonthYear(): string {
    return this.currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  isToday(date: Date): boolean {
    return date.toDateString() === new Date().toDateString();
  }

  getDayName(index: number): string {
    return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][index];
  }

  selectPaciente(pacienteId: string): void {
    this.selectedPaciente = pacienteId;
  }

  navigateToLeads(): void {
    this.router.navigate(['/pacientes']);
  }

  novoAgendamento(): void {
    // Implementar lógica de novo agendamento
    console.log('Novo agendamento');
  }

  getCurrentMonth(): number {
    return this.currentDate.getMonth();
  }

  getCurrentYear(): number {
    return this.currentDate.getFullYear();
  }

  changeMonth(month: number): void {
    const newDate = new Date(this.currentDate);
    newDate.setMonth(month);
    this.currentDate = newDate;
  }

  changeYear(year: number): void {
    const newDate = new Date(this.currentDate);
    newDate.setFullYear(year);
    this.currentDate = newDate;
  }

  goToToday(): void {
    this.currentDate = new Date();
  }

  toggleDatePicker(): void {
    this.showDatePicker = !this.showDatePicker;
  }

  get filteredAgendamentos() {
    return this.agendamentos.filter(ag => {
      const matchPaciente = this.selectedPaciente ? ag.pacienteId === this.selectedPaciente : true;
      const matchStatus = this.filterStatus !== 'todos' ? ag.status === this.filterStatus : true;
      return matchPaciente && matchStatus;
    }).sort((a, b) => {
      const dateA = new Date(a.data + ' ' + a.horario);
      const dateB = new Date(b.data + ' ' + b.horario);
      return dateA.getTime() - dateB.getTime();
    });
  }
}
