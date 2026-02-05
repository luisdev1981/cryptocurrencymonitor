import { Routes } from '@angular/router';
import { CryptoMonitorComponent } from './features/crypto-monitor/components/crypto-monitor/crypto-monitor.component';

export const routes: Routes = [
  { path: '', component: CryptoMonitorComponent },
  { path: '**', redirectTo: '' }
];

