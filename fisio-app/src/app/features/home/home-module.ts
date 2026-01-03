import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { HomeRoutingModule } from './home-routing-module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MatMenuModule
  ]
})
export class HomeModule { }
