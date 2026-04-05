import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-modal-agendar-avaliacao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './modal-agendar-avaliacao.component.html',
  styleUrls: ['./modal-agendar-avaliacao.component.scss'],
})
export class ModalAgendarAvaliacaoComponent implements OnChanges {
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() confirmarAgendamento = new EventEmitter<{ dataHora: string; observacao?: string }>();

  form = new FormGroup({
    data: new FormControl('', Validators.required),
    hora: new FormControl('', Validators.required),
    observacao: new FormControl(''),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.form.reset();
    }
  }

  confirmar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this.form.value.data!;
    const hora = this.form.value.hora!;
    const observacao = this.form.value.observacao || '';

    // ISO local simples (back converte)
    const dataHora = `${data}T${hora}:00`;

    this.confirmarAgendamento.emit({ dataHora, observacao });
    this.form.reset();
    this.close.emit();
  }
}
