import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InitialRequestComponent } from './pages/initial-request/initial-request.component';
import { RequestedItemComponent } from './pages/requested-item/requested-item.component';
import { VendorInfoComponent } from './pages/vendor-info/vendor-info.component';
import { SummaryComponent } from './pages/summary/summary.component';

const routes: Routes = [
  { path: '', redirectTo: '/initial-request', pathMatch: 'full' },
  { path: 'initial-request', component: InitialRequestComponent },
  { path: 'requested-item', component: RequestedItemComponent },
  { path: 'vendor-info', component: VendorInfoComponent },
  { path: 'summary', component: SummaryComponent },
  { path: '**', redirectTo: '/initial-request' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
