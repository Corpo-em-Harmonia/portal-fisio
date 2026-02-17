import { NgModule } from '@angular/core';
import { AvaliacaoRoutingModule } from './avaliacao-routing-module';
import { AvaliacaoForm } from './pages/avaliacao-form/avaliacao-form';

@NgModule({
  imports: [ AvaliacaoRoutingModule,AvaliacaoForm ],
})
export class AvaliacaoModule { }
