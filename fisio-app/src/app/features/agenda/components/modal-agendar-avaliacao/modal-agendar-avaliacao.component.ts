import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { AgendamentoService, TimeSlot } from '../../../../shared/service/agendamento.service';
import { Lead } from '../../../../shared/models';

@Component({
  selector: 'app-modal-agendar-avaliacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
  ],
  templateUrl: './modal-agendar-avaliacao.component.html',
  styleUrls: ['./modal-agendar-avaliacao.component.scss'],
})
export class ModalAgendarAvaliacaoComponent implements OnInit, OnChanges {
  @Input() visible = false;

  // você pode manter, mas no seu fluxo atual basta o lead (pra exibir nome/telefone)
  @Input() leadId?: number;
  @Input() pacienteId?: number;
  @Input() lead?: Lead;

  @Output() close = new EventEmitter<void>();
  @Output() confirmarAgendamento = new EventEmitter<{ data: string; hora: string; observacao?: string }>();

  form = new FormGroup({
    data: new FormControl<Date | null>(null, Validators.required),
    observacao: new FormControl<string>(''),
  });

  horariosDisponiveis: TimeSlot[] = [];
  horarioSelecionado: string | null = null;
  carregandoHorarios = false;

  minDate: Date;

  constructor(private agendamentoService: AgendamentoService) {
    this.minDate = new Date();
  }

  ngOnInit(): void {
    // quando mudar a data manualmente, busca horários
    this.form.get('data')?.valueChanges.subscribe((data) => {
      if (data) {
        const dateISO = this.formatDateToISO(data);
        this.buscarHorariosDisponiveis(dateISO);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // ✅ quando o modal abrir, seta data padrão e carrega disponibilidade
    if (changes['visible']?.currentValue === true) {
      this.onOpen();
    }
  }

  private onOpen(): void {
    this.horarioSelecionado = null;
    this.horariosDisponiveis = [];

    // se não tiver data ainda, preenche com hoje
    const dataAtual = this.form.get('data')?.value;
    if (!dataAtual) {
      this.form.patchValue({ data: new Date() }, { emitEvent: true });
      return;
    }

    // se já tinha data, apenas recarrega
    const dateISO = this.formatDateToISO(dataAtual);
    this.buscarHorariosDisponiveis(dateISO);
  }

  buscarHorariosDisponiveis(dateISO: string): void {
    this.carregandoHorarios = true;
    this.horarioSelecionado = null;
    this.horariosDisponiveis = [];

    this.agendamentoService.getHorariosDisponiveis(dateISO).subscribe({
      next: (horarios) => {
        this.horariosDisponiveis = horarios ?? [];
        this.carregandoHorarios = false;
      },
      error: (erro) => {
        console.error('Erro ao buscar horários:', erro);
        this.carregandoHorarios = false;
        this.gerarHorariosPadrao(); // fallback
      }
    });
  }

  gerarHorariosPadrao(): void {
    const horarios = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    this.horariosDisponiveis = horarios.map(time => ({ time, available: true }));
  }

  selecionarHorario(horario: TimeSlot): void {
    if (!horario.available) return;
    this.horarioSelecionado = horario.time;
  }

  confirmar(): void {
    if (this.form.invalid || !this.horarioSelecionado) {
      this.form.markAllAsTouched();
      return;
    }

    const dataValue = this.form.value.data;
    if (!dataValue) return;
    
    const data = this.formatDateToISO(dataValue);
    const hora = this.horarioSelecionado;
    const observacao = this.form.value.observacao || '';

    // ✅ aqui só emite. QUEM fecha é o PAI quando o backend confirmar.
    this.confirmarAgendamento.emit({ data, hora, observacao });
  }

  fechar(): void {
    this.resetarState();
    this.close.emit();
  }

  private resetarState(): void {
    this.form.reset();
    this.horarioSelecionado = null;
    this.horariosDisponiveis = [];
    this.carregandoHorarios = false;
  }

  isFormValido(): boolean {
    return this.form.valid && this.horarioSelecionado !== null;
  }

  getNomeCompleto(): string {
    if (!this.lead) return '';
    return `${this.lead.nome || ''} ${this.lead.sobrenome || ''}`.trim();
  }

  private formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
