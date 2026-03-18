import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { finalize } from 'rxjs';
import { EventDetail, EventOption, TradeFeedItem } from '../../../core/models/event.model';
import { EventService } from '../event.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-market-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './market-detail.component.html',
  styleUrl: './market-detail.component.css'
})
export class MarketDetailComponent implements OnInit {
  marketId = '';
  detail: EventDetail | null = null;
  trades: TradeFeedItem[] = [];
  amountByOption: Record<string, number> = {};

  isLoading = false;
  isSubmitting = false;
  message = '';
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly eventService: EventService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.marketId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.marketId) {
      this.errorMessage = 'Mercado invalido.';
      return;
    }

    this.loadMarket();
  }

  setAmount(optionId: string, value: string): void {
    const parsed = Number(value);
    this.amountByOption[optionId] = Number.isFinite(parsed) && parsed > 0 ? parsed : 100;
  }

  trade(option: EventOption): void {
    if (!this.authService.isAuthenticated()) {
      this.errorMessage = 'Faca login para operar.';
      return;
    }

    const amount = this.amountByOption[option.id] ?? 100;
    this.errorMessage = '';
    this.message = '';
    this.isSubmitting = true;

    this.eventService.placeTrade(this.marketId, {
      optionId: option.id,
      amount
    })
      .pipe(finalize(() => {
        this.isSubmitting = false;
      }))
      .subscribe({
        next: () => {
          this.message = `Ordem executada na opcao ${option.label}.`;
          this.loadMarket();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'Nao foi possivel enviar ordem.';
        }
      });
  }

  optionLabel(optionId: string): string {
    return this.detail?.market.options.find(x => x.id === optionId)?.label ?? 'Opcao';
  }

  private loadMarket(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.eventService.getEventById(this.marketId)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (detail) => {
          this.detail = detail;
          this.trades = detail.trades;
        },
        error: () => {
          this.errorMessage = 'Falha ao carregar os dados do mercado.';
        }
      });
  }
}
