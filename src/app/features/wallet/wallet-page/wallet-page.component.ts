import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import {
  PixDeposit,
  WalletSummary,
  WalletTransaction
} from '../../../core/models/user.model';
import { WalletService } from '../../../core/services/wallet.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-wallet-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './wallet-page.component.html',
  styleUrl: './wallet-page.component.css'
})
export class WalletPageComponent implements OnInit {
  summary: WalletSummary | null = null;
  transactions: WalletTransaction[] = [];
  pixDeposits: PixDeposit[] = [];

  selectedMethod: 'pix' | 'card' | 'boleto' = 'pix';
  depositAmount = 100;
  isLoading = false;
  isCreatingPix = false;
  isConfirmingPix: Record<string, boolean> = {};
  infoMessage = '';
  errorMessage = '';
  shouldShowMarketRedirect = false;
  returnUrl = '/';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly walletService: WalletService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.applyNavigationContext();
    this.loadData();
  }

  createDeposit(): void {
    if (this.depositAmount < 5) {
      this.errorMessage = 'O valor mínimo para depósito é de R$ 5,00.';
      return;
    }

    this.errorMessage = '';
    this.infoMessage = '';
    this.isCreatingPix = true;

    this.walletService.createDeposit({ amount: this.depositAmount, method: this.selectedMethod })
      .pipe(finalize(() => {
        this.isCreatingPix = false;
      }))
      .subscribe({
        next: (deposit) => {
          if (deposit.paymentMethod === 'Pix') {
            this.infoMessage = `PIX gerado com sucesso. Referência: ${deposit.externalReference}.`;
          } else if (deposit.paymentMethod === 'Card') {
            this.infoMessage = 'Pagamento com cartão iniciado. Abrindo checkout seguro para concluir o pagamento.';
            this.openCheckout(deposit.pixCopyPasteCode);
          } else {
            this.infoMessage = 'Boleto gerado. Abrindo checkout para emissão e pagamento.';
            this.openCheckout(deposit.pixCopyPasteCode);
          }
          this.loadData();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'Falha ao iniciar depósito.';
        }
      });
  }

  confirmPix(deposit: PixDeposit): void {
    if (deposit.status !== 'Pending') {
      return;
    }

    this.errorMessage = '';
    this.infoMessage = '';
    this.isConfirmingPix[deposit.id] = true;

    this.walletService.confirmDeposit(deposit.id)
      .pipe(finalize(() => {
        this.isConfirmingPix[deposit.id] = false;
      }))
      .subscribe({
        next: (response) => {
          this.infoMessage = `Depósito confirmado. Novo saldo: R$ ${response.currentBalance.toFixed(2)}.`;
          this.authService.refreshProfile();
          this.loadData();

          if (this.shouldShowMarketRedirect) {
            this.router.navigateByUrl(this.returnUrl);
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'Não foi possivel confirmar o pagamento.';
        }
      });
  }

  copyPixCode(code: string): void {
    navigator.clipboard.writeText(code)
      .then(() => {
        this.infoMessage = 'Código de pagamento copiado para a area de transferência.';
      })
      .catch(() => {
        this.errorMessage = 'Falha ao copiar o código de pagamento.';
      });
  }

  openCheckout(url: string): void {
    if (!this.isValidHttpUrl(url)) {
      this.errorMessage = 'URL de checkout inválida.';
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  signedAmount(amount: number): string {
    return amount >= 0 ? `+${amount.toFixed(2)}` : amount.toFixed(2);
  }

  canOpenCheckout(deposit: PixDeposit): boolean {
    return (deposit.paymentMethod === 'Card' || deposit.paymentMethod === 'Boleto')
      && this.isValidHttpUrl(deposit.pixCopyPasteCode);
  }

  private isValidHttpUrl(value: string): boolean {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private loadData(): void {
    this.isLoading = true;

    this.walletService.getSummary()
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (summary) => {
          this.summary = summary;
        },
        error: () => {
          this.errorMessage = 'Não foi possivel carregar os dados da carteira.';
        }
      });

    this.walletService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
      }
    });

    this.walletService.getDeposits().subscribe({
      next: (pixDeposits) => {
        this.pixDeposits = pixDeposits;
      }
    });
  }

  private applyNavigationContext(): void {
    const reason = this.route.snapshot.queryParamMap.get('reason');
    const requiredAmount = Number(this.route.snapshot.queryParamMap.get('required') ?? 0);
    const requestedReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';

    this.shouldShowMarketRedirect = reason === 'insufficient-balance';
    this.returnUrl = requestedReturnUrl.startsWith('/') ? requestedReturnUrl : '/';

    if (this.shouldShowMarketRedirect) {
      this.infoMessage = requiredAmount > 0
        ? `Saldo insuficiente para ordem de R$ ${requiredAmount.toFixed(2)}. Adicione saldo para continuar.`
        : 'Saldo insuficiente para completar a ordem. Adicione saldo para continuar.';
    }
  }
}
