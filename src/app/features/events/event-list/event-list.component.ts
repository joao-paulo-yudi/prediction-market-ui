import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { EventService } from '../event.service';
import { Event as PredictionEvent } from '../../../core/models/event.model';
import { AuthService } from '../../../core/services/auth.service';
import { UserSummary } from '../../../core/models/user.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    RouterLink
  ],
  templateUrl: './event-list.template.html',
  styleUrls: ['./event-list.style.css']
})
export class EventListComponent implements OnInit {

  events: PredictionEvent[] = [];
  groupedEvents: Record<string, PredictionEvent[]> = {};
  tradeAmountByOption: Record<string, number> = {};
  submittingOptions: Record<string, boolean> = {};
  isLoading = false;
  errorMessage = '';
  feedbackMessage = '';
  currentUser: UserSummary | null = null;
  searchTerm = '';
  categoryFilter = 'all';
  readonly defaultTradeAmount = 100;
  readonly minimumOrderAmount = 1;

  private readonly categoryImages: Record<string, string> = {
    'Politica BR': 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?auto=format&fit=crop&w=1200&q=70',
    'Economia BR': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=70',
    Cripto: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?auto=format&fit=crop&w=1200&q=70'
  };

  constructor(
    private readonly eventService: EventService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadEvents();
  }

  setTradeAmount(optionId: string, value: string): void {
    const parsed = Number(value);
    this.tradeAmountByOption[optionId] = Number.isFinite(parsed) && parsed >= this.minimumOrderAmount
      ? parsed
      : this.defaultTradeAmount;
  }

  placeTrade(marketId: string, optionId: string): void {
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const amount = this.tradeAmountByOption[optionId] ?? this.defaultTradeAmount;
    if (amount < this.minimumOrderAmount) {
      this.feedbackMessage = 'Cada ordem deve ser de no mínimo 1 ação.';
      return;
    }

    if (this.currentUser.balance < amount) {
      this.errorMessage = 'Saldo insuficiente para executar a ordem. Faça um depósito na carteira.';
      this.router.navigate(['/wallet'], {
        queryParams: { reason: 'insufficient-balance', required: amount, returnUrl: '/' }
      });
      return;
    }

    this.errorMessage = '';
    this.feedbackMessage = '';
    this.submittingOptions[optionId] = true;

    this.eventService.placeTrade(marketId, { optionId, amount })
      .pipe(finalize(() => {
        this.submittingOptions[optionId] = false;
      }))
      .subscribe({
        next: (response) => {
          this.events = this.events.map(event =>
            event.id === response.market.id ? response.market : event
          );
          this.groupEvents();
          this.authService.refreshProfile();
          this.feedbackMessage = `Ordem executada com sucesso. Saldo demo: R$ ${response.userBalance.toFixed(2)}.`;
        },
        error: (error) => {
          const backendMessage = error?.error?.message ?? 'Não foi possível executar a ordem no momento.';
          this.errorMessage = backendMessage;

          if (this.isInsufficientBalanceError(backendMessage)) {
            this.router.navigate(['/wallet'], {
              queryParams: { reason: 'insufficient-balance', required: amount, returnUrl: '/' }
            });
          }
        }
      });
  }

  closeMarket(marketId: string): void {
    this.eventService.closeMarket(marketId).subscribe({
      next: () => {
        this.feedbackMessage = 'Mercado fechado com sucesso.';
        this.loadEvents();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Falha ao fechar mercado.';
      }
    });
  }

  resolveMarket(marketId: string, winningOptionId: string): void {
    this.eventService.resolveMarket(marketId, { winningOptionId }).subscribe({
      next: () => {
        this.feedbackMessage = 'Mercado resolvido e liquidado.';
        this.loadEvents();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Falha ao resolver mercado.';
      }
    });
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  openMarket(marketId: string): void {
    this.router.navigate(['/markets', marketId]);
  }

  openMarketFromKey(event: globalThis.Event, marketId: string): void {
    event.preventDefault();
    this.openMarket(marketId);
  }

  trackByEventId(_: number, event: PredictionEvent): string {
    return event.id;
  }

  trackByOptionId(_: number, option: { id: string }): string {
    return option.id;
  }

  getCardImage(category: string): string {
    return this.categoryImages[category] ?? 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1200&q=70';
  }

  applyFilters(): void {
    this.groupEvents();
  }

  categories(): string[] {
    return [...new Set(this.events.map(event => event.category))].sort((a, b) => a.localeCompare(b));
  }

  countByStatus(status: string): number {
    return this.events.filter(event => event.status === status).length;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Open':
        return 'ABERTO';
      case 'Closed':
        return 'FECHADO';
      case 'Resolved':
        return 'RESOLVIDO';
      default:
        return status.toUpperCase();
    }
  }

  totalVolume(): number {
    return this.events.reduce((acc, event) => acc + event.volume, 0);
  }

  private isInsufficientBalanceError(message: string): boolean {
    const normalized = message.toLowerCase();

    const hasInsufficientKeyword =
      normalized.includes('insuficiente')
      || normalized.includes('insufficient')
      || normalized.includes('not enough');

    const hasBalanceKeyword =
      normalized.includes('saldo')
      || normalized.includes('balance')
      || normalized.includes('funds')
      || normalized.includes('carteira');

    return hasInsufficientKeyword && hasBalanceKeyword;
  }

  private loadEvents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.eventService.getEvents()
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (events) => {
          this.events = events;
          this.groupEvents();
        },
        error: () => {
          this.errorMessage = 'Não foi possivel carregar os mercados no momento. Tente novamente mais tarde.';
        }
      });
  }

  private groupEvents(): void {
    const normalizedTerm = this.searchTerm.trim().toLowerCase();

    const filtered = this.events.filter((event) => {
      const categoryMatches = this.categoryFilter === 'all' || event.category === this.categoryFilter;
      if (!categoryMatches) {
        return false;
      }

      if (!normalizedTerm) {
        return true;
      }

      const haystack = [
        event.title,
        event.category,
        ...event.options.map(option => option.label)
      ].join(' ').toLowerCase();

      return haystack.includes(normalizedTerm);
    });

    this.groupedEvents = filtered.reduce((acc, event) => {
      acc[event.category] = acc[event.category] || [];
      acc[event.category].push(event);
      return acc;
    }, {} as Record<string, PredictionEvent[]>);
  }
}
