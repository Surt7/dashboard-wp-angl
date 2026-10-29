import { Component } from '@angular/core';
import { RouterOutlet, RouterLinkActive, RouterLink } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { AdminFooterComponent } from './footer/admin-footer.component';
import { NavIconButtonComponent } from './nav-icon-button/nav-icon-button.component';

export interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
  standalone: true,
  imports: [
    RouterOutlet,
    DividerModule,
    TooltipModule,
    AdminFooterComponent,
    NavIconButtonComponent,
  ],
})
export default class AdminLayout {
  protected readonly navItems: NavItem[] = [
    { icon: 'pi pi-home', label: 'Dashboard', route: '/dashboard' },
    { icon: 'pi pi-server', label: 'Machines', route: '/machines' },
    { icon: 'pi pi-trophy', label: 'Leaderboard', route: '/leaderboard' },
    { icon: 'pi pi-users', label: 'Utilisateurs', route: '/users' },
    { icon: 'pi pi-desktop', label: 'Display Lobby', route: '/lobby-display' },
    { icon: 'pi pi-truck', label: 'Transports', route: '/transports' },
  ];
}
