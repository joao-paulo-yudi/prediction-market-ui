import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UserSummary } from '../../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    RouterLink
  ],
  template: `
  <mat-toolbar class="header">
    <div class="container">
      <div class="left">
        <a class="logo" routerLink="/">
          <img class="logo-img" src="assets/icons/7.svg" alt="Vulpes logo">
          <span class="logo-name">Vulpes</span>
        </a>

        <nav>
          <a routerLink="/">Mercados</a>
          <a routerLink="/portfolio">Portfolio</a>
          <a routerLink="/admin" *ngIf="isAdmin">Admin</a>
          <a routerLink="/auth">Acesso</a>
        </nav>
      </div>

      <div class="right">
        <span class="user-pill" *ngIf="user$ | async as user">
          {{ user.email }}
        </span>
        <button mat-button routerLink="/auth" *ngIf="!(user$ | async)">Entrar</button>
        <button mat-raised-button color="primary" routerLink="/auth" *ngIf="!(user$ | async)">Criar conta</button>
        <button mat-stroked-button *ngIf="user$ | async" (click)="logout()">Sair</button>
      </div>
    </div>
  </mat-toolbar>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(14px);
      background: linear-gradient(95deg, rgba(14, 23, 34, 0.94), rgba(21, 35, 52, 0.94) 35%, rgba(24, 33, 47, 0.94));
      color: #f3f8ff;
      height: 64px;
      padding: 0;
      border-bottom: 1px solid rgba(182, 221, 255, 0.18);
      box-shadow: 0 10px 30px rgba(7, 11, 17, 0.45);
    }

    .container {
      max-width: 1280px;
      width: 100%;
      margin: 0 auto;
      padding: 0 24px;

      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
    }

    .left {
      display: flex;
      align-items: center;
      gap: 32px;
      height: 100%;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      height: 100%;
      padding: 8px 0;
      text-decoration: none;
      color: inherit;
    }

    .logo-img {
      height: 100%;
      max-height: 36px;
      width: auto;
      filter: drop-shadow(0 6px 14px rgba(255, 141, 61, 0.35));
    }

    .logo-name {
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: 0.01em;
      color: #ffefdb;
    }

    nav {
      display: flex;
      align-items: center;
    }

    nav a {
      margin-right: 10px;
      padding: 8px 12px;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.88rem;
      opacity: 0.9;
      color: #d8e8fb;
      transition: opacity 0.2s, background 0.2s, transform 0.2s;
    }

    nav a:hover {
      opacity: 1;
      background: rgba(118, 184, 255, 0.14);
      transform: translateY(-1px);
    }

    .right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-pill {
      border-radius: 999px;
      border: 1px solid rgba(193, 225, 255, 0.35);
      background: rgba(138, 194, 255, 0.14);
      padding: 6px 10px;
      font-size: 0.75rem;
      font-weight: 600;
      max-width: 220px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @media (max-width: 820px) {
      nav {
        display: none;
      }

      .logo-name {
        font-size: 1rem;
      }
    }
  `]
})
export class HeaderComponent {
  readonly user$: Observable<UserSummary | null>;
  isAdmin = false;

  constructor(private readonly authService: AuthService) {
    this.user$ = this.authService.user$;
    this.user$.subscribe(() => {
      this.isAdmin = this.authService.isAdmin();
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
