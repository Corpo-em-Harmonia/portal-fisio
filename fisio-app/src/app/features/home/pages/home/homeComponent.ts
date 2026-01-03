import { Component, ViewChild } from '@angular/core';
// ...existing code...
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,RouterModule ,MatMenuModule, MatButtonModule],
  templateUrl: './homeComponent.html',
  styleUrls: ['./homeComponent.scss'],
})
export class Home {
  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;


}