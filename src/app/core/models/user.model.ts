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
