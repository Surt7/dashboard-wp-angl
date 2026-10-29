import { Routes } from '@angular/router';
import AdminLayout from './core/layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: async () => {
      const { LoginPageComponent } = await import('./features/auth/pages/login-page.component');
      return LoginPageComponent;
    },
  },
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'machines',
        pathMatch: 'full',
      },
      {
        path: 'machines',
        loadComponent: async () => {
          const { MachinesPageComponent } =
            await import('./features/machines/pages/machine-page.component');
          return MachinesPageComponent;
        },
      },
      {
        path: 'machines/:modelId',
        loadComponent: async () => {
          const { MachinesPageComponent } =
            await import('./features/machines/pages/machine-page.component');
          return MachinesPageComponent;
        },
      },
      {
        path: 'lobby-display',
        loadComponent: async () => {
          const { LobbyDisplayComponent } =
            await import('./features/lobby/lobby-display/lobby-display.component');
          return LobbyDisplayComponent;
        },
      },
      {
        path: 'test-lobby',
        redirectTo: 'lobby-display',
        pathMatch: 'full',
      },
    ],
  },
];
