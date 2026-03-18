import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    Event,
    EventDetail,
    CreateMarketPayload,
    PlaceTradePayload,
    PlaceTradeResponse,
    ResolveMarketPayload,
    TradeFeedItem
} from '../../core/models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
        private readonly apiUrl = 'http://localhost:5208/api/markets';

        constructor(private readonly http: HttpClient) {}

        getEvents(): Observable<Event[]> {
            return this.http.get<Event[]>(this.apiUrl);
        }

        getEventById(marketId: string): Observable<EventDetail> {
            return this.http.get<EventDetail>(`${this.apiUrl}/${marketId}`);
        }

        getTrades(marketId: string): Observable<TradeFeedItem[]> {
            return this.http.get<TradeFeedItem[]>(`${this.apiUrl}/${marketId}/trades`);
        }

        placeTrade(marketId: string, payload: PlaceTradePayload): Observable<PlaceTradeResponse> {
            return this.http.post<PlaceTradeResponse>(`${this.apiUrl}/${marketId}/trades`, payload);
        }

        closeMarket(marketId: string): Observable<{ message: string }> {
            return this.http.post<{ message: string }>(`${this.apiUrl}/${marketId}/close`, {});
        }

        resolveMarket(marketId: string, payload: ResolveMarketPayload): Observable<{ message: string }> {
            return this.http.post<{ message: string }>(`${this.apiUrl}/${marketId}/resolve`, payload);
        }

        createMarket(payload: CreateMarketPayload): Observable<Event> {
            return this.http.post<Event>(this.apiUrl, payload);
        }
}
