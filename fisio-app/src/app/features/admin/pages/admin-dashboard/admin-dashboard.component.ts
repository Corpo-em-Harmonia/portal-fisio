import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EstatisticasSessao } from '../../../../shared/service/sessao.service';
import { Sessao } from '../../../../shared/models/sessao';
import { DashboardAgendamento, DashboardPaciente } from './admin-dashboard.models';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatSnackBarModule]
})
export class AdminDashboardComponent {
  currentDate = new Date();
  selectedDay = new Date();
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

  private readonly refreshSessoesTick = signal(0);
  private readonly refreshEstatisticasTick = signal(0);

  readonly sessoesResource = httpResource<Sessao[]>(
    () => {
      this.refreshSessoesTick();
      return '/api/sessoes?periodo=todos';
    },
    { defaultValue: [] }
  );

  readonly estatisticasApiResource = httpResource<EstatisticasSessao | null>(
    () => {
      this.refreshEstatisticasTick();
      return '/api/sessoes/estatisticas';
    },
    { defaultValue: null }
  );

  private readonly agendamentosSignal = computed<DashboardAgendamento[]>(() =>
    (this.sessoesResource.value() ?? []).map((s) => this.mapSessaoToDashboardAgendamento(s))
  );

  private readonly pacientesSignal = computed<DashboardPaciente[]>(() =>
    this.montarPacientes(this.sessoesResource.value() ?? [])
  );

  private readonly estatisticasApiSignal = computed<EstatisticasSessao | null>(
    () => this.estatisticasApiResource.value()
  );

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      this.years.push(i);
    }
  }

  get agendamentos(): DashboardAgendamento[] {
    return this.agendamentosSignal();
  }

  get pacientes(): DashboardPaciente[] {
    return this.pacientesSignal();
  }

  get estatisticasApi(): EstatisticasSessao | null {
    return this.estatisticasApiSignal();
  }

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
    const dateStr = this.toLocalIsoDate(date);
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
    const totalCompareceu = this.estatisticasApi?.comparecidas ?? 0;
    const totalBase = this.estatisticasApi?.total ?? 0;
    const taxaPresenca = totalBase > 0 ? Math.round((totalCompareceu / totalBase) * 100) : 0;
    const hojeLocal = this.toLocalIsoDate(new Date());
    const inicioSemana = this.startOfDay(weekDays[0]);
    const fimSemana = this.startOfDay(weekDays[6]);

    return {
      totalPacientes: this.pacientes.filter(p => p.status === 'ativo').length,
      sessoesHoje: this.agendamentos.filter(a => a.data === hojeLocal).length,
      sessoesSemana: this.agendamentos.filter(a => {
        const agDate = this.parseIsoDateLocal(a.data);
        return !!agDate && agDate >= inicioSemana && agDate <= fimSemana;
      }).length,
      taxaPresenca
    };
  }

  getStatusColor(status: DashboardAgendamento['status']): string {
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

  getTipoLabel(tipo: DashboardAgendamento['tipo']): string {
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
    this.router.navigate(['/leads-avaliacoes']);
  }

  novoAgendamento(): void {
    // TODO: implementar lógica de novo agendamento
    this.snackBar.open('Funcionalidade de agendamento em desenvolvimento', 'Fechar', {
      duration: 3000
    });
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
    this.selectedDay = new Date();
  }

  toggleDatePicker(): void {
    this.showDatePicker = !this.showDatePicker;
  }

  get filteredAgendamentos() {
    return this.agendamentos.filter(ag => {
      const matchPaciente = this.selectedPaciente ? ag.pacienteId === this.selectedPaciente : true;
      const matchStatus = this.filterStatus !== 'todos' ? ag.status === this.filterStatus : true;
      const agDate = this.parseIsoDateLocal(ag.data);
      const matchSelectedDay = !!agDate && this.sameDay(agDate, this.selectedDay);
      return matchPaciente && matchStatus && matchSelectedDay;
    }).sort((a, b) => {
      const dateA = new Date(a.data + ' ' + a.horario);
      const dateB = new Date(b.data + ' ' + b.horario);
      return dateA.getTime() - dateB.getTime();
    });
  }

  setSelectedDay(day: Date): void {
    this.selectedDay = this.startOfDay(day);
  }

  isSelectedDay(day: Date): boolean {
    return this.sameDay(day, this.selectedDay);
  }

  get selectedDayLabel(): string {
    return this.selectedDay.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
    });
  }

  private mapSessaoToDashboardAgendamento(sessao: Sessao): DashboardAgendamento {
    const dataRef = new Date(sessao.dataHora);
    const data = isNaN(dataRef.getTime()) ? '' : this.toLocalIsoDate(dataRef);
    const horario = isNaN(dataRef.getTime())
      ? '00:00'
      : dataRef.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });

    return {
      id: String(sessao.id),
      pacienteId: String(sessao.pacienteId ?? ''),
      pacienteNome: (sessao.pacienteNome ?? '').trim() || `Paciente ${sessao.pacienteId ?? ''}`,
      data,
      hora: horario,
      horario,
      duracao: 50,
      tipo: sessao.tipoSessao ?? 'sessao',
      status: this.mapStatusToDashboard(sessao.status),
    };
  }

  private mapStatusToDashboard(status: Sessao['status']): DashboardAgendamento['status'] {
    if (status === 'cancelada') return 'cancelado';
    if (status === 'faltou') return 'faltou';
    if (status === 'compareceu' || status === 'avaliada') return 'realizado';
    if (status === 'marcada' || status === 'remarcada' || status === 'aguardando_avaliacao') return 'agendado';
    return 'agendado';
  }

  private montarPacientes(sessoes: Sessao[]): DashboardPaciente[] {
    const porNome = new Map<string, Date[]>();
    const agora = new Date();

    for (const s of sessoes) {
      const nome = (s.pacienteNome ?? '').trim();
      if (!nome || s.status === 'cancelada') continue;
      const data = new Date(s.dataHora);
      if (isNaN(data.getTime())) continue;
      const lista = porNome.get(nome) ?? [];
      lista.push(data);
      porNome.set(nome, lista);
    }

    let idx = 1;
    return Array.from(porNome.entries()).map(([nome, datas]) => {
      datas.sort((a, b) => a.getTime() - b.getTime());
      const ultima = [...datas].reverse().find((d) => d.getTime() <= agora.getTime()) ?? datas[datas.length - 1];
      const proxima = datas.find((d) => d.getTime() >= agora.getTime()) ?? datas[datas.length - 1];
      return {
        id: String(idx++),
        nome,
        ultimaSessao: ultima.toISOString(),
        proximaSessao: proxima.toISOString(),
        totalSessoes: datas.length,
        status: 'ativo',
      };
    });
  }

  private toLocalIsoDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private parseIsoDateLocal(isoDate: string): Date | null {
    const parts = isoDate?.split('-');
    if (!parts || parts.length !== 3) return null;
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }
}
