import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
    RouterLink,
    RouterLinkActive
  ],
  template: `
  <mat-toolbar class="header">
    <div class="container">
      <div class="left">
        <a class="logo" routerLink="/">
          <img class="logo-img" src="assets/icons/7.svg" alt="Vulpes logo">
        </a>

        <nav>
          <a routerLink="/" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="active">Mercados</a>
          <a routerLink="/portfolio" routerLinkActive="active">Portfólio</a>
          <a routerLink="/wallet" routerLinkActive="active" *ngIf="user$ | async">Carteira</a>
          <a routerLink="/admin" routerLinkActive="active" *ngIf="isAdmin">Admin</a>
        </nav>
      </div>

      <div class="right">
        <a class="user-pill" *ngIf="user$ | async as user" routerLink="/profile" title="Abrir perfil">
          <span class="user-email" [title]="user.email">{{ user.email }}</span>
          <span class="user-sep">·</span>
          <span class="user-balance">R$ {{ user.balance | number: '1.2-2' }}</span>
        </a>
        <button mat-button routerLink="/auth/login" *ngIf="!(user$ | async)">Entrar</button>
        <button mat-raised-button color="primary" routerLink="/auth/register" *ngIf="!(user$ | async)">Criar conta</button>
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
      background: linear-gradient(95deg, rgba(14, 18, 27, 0.95), rgba(20, 26, 39, 0.95) 35%, rgba(16, 22, 33, 0.95));
      color: #edf2fb;
      min-height: 64px;
      padding: 0;
      border-bottom: 1px solid rgba(120, 136, 167, 0.24);
      box-shadow: 0 10px 30px rgba(7, 11, 17, 0.45), inset 0 -1px 0 rgba(255, 255, 255, 0.04);
    }

    .container {
      max-width: 1280px;
      width: 100%;
      margin: 0 auto;
      padding: 0 24px;

      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      min-height: 64px;
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
      min-height: 64px;
      padding: 8px 0;
      text-decoration: none;
      color: inherit;
    }

    .logo-img {
      height: 100%;
      max-height: 36px;
      width: auto;
      filter: drop-shadow(0 6px 14px rgba(0, 232, 96, 0.24));
    }

    .logo-name {
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: 0.01em;
      color: #e9edf7;
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
      color: #d7deee;
      transition: opacity 0.2s, background 0.2s, transform 0.2s;
    }

    nav a:hover {
      opacity: 1;
      background: rgba(126, 142, 175, 0.2);
      transform: translateY(-1px);
    }

    nav a.active {
      opacity: 1;
      color: #effff6;
      background: linear-gradient(180deg, rgba(0, 232, 96, 0.22), rgba(0, 200, 83, 0.1));
      box-shadow: inset 0 0 0 1px rgba(0, 232, 96, 0.3);
    }

    .right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: 999px;
      border: 1px solid rgba(124, 138, 168, 0.32);
      background: rgba(34, 43, 62, 0.55);
      padding: 6px 10px;
      font-size: 0.75rem;
      font-weight: 600;
      max-width: min(360px, 44vw);
      color: #eaf2ff;
      text-decoration: none;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }

    .user-email {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #dfe7f7;
    }

    .user-sep {
      opacity: 0.65;
      flex: 0 0 auto;
    }

    .user-balance {
      flex: 0 0 auto;
      color: #b9ffd9;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .user-pill:hover {
      border-color: rgba(0, 232, 96, 0.46);
      background: rgba(40, 54, 75, 0.8);
    }

    @media (max-width: 820px) {
      .header {
        padding: 6px 0;
      }

      .container {
        flex-wrap: wrap;
        justify-content: center;
        padding-bottom: 8px;
      }

      .left,
      .right {
        width: 100%;
        justify-content: center;
      }

      nav {
        display: none;
      }

      .logo-name {
        font-size: 1rem;
      }

      .user-pill {
        max-width: min(100%, 94vw);
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
