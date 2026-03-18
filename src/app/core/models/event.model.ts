export interface EventOption {
  id: string;
  label: string;
  probability: number;
  price: number;
  shares: number;
}

export interface Event {
  id: string;
  title: string;
  category: string;
  volume: number;
  status: string;
  endDateUtc: string;
  options: EventOption[];
}

export interface TradeFeedItem {
  tradeId: string;
  optionId: string;
  amount: number;
  cost: number;
  createdAtUtc: string;
}

export interface EventDetail {
  market: Event;
  trades: TradeFeedItem[];
}

export interface PlaceTradePayload {
  optionId: string;
  amount: number;
}

export interface PlaceTradeResponse {
  tradeId: string;
  userBalance: number;
  market: Event;
}

export interface ResolveMarketPayload {
  winningOptionId: string;
}

export interface CreateMarketPayload {
  title: string;
  category: string;
  endDateUtc: string;
  liquidityParameter: number;
  options: string[];
}
