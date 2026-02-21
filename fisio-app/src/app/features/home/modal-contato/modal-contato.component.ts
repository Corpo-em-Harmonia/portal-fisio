import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ModalLeadHelper, ModalActionEvent } from '../../../shared/helpers/modal-lead.helper';

@Component({
  selector: 'app-modal-contato',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './modal-contato.component.html',
  styleUrls: ['./modal-contato.component.scss'],
})
export class ModalContatoComponent {
  @Input() visible = false;

  @Output() close = new EventEmitter<void>();
  @Output() action = new EventEmitter<ModalActionEvent>();

  form: FormGroup;

  constructor() {
    this.form = ModalLeadHelper.createLeadForm();
  }

  clicarWhatsApp(): void {
    this.action.emit({ action: 'whatsapp' });
  }

  clicarLigar(): void {
    this.action.emit({ action: 'ligar' });
  }

  enviarContato(): void {
    if (!ModalLeadHelper.validateAndMarkTouched(this.form)) {
      return;
    }
    this.action.emit({ action: 'criar-lead', value: this.form.getRawValue() });
  }

  fechar(): void {
    ModalLeadHelper.resetForm(this.form);
    this.close.emit();
  }
}
