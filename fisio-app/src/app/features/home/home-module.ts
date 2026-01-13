import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { HomeRoutingModule } from './home-routing-module';
import { Home } from './pages/home/homeComponent';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MatMenuModule,
    Home
  ]
})
export class HomeModule { }
