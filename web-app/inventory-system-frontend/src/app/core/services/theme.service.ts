import { effect, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  readonly isDark = signal<boolean>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const dark = this.isDark();
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this.isDark.update(v => !v);
  }

  private getInitialTheme(): boolean {
    const stored = localStorage.getItem('theme');

    if (stored) {
      return stored === 'dark';  // trust what the user explicitly chose
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}