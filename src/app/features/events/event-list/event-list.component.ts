import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
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
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
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
  readonly defaultTradeAmount = 100;

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
    this.tradeAmountByOption[optionId] = Number.isFinite(parsed) && parsed > 0
      ? parsed
      : this.defaultTradeAmount;
  }

  placeTrade(marketId: string, optionId: string): void {
    if (!this.currentUser) {
      this.errorMessage = 'Faca login para enviar ordens.';
      return;
    }

    const amount = this.tradeAmountByOption[optionId] ?? this.defaultTradeAmount;
    if (amount <= 0) {
      this.feedbackMessage = 'O valor da ordem precisa ser maior que zero.';
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
          this.feedbackMessage = `Ordem executada com sucesso. Saldo demo: R$ ${response.userBalance.toFixed(2)}.`;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'Nao foi possivel executar a ordem no momento.';
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
          this.errorMessage = 'Nao foi possivel carregar os mercados. Confirme se a API esta rodando na porta 5208.';
        }
      });
  }

  private groupEvents(): void {
    this.groupedEvents = this.events.reduce((acc, event) => {
      acc[event.category] = acc[event.category] || [];
      acc[event.category].push(event);
      return acc;
    }, {} as Record<string, PredictionEvent[]>);
  }
}
