import { NgModule } from '@angular/core';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminRoutingModule } from './admin-routing-module';

@NgModule({
  imports: [AdminRoutingModule, AdminDashboardComponent],
  exports: [AdminDashboardComponent]
})
export class AdminModule {}
