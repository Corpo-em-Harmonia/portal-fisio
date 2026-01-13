import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ModalCadastroComponent } from '../../components/modal-cadastro/modal-cadastro.component'; 
import { LeadService } from '../../../../shared/service/lead.service';
import { Lead } from '../../../../shared/models/lead';
import { Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatButtonModule,
        MatInputModule,  
    MatFormFieldModule,   
   ReactiveFormsModule,
    ModalCadastroComponent
  ],
  templateUrl: './homeComponent.html',
  styleUrls: ['./homeComponent.scss'],
})
export class Home {
  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;

  @Output() buttonClick = new EventEmitter<string>();
  modalButtons = [
  { label: 'Enviar', color: 'primary', action: 'salvar', disabled: false },
  { label: 'Fechar', color: '', action: 'fechar', disabled: false }
  ];
  isModalOpen = false;
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  constructor(private leadService: LeadService) {}

  onModalButtonClick(event: { action: string, value: any }) {
    if (event.action === 'salvar') {
      console.log('Salvar lead acionado');
      this.salvarLead(event.value);
    } else if (event.action === 'fechar') {
      this.closeModal();
    }
  }
salvarLead(formValue: any) {
  if (formValue && formValue.email) {
    this.leadService.salvarLead(formValue as Lead).subscribe({
      next: (response) => {
        console.log('Lead salvo com sucesso:', response);
        this.closeModal();
      },
      error: (err) => {
        console.error('Erro ao salvar lead:', err);
      }
    });
  }
}
}