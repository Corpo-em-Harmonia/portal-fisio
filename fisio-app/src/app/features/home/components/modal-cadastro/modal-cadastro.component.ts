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
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ModalLeadHelper, ModalActionEvent } from '../../../../shared/helpers/modal-lead.helper';

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
  @Output() buttonClick = new EventEmitter<ModalActionEvent>();

  step: ModalStep = 'opcoes';
  form: FormGroup;

  constructor() {
    // Usa o helper para criar o form com campos opcionais
    this.form = ModalLeadHelper.createLeadForm(true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      // ✅ abre na etapa correta dependendo do modo
      this.step = this.modoInterno ? 'form' : 'opcoes';
      ModalLeadHelper.resetForm(this.form);
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
    if (!ModalLeadHelper.validateAndMarkTouched(this.form)) {
      return;
    }

    const { leadData, agendarAgora } = ModalLeadHelper.extractFormData(this.form.getRawValue());

    this.buttonClick.emit({
      action: 'criar-lead',
      value: leadData,
      agendarAgora,
    });
  }
}
