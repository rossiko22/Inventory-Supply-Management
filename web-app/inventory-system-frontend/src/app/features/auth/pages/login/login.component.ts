import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    MessageModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly showPassword = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false]
  });

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if(this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();

    this.isLoading.set(true);
    this.errorMessage.set(null);

  this.authService.login({ email: email!, password: password!}).subscribe({
    next: (res) => {
      console.log("SUCCESS", res);
      this.isLoading.set(false); // ⚠️ ADD THIS
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      console.log("ERROR", err);
      this.errorMessage.set(err.error?.message ?? 'Invalid email or password');
      this.isLoading.set(false);
    },
    complete: () => {
      console.log("COMPLETED");
    }
  });
  
  }
}
