import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  chartSeries: Array<{
    optionId: string;
    optionLabel: string;
    color: string;
    pointsAttr: string;
    lastX: number;
    lastY: number;
    lastValue: number;
  }> = [];
  chartTicks: Array<{ y: number; label: string }> = [];
  chartStartLabel = '';
  chartEndLabel = '';

  isLoading = false;
  isSubmitting = false;
  message = '';
  errorMessage = '';

  private readonly chartWidth = 920;
  private readonly chartHeight = 320;
  private readonly chartPadding = { top: 18, right: 24, bottom: 40, left: 54 };
  private readonly chartPalette = ['#3bd4a1', '#5aa9ff', '#ff7f66', '#f5ba45', '#c784ff', '#72d6ff'];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
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
    this.amountByOption[optionId] = Number.isFinite(parsed) && parsed >= 1 ? parsed : 100;
  }

  trade(option: EventOption): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const amount = this.amountByOption[option.id] ?? 100;
    if (amount < 1) {
      this.errorMessage = 'Cada ordem deve ser de no minimo 1 acao.';
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.balance < amount) {
      this.errorMessage = 'Saldo insuficiente para executar a ordem. Faça um depósito na carteira.';
      this.router.navigate(['/wallet'], {
        queryParams: { reason: 'insufficient-balance', required: amount, returnUrl: '/' }
      });
      return;
    }

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
          this.authService.refreshProfile();
          this.message = `Ordem executada na opcao ${option.label}.`;
          this.loadMarket();
        },
        error: (error) => {
          const backendMessage = error?.error?.message ?? 'Nao foi possivel enviar ordem.';
          this.errorMessage = backendMessage;

          if (this.isInsufficientBalanceError(backendMessage)) {
            this.router.navigate(['/wallet'], {
              queryParams: { reason: 'insufficient-balance', required: amount, returnUrl: '/' }
            });
          }
        }
      });
  }

  optionLabel(optionId: string): string {
    return this.detail?.market.options.find(x => x.id === optionId)?.label ?? 'Opcao';
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
          this.trades = [...detail.trades].sort((a, b) =>
            new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime()
          );
          this.buildTradeHistoryChart();
        },
        error: () => {
          this.errorMessage = 'Falha ao carregar os dados do mercado.';
        }
      });
  }

  private buildTradeHistoryChart(): void {
    if (!this.detail?.market.options.length || !this.trades.length) {
      this.chartSeries = [];
      this.chartTicks = [];
      this.chartStartLabel = '';
      this.chartEndLabel = '';
      return;
    }

    const options = this.detail.market.options;
    const orderedTrades = [...this.trades].sort((a, b) =>
      new Date(a.createdAtUtc).getTime() - new Date(b.createdAtUtc).getTime()
    );

    const cumulativeByOption: Record<string, number> = {};
    options.forEach((option) => {
      cumulativeByOption[option.id] = 0;
    });

    const snapshots: Array<Record<string, number>> = [Object.fromEntries(
      options.map((option) => [option.id, 0])
    )];

    for (const trade of orderedTrades) {
      cumulativeByOption[trade.optionId] = (cumulativeByOption[trade.optionId] ?? 0) + trade.amount;
      snapshots.push({ ...cumulativeByOption });
    }

    const maxValue = Math.max(
      1,
      ...snapshots.flatMap((snapshot) => options.map((option) => snapshot[option.id] ?? 0))
    );

    const plotWidth = this.chartWidth - this.chartPadding.left - this.chartPadding.right;
    const plotHeight = this.chartHeight - this.chartPadding.top - this.chartPadding.bottom;
    const stepDenominator = Math.max(1, snapshots.length - 1);

    this.chartSeries = options.map((option, index) => {
      const points = snapshots.map((snapshot, pointIndex) => {
        const value = snapshot[option.id] ?? 0;
        const x = this.chartPadding.left + (pointIndex / stepDenominator) * plotWidth;
        const y = this.chartPadding.top + (1 - value / maxValue) * plotHeight;
        return { x, y, value };
      });

      return {
        optionId: option.id,
        optionLabel: option.label,
        color: this.chartPalette[index % this.chartPalette.length],
        pointsAttr: points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' '),
        lastX: points[points.length - 1].x,
        lastY: points[points.length - 1].y,
        lastValue: points[points.length - 1].value
      };
    });

    const tickCount = 4;
    this.chartTicks = Array.from({ length: tickCount + 1 }, (_, index) => {
      const ratio = index / tickCount;
      const value = maxValue * (1 - ratio);
      const y = this.chartPadding.top + ratio * plotHeight;
      return {
        y,
        label: value.toFixed(value >= 10 ? 0 : 2)
      };
    });

    const firstTrade = orderedTrades[0];
    const lastTrade = orderedTrades[orderedTrades.length - 1];
    this.chartStartLabel = this.formatAxisDate(firstTrade.createdAtUtc);
    this.chartEndLabel = this.formatAxisDate(lastTrade.createdAtUtc);
  }

  private formatAxisDate(value: string): string {
    const date = new Date(value);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
}
