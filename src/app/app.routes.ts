import { Routes } from '@angular/router';
import { EventListComponent } from './features/events/event-list/event-list.component';
import { MarketDetailComponent } from './features/events/market-detail/market-detail.component';
import { AuthPageComponent } from './features/auth/auth-page/auth-page.component';
import { PortfolioPageComponent } from './features/portfolio/portfolio-page/portfolio-page.component';
import { authGuard } from './core/guards/auth.guard';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: EventListComponent },
  { path: 'auth', component: AuthPageComponent },
  { path: 'markets/:id', component: MarketDetailComponent },
  { path: 'portfolio', component: PortfolioPageComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] }
];
