import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { EventService } from '../../events/event.service';
import { Event } from '../../../core/models/event.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    RouterLink
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  markets: Event[] = [];
  loading = false;
  submitting = false;
  feedback = '';
  errorMessage = '';

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(12)]],
    category: ['', [Validators.required]],
    endDateUtc: ['', [Validators.required]],
    liquidityParameter: [100, [Validators.required, Validators.min(10)]],
    optionsText: ['Sim\nNao', [Validators.required]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadMarkets();
  }

  createMarket(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const options = (this.form.value.optionsText ?? '')
      .split('\n')
      .map(x => x.trim())
      .filter(Boolean);

    this.submitting = true;
    this.errorMessage = '';
    this.feedback = '';

    this.eventService.createMarket({
      title: this.form.value.title ?? '',
      category: this.form.value.category ?? '',
      endDateUtc: new Date(this.form.value.endDateUtc ?? '').toISOString(),
      liquidityParameter: Number(this.form.value.liquidityParameter ?? 100),
      options
    })
      .pipe(finalize(() => {
        this.submitting = false;
      }))
      .subscribe({
        next: () => {
          this.feedback = 'Mercado criado com sucesso.';
          this.form.patchValue({
            title: '',
            category: '',
            optionsText: 'Sim\nNao'
          });
          this.loadMarkets();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'Falha ao criar mercado.';
        }
      });
  }

  closeMarket(marketId: string): void {
    this.eventService.closeMarket(marketId).subscribe({
      next: () => {
        this.feedback = 'Mercado fechado.';
        this.loadMarkets();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Falha ao fechar mercado.';
      }
    });
  }

  resolveMarket(marketId: string, optionId: string): void {
    this.eventService.resolveMarket(marketId, { winningOptionId: optionId }).subscribe({
      next: () => {
        this.feedback = 'Mercado resolvido.';
        this.loadMarkets();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Falha ao resolver mercado.';
      }
    });
  }

  private loadMarkets(): void {
    this.loading = true;
    this.eventService.getEvents()
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (markets) => {
          this.markets = markets;
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar os mercados.';
        }
      });
  }
}
