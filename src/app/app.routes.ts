import { Routes } from '@angular/router';
import { EventListComponent } from './features/events/event-list/event-list.component';
import { MarketDetailComponent } from './features/events/market-detail/market-detail.component';
import { LoginPageComponent } from './features/auth/login-page/login-page.component';
import { RegisterPageComponent } from './features/auth/register-page/register-page.component';
import { PortfolioPageComponent } from './features/portfolio/portfolio-page/portfolio-page.component';
import { WalletPageComponent } from './features/wallet/wallet-page/wallet-page.component';
import { ProfilePageComponent } from './features/profile/profile-page/profile-page.component';
import { authGuard } from './core/guards/auth.guard';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: EventListComponent },
  { path: 'auth', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: 'auth/login', component: LoginPageComponent },
  { path: 'auth/register', component: RegisterPageComponent },
  { path: 'markets/:id', component: MarketDetailComponent },
  { path: 'portfolio', component: PortfolioPageComponent, canActivate: [authGuard] },
  { path: 'wallet', component: WalletPageComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfilePageComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] }
];
