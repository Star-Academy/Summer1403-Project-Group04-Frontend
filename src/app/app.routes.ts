import { Routes } from '@angular/router';
import { AuthComponent } from './page/auth/auth.component';
import { DashboardComponent } from './page/dashboard/dashboard.component';
import { AuthGuardService } from './services/gaurds/auth-guard/auth-guard.service';
import { ProfileComponent } from './components/profile/profile.component';
import { UsersTableComponent } from './components/users-table/users-table.component';
import { DashboardGuardService } from './services/gaurds/dashboard-guard/dashboard-guard.service';

export const routes: Routes = [
  { path: '', component: AuthComponent, canActivate: [AuthGuardService] },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'manage-users',
        component: UsersTableComponent
      }
    ],
    canActivate: [DashboardGuardService],
  },
];
