import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
  @Output() action = new EventEmitter<{ action: 'whatsapp' | 'ligar' | 'criar-lead'; value?: any }>();

  form = new FormGroup({
    nome: new FormControl<string>('', Validators.required),
    sobrenome: new FormControl<string>('',Validators.required),
    telefone: new FormControl<string>('', Validators.required),
    email: new FormControl<string>('', [Validators.required, Validators.email]),
  });

  clicarWhatsApp(): void {
    this.action.emit({ action: 'whatsapp' });
  }

  clicarLigar(): void {
    this.action.emit({ action: 'ligar' });
  }

  enviarContato(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.action.emit({ action: 'criar-lead', value: this.form.getRawValue() });
  }

  fechar(): void {
    this.form.reset();
    this.close.emit();
  }
}
