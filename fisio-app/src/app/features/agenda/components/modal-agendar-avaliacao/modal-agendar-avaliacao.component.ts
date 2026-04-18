import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, computed, signal } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { TimeSlot } from '../../../../shared/service/agendamento.service';
import { Lead } from '../../../../shared/models';

type ModoAgendamento = 'avulso' | 'recorrente';
type DiaSemanaCodigo = 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SAB' | 'DOM';

interface DiaSemanaOption {
  codigo: DiaSemanaCodigo;
  label: string;
  jsDay: number;
}

export interface ConfirmarAgendamentoPayload {
  data: string;
  hora: string;
  observacao?: string;
  modoAgendamento: ModoAgendamento;
  frequenciaSemanal?: number;
  quantidadeSessoes?: number;
  validadeGuiaDias?: number;
  diasSemanaPreferidos?: DiaSemanaCodigo[];
}

@Component({
  selector: 'app-modal-agendar-avaliacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
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
  @Output() confirmarAgendamento = new EventEmitter<ConfirmarAgendamentoPayload>();

  form = new FormGroup({
    data: new FormControl<Date | null>(null, Validators.required),
    modoAgendamento: new FormControl<ModoAgendamento>('avulso', Validators.required),
    quantidadeSessoes: new FormControl<number | null>(8),
    validadeGuiaDias: new FormControl<number | null>(30),
    observacao: new FormControl<string>(''),
  });

  readonly diasSemanaOptions: DiaSemanaOption[] = [
    { codigo: 'SEG', label: 'Segunda', jsDay: 1 },
    { codigo: 'TER', label: 'Terça', jsDay: 2 },
    { codigo: 'QUA', label: 'Quarta', jsDay: 3 },
    { codigo: 'QUI', label: 'Quinta', jsDay: 4 },
    { codigo: 'SEX', label: 'Sexta', jsDay: 5 },
    { codigo: 'SAB', label: 'Sábado', jsDay: 6 },
    { codigo: 'DOM', label: 'Domingo', jsDay: 0 },
  ];

  diasSemanaSelecionados: DiaSemanaCodigo[] = [];

  private readonly refreshHorariosTick = signal(0);
  private readonly selectedDateIsoSignal = signal('');
  private readonly horariosPadrao: TimeSlot[] = [
    { time: '08:00', available: true },
    { time: '09:00', available: true },
    { time: '10:00', available: true },
    { time: '11:00', available: true },
    { time: '13:00', available: true },
    { time: '14:00', available: true },
    { time: '15:00', available: true },
    { time: '16:00', available: true },
    { time: '17:00', available: true },
  ];

  readonly horariosResource = httpResource<TimeSlot[]>(
    () => {
      this.refreshHorariosTick();
      const dateISO = this.selectedDateIsoSignal();
      if (!dateISO) return undefined;
      return `/api/agendamentos/disponibilidade?date=${encodeURIComponent(dateISO)}`;
    },
    { defaultValue: [] }
  );

  readonly horariosDisponiveisSignal = computed<TimeSlot[]>(() => {
    const horariosApi = this.horariosResource.value() ?? [];
    if (horariosApi.length > 0) return horariosApi;
    return this.horariosResource.error() ? this.horariosPadrao : horariosApi;
  });

  horarioSelecionado: string | null = null;

  minDate: Date;
  readonly weekdaysOnlyFilter = (d: Date | null): boolean => {
    if (!d) return false;
    const day = d.getDay();
    return day !== 0 && day !== 6;
  };

  constructor() {
    this.minDate = new Date();
  }

  get horariosDisponiveis(): TimeSlot[] {
    return this.horariosDisponiveisSignal();
  }

  get carregandoHorarios(): boolean {
    return this.horariosResource.isLoading();
  }

  ngOnInit(): void {
    // quando mudar a data manualmente, busca horários
    this.form.get('data')?.valueChanges.subscribe((data) => {
      if (data) {
        const dateISO = this.formatDateToISO(data);
        this.carregarHorarios(dateISO);
      }
    });

    this.form.get('modoAgendamento')?.valueChanges.subscribe((modo) => {
      if (modo === 'avulso') {
        this.form.patchValue({
          quantidadeSessoes: null,
          validadeGuiaDias: 30,
        }, { emitEvent: false });
        this.diasSemanaSelecionados = [];
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
    this.selectedDateIsoSignal.set('');
    if (this.form.value.modoAgendamento === 'avulso') {
      this.diasSemanaSelecionados = [];
    }

    // se não tiver data ainda, preenche com hoje
    const dataAtual = this.form.get('data')?.value;
    if (!dataAtual) {
      this.form.patchValue({ data: new Date() }, { emitEvent: true });
      return;
    }

    // se já tinha data, apenas recarrega
    const dateISO = this.formatDateToISO(dataAtual);
    this.carregarHorarios(dateISO);
  }

  carregarHorarios(dateISO: string): void {
    this.horarioSelecionado = null;
    this.selectedDateIsoSignal.set(dateISO);
    this.refreshHorariosTick.update((v) => v + 1);
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
    if (!this.weekdaysOnlyFilter(dataValue)) {
      window.alert('Sábado e domingo estão bloqueados para agendamento.');
      return;
    }

    const hora = this.horarioSelecionado;
    const observacao = this.form.value.observacao || '';
    const modoAgendamento = this.form.value.modoAgendamento ?? 'avulso';
    const quantidadeSessoesRaw = this.form.value.quantidadeSessoes;
    const validadeGuiaDiasRaw = this.form.value.validadeGuiaDias;
    const diasSemanaPreferidos = modoAgendamento === 'recorrente' ? this.diasSemanaSelecionados : [];

    const frequenciaSemanal =
      modoAgendamento === 'recorrente'
        ? diasSemanaPreferidos.length
        : undefined;
    const quantidadeSessoes =
      modoAgendamento === 'recorrente'
        ? this.normalizePositiveInt(quantidadeSessoesRaw)
        : undefined;
    const validadeGuiaDias =
      modoAgendamento === 'recorrente'
        ? this.normalizePositiveInt(validadeGuiaDiasRaw)
        : undefined;

    // ✅ aqui só emite. QUEM fecha é o PAI quando o backend confirmar.
    this.confirmarAgendamento.emit({
      data,
      hora,
      observacao,
      modoAgendamento,
      frequenciaSemanal,
      quantidadeSessoes,
      validadeGuiaDias,
      diasSemanaPreferidos,
    });
  }

  fechar(): void {
    this.resetarState();
    this.close.emit();
  }

  private resetarState(): void {
    this.form.reset();
    this.horarioSelecionado = null;
    this.selectedDateIsoSignal.set('');
  }

  isFormValido(): boolean {
    if (!this.form.valid || this.horarioSelecionado === null) return false;

    if (this.isRecorrente) {
      const qtd = this.normalizePositiveInt(this.form.value.quantidadeSessoes);
      const validade = this.normalizePositiveInt(this.form.value.validadeGuiaDias);
      if (!qtd || !validade || this.diasSemanaSelecionados.length === 0) return false;
      if (!this.isPlanoRecorrenteViavel()) return false;
      return true;
    }

    return true;
  }

  get isRecorrente(): boolean {
    return this.form.value.modoAgendamento === 'recorrente';
  }

  isPlanoRecorrenteViavel(): boolean {
    const duracao = this.getDuracaoPlanoDiasPorDiasSelecionados();
    const validade = this.getValidadeGuiaDias();
    if (!duracao || !validade) return false;
    return duracao <= validade;
  }

  getDuracaoPlanoDiasPorDiasSelecionados(): number | null {
    const qtd = this.normalizePositiveInt(this.form.value.quantidadeSessoes);
    const dataInicio = this.form.value.data;
    if (!qtd || !dataInicio || this.diasSemanaSelecionados.length === 0) return null;

    const diasPermitidos = new Set(
      this.diasSemanaSelecionados
        .map((codigo) => this.diasSemanaOptions.find((d) => d.codigo === codigo)?.jsDay)
        .filter((v): v is number => typeof v === 'number')
    );

    let count = 0;
    const cursor = new Date(dataInicio);
    const inicio = new Date(dataInicio);

    while (count < qtd) {
      if (diasPermitidos.has(cursor.getDay())) {
        count += 1;
      }
      if (count < qtd) {
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    const msPorDia = 1000 * 60 * 60 * 24;
    return Math.max(1, Math.ceil((cursor.getTime() - inicio.getTime()) / msPorDia) + 1);
  }

  getValidadeGuiaDias(): number | null {
    const validade = this.normalizePositiveInt(this.form.value.validadeGuiaDias);
    return validade ?? null;
  }

  getFrequenciaMinimaSugerida(): number | null {
    const qtd = this.normalizePositiveInt(this.form.value.quantidadeSessoes);
    const validade = this.getValidadeGuiaDias();
    if (!qtd || !validade) return null;

    const semanasValidas = Math.max(1, Math.floor(validade / 7));
    return Math.ceil(qtd / semanasValidas);
  }

  toggleDiaSemana(codigo: DiaSemanaCodigo): void {
    if (!this.isRecorrente) return;
    if (this.diasSemanaSelecionados.includes(codigo)) {
      this.diasSemanaSelecionados = this.diasSemanaSelecionados.filter((d) => d !== codigo);
      return;
    }
    this.diasSemanaSelecionados = [...this.diasSemanaSelecionados, codigo];
  }

  isDiaSelecionado(codigo: DiaSemanaCodigo): boolean {
    return this.diasSemanaSelecionados.includes(codigo);
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

  private normalizePositiveInt(value: unknown): number | undefined {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return undefined;
    const int = Math.trunc(parsed);
    return int > 0 ? int : undefined;
  }
}
