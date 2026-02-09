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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    ModalCadastroComponent,
    MatSnackBarModule,
  ],
  templateUrl: './homeComponent.html',
  styleUrls: ['./homeComponent.scss'],
})
export class Home {
  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;

  @Output() buttonClick = new EventEmitter<string>();
  modalVisivel = false;

  modalButtons = [
    { label: 'Enviar', action: 'criar-lead', color: 'primary' },
    { label: 'Fechar', action: 'fechar', color: 'basic' }
  ];
  isModalOpen = false;

  emailFormControl = new FormControl('', [Validators.required, Validators.email]);

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  constructor(private leadService: LeadService,private snackBar: MatSnackBar) { }

  onModalButtonClick(event: { action: string, value: any }) {
  if (event.action === 'criar-lead') {
      console.log('Salvar lead acionado');
      this.criarLead(event.value);
      this.closeModal();
    } else if (event.action === 'fechar') {
      this.modalVisivel = false;
      this.closeModal();
    }
  }

  criarLead(formValue: any) {
    if (formValue && formValue.email) {
      this.leadService.criarLead(formValue as Lead).subscribe({
        next: (response) => {
          this.isModalOpen = false;
          this.snackBar.open('Contato enviado com sucesso! Em breve entraremos em contato.', 'Fechar', {
            duration: 4000,
            panelClass: ['snackbar-custom']
          }
        
        );
          // Atualize a lista se necessário
        },
        error: (err) => {
          this.snackBar.open('Erro ao enviar contato. Tente novamente.', 'Fechar', {
            duration: 4000,
            panelClass: ['snackbar-custom']
          });
        }
      });
    }
  }
}