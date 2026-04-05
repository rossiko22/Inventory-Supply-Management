import {Component, computed, inject, signal} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import {email} from '@angular/forms/signals';


interface NavItem {
  label: string;
  route: string;
  icon: string; // SVG path d attribute
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  route: '/dashboard',  icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Warehouses', route: '/warehouses', icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z' },
  { label: "Products",   route: '/products',   icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z'},
  { label: 'Stock',      route: '/stock',      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Orders',     route: '/orders',     icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Companies',  route: '/companies',  icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { label: 'Vehicles',   route: '/vehicles',   icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { label: 'Drivers',    route: '/drivers',    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];


@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, TooltipModule, AvatarModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authService.currentUser;
  readonly initials = this.authService.initials;
  readonly fullName = this.authService.fullName;
  readonly roleLabel = this.authService.roleLabel;
  readonly userEmail = this.authService.userEmail;

  readonly collapsed = signal(false);
  readonly navItems = NAV_ITEMS;

  private readonly avatarColors = [
    '#6366f1', // indigo
    '#22c55e', // green
    '#06b6d4', // cyan
    '#f59e0b', // amber
    '#ef4444', // red
    '#a855f7', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#3b82f6', // blue
    '#84cc16'  // lime
  ];

  readonly avatarColor = computed(() => {
    const user = this.authService.currentUser(); // or this.authService.currentUser()
    if (!user) return '#6366f1';

    const str = user.email || user.name;

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % this.avatarColors.length;
    return this.avatarColors[index];
  });


  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    })
  }

  protected readonly email = email;
}
