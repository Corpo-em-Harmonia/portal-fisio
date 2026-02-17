import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { LeadService } from '../../../../shared/service/lead.service';
import { Lead } from '../../../../shared/models/lead';
import { Input, Output, EventEmitter } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalContatoComponent } from '../../modal-contato/modal-contato.component';

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
    ModalContatoComponent,
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
    { label: 'Chamar no WhatsApp', action: 'whatsapp', color: 'primary' },
    { label: 'Ligar', action: 'ligar', color: 'basic' },
    { label: 'Quero que me chamem', action: 'criar-lead', color: 'accent' },
  ];

  private readonly WHATSAPP_PHONE = '5511999999999'; // coloca o número real
  private readonly PHONE = '+5511999999999';

  isModalOpen = false;

  emailFormControl = new FormControl('', [Validators.required, Validators.email]);


  abrirWhatsapp(): void {
    const msg = encodeURIComponent('Olá! Quero agendar uma avaliação de fisioterapia.');
    window.open(`https://wa.me/${this.WHATSAPP_PHONE}?text=${msg}`, '_blank');
  }

    ligar(): void {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile) {
        window.location.href = `tel:${this.PHONE}`;
      } else {
        navigator.clipboard.writeText(this.PHONE);
        this.snackBar.open(
          'Número copiado! Ligue pelo seu telefone.',
          'Fechar',
          { duration: 4000 }
        );
      }
    }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  constructor(private leadService: LeadService,private snackBar: MatSnackBar) { }

onModalButtonClick(event: { action: string; value?: any }) {
  switch (event.action) {
    case 'whatsapp':
      this.abrirWhatsapp();
      this.closeModal();
      return;

    case 'ligar':
      this.ligar();
      this.closeModal();
      return;

    case 'criar-lead':
      this.criarLead(event.value);
      return;
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