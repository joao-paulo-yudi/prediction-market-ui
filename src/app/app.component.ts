import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent
  ],
  template: `
  <app-header></app-header>

  <main class="main">
    <div class="container fade-in-up">
      <router-outlet></router-outlet>
    </div>
  </main>
  `,
  styles: [`
    .main {
      background:
        radial-gradient(circle at 85% -20%, rgba(0, 232, 96, 0.08), transparent 36%),
        radial-gradient(circle at 0% 0%, rgba(44, 227, 138, 0.05), transparent 28%),
        linear-gradient(180deg, #0a0d13 0%, #07090d 100%);
      min-height: calc(100vh - 64px);
    }

    .container {
      max-width: 1340px;
      margin: 0 auto;
      padding: 28px 22px 56px;
    }

    @media (max-width: 640px) {
      .container {
        padding: 18px 14px 40px;
      }
    }
  `]
})
export class AppComponent {}
