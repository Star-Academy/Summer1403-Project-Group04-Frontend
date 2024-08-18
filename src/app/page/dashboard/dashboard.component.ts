import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { SignInComponent } from "../../components/sign-in/sign-in.component";
import { AuthComponent } from "../auth/auth.component";
import { UsersTableComponent } from "../../components/users-table/users-table.component";
import { PermisionsService } from '../../services/permisisons/permisions.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    SidebarComponent,
    SignInComponent,
    AuthComponent,
    UsersTableComponent
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  isCollapsed = false;

  constructor(private premissionSubject: PermisionsService) {
    this.premissionSubject.permissions$.subscribe((v) => {
      console.log(v)
    })
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
