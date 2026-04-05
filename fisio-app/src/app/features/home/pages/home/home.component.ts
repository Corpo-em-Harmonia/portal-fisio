import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { LeadService } from '../../../../shared/service/lead.service';
import { Lead } from '../../../../shared/models/lead';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalContatoComponent } from '../../modal-contato/modal-contato.component';
import { ModalActionEvent } from '../../../../shared/helpers/modal-lead.helper';

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
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;

  modalVisivel = false;

  modalButtons = [
    { label: 'Chamar no WhatsApp', action: 'whatsapp', color: 'primary' },
    { label: 'Ligar', action: 'ligar', color: 'basic' },
    { label: 'Quero que me chamem', action: 'criar-lead', color: 'accent' },
  ];

  private readonly WHATSAPP_PHONE = '5511999999999'; // coloca o número real
  private readonly PHONE = '+5511999999999';

  isModalOpen = false;

  constructor(private leadService: LeadService, private snackBar: MatSnackBar) {}

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

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onModalButtonClick(event: ModalActionEvent): void {
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

  private criarLead(formValue?: Partial<Lead>): void {
    if (formValue && formValue.email) {
      this.leadService.criarLead(formValue).subscribe({
        next: () => {
          this.isModalOpen = false;
          this.snackBar.open('Contato enviado com sucesso! Em breve entraremos em contato.', 'Fechar', {
            duration: 4000,
            panelClass: ['snackbar-custom'],
          });
        },
        error: () => {
          this.snackBar.open('Erro ao enviar contato. Tente novamente.', 'Fechar', {
            duration: 4000,
            panelClass: ['snackbar-custom'],
          });
        },
      });
    }
  }
}