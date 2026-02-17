import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

type ModalStep = 'opcoes' | 'form';

@Component({
  selector: 'app-modal-cadastro',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './modal-cadastro.component.html',
  styleUrls: ['./modal-cadastro.component.scss']
})
export class ModalCadastroComponent implements OnChanges {
  @Input() visible = false;

  // ✅ quando true: é modal da recepção/admin -> abre direto no form
  @Input() modoInterno = false;

  // Textos do modal (sobrescreve no pai)
  @Input() titulo = 'Iniciar tratamento';
  @Input() descricao = 'Como prefere falar com a gente?';

  @Output() close = new EventEmitter<void>();
  @Output() buttonClick = new EventEmitter<{ action: string; value?: any; agendarAgora?: boolean }>();

  step: ModalStep = 'opcoes';

  // Form para “Quero que me chamem” ou cadastro manual da recepção
  form = new FormGroup({
    nome: new FormControl('', Validators.required),
    sobrenome: new FormControl(''),
    telefone: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.email]),    observacao: new FormControl(''),    agendarAgora: new FormControl<boolean>(true), 
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      // ✅ abre na etapa correta dependendo do modo
      this.step = this.modoInterno ? 'form' : 'opcoes';
      this.form.reset();
    }
  }

  irParaFormulario(): void {
    this.step = 'form';
  }

  voltar(): void {
    this.step = 'opcoes';
  }

  fechar(): void {
    this.close.emit();
  }

  // Ações simples (WhatsApp / Ligar) sobem pro pai
  acionar(action: 'whatsapp' | 'ligar'): void {
    this.buttonClick.emit({ action });
  }

  cadastrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { agendarAgora, ...value } = this.form.getRawValue();

    this.buttonClick.emit({
      action: 'criar-lead',
      value,
      agendarAgora: !!agendarAgora,
    });
  }
}
