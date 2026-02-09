import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-modal-cadastro',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule],
  templateUrl: './modal-cadastro.component.html',
  styleUrls: ['./modal-cadastro.component.scss']
})
export class ModalCadastroComponent {
  @Input() visible = false;
  @Input() titulo = 'Iniciar tratamento';
  @Input() descricao = 'Preencha seus dados para iniciarmos o atendimento.';
  @Output() close = new EventEmitter<void>();
  @Input() buttons: { label: string, color?: string, action: string, disabled?: boolean }[] = [];
  @Output() buttonClick = new EventEmitter<{ action: string, value: any }>();

  form = new FormGroup({
    nome: new FormControl('', Validators.required),
    sobrenome: new FormControl('', Validators.required),
    telefone: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  onButtonClick(action: string) {
      console.log('Botão clicado:', action, this.form.value);
    this.buttonClick.emit({ action, value: this.form.value });
  }
}