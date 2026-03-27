import { Routes } from '@angular/router';
import { AppLayoutComponent } from './core/layout/app-layout/app-layout.component';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
//   {
//     path: 'auth',
//     children: [
//       {
//         path: 'login',
//         loadComponent: () =>
//           import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
//       },
//     ],
//   },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      { path: '',         redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'warehouses', loadComponent: () => import('./features/warehouses/pages/warehouses/warehouses.component').then(m => m.WarehousesComponent) },
      { path: 'stock',      loadComponent: () => import('./features/stock/pages/stock/stock.component').then(m => m.StockComponent) },
      { path: 'orders',     loadComponent: () => import('./features/orders/pages/orders/orders.component').then(m => m.OrdersComponent) },
      { path: 'companies',  loadComponent: () => import('./features/companies/pages/companies/companies.component').then(m => m.CompaniesComponent) },
      { path: 'vehicles',   loadComponent: () => import('./features/vehicles/pages/vehicles/vehicles.component').then(m => m.VehiclesComponent) },
      { path: 'drivers',    loadComponent: () => import('./features/drivers/pages/drivers/drivers.component').then(m => m.DriversComponent) },
      { path: 'settings',   loadComponent: () => import('./features/settings/pages/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'products',   loadComponent: () => import('./features/products/pages/products/products.component').then(m => m.ProductsComponent) },
    ],
  },
];