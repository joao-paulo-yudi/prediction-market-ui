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
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  </main>
  `,
  styles: [`
    .main {
      background:
        radial-gradient(circle at 85% -20%, rgba(255, 150, 75, 0.22), transparent 36%),
        radial-gradient(circle at 0% 0%, rgba(89, 176, 255, 0.15), transparent 28%),
        linear-gradient(180deg, #0c121a 0%, #070c12 100%);
      min-height: calc(100vh - 64px);
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px 20px 48px;
    }

    @media (max-width: 640px) {
      .container {
        padding: 18px 14px 36px;
      }
    }
  `]
})
export class AppComponent {}
