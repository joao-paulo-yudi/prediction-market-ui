import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent {
  isLoading = false;
  isRegisterMode = false;
  errorMessage = '';

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(12)]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  switchMode(register: boolean): void {
    this.isRegisterMode = register;
    this.errorMessage = '';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    const payload = {
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? ''
    };
    const request$ = this.isRegisterMode
      ? this.authService.register(payload)
      : this.authService.login(payload);

    request$
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/');
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'Falha de autenticacao.';
        }
      });
  }
}
