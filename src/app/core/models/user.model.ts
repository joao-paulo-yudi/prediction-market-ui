export interface AuthRequest {
  email: string;
  password: string;
}

export interface UserSummary {
  id: string;
  email: string;
  balance: number;
  role: 'admin' | 'trader' | string;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}

export interface PortfolioPosition {
  marketId: string;
  marketTitle: string;
  optionId: string;
  optionLabel: string;
  quantity: number;
  avgEntryPrice: number;
  markPrice: number;
  unrealizedPnL: number;
}

export interface PortfolioResponse {
  userId: string;
  email: string;
  balance: number;
  positions: PortfolioPosition[];
}

export interface WalletSummary {
  userId: string;
  currentBalance: number;
  pendingPixAmount: number;
  pendingCardAmount: number;
  pendingBoletoAmount: number;
  totalCredits: number;
  totalDebits: number;
  lastUpdatedUtc: string;
}

export interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceId: string | null;
  createdAtUtc: string;
}

export interface PixDeposit {
  id: string;
  amount: number;
  paymentMethod: 'Pix' | 'Card' | 'Boleto' | string;
  status: 'Pending' | 'Paid' | 'Expired' | 'Cancelled' | string;
  pixKey: string;
  pixCopyPasteCode: string;
  externalReference: string;
  expiresAtUtc: string;
  paidAtUtc: string | null;
  createdAtUtc: string;
}

export interface CreatePixDepositRequest {
  amount: number;
}

export interface CreateDepositRequest {
  amount: number;
  method: 'pix' | 'card' | 'boleto';
}

export interface ConfirmPixDepositResponse {
  deposit: PixDeposit;
  currentBalance: number;
}
