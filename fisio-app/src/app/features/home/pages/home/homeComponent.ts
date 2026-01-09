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

isModalOpen = false;
emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}