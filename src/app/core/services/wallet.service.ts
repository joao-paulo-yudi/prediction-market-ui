import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ConfirmPixDepositResponse,
  CreateDepositRequest,
  CreatePixDepositRequest,
  PixDeposit,
  WalletSummary,
  WalletTransaction
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly apiUrl = 'http://localhost:5210/api/wallet';

  constructor(private readonly http: HttpClient) {}

  getSummary(): Observable<WalletSummary> {
    return this.http.get<WalletSummary>(`${this.apiUrl}/summary`);
  }

  getTransactions(take = 60): Observable<WalletTransaction[]> {
    return this.http.get<WalletTransaction[]>(`${this.apiUrl}/transactions?take=${take}`);
  }

  getPixDeposits(take = 30): Observable<PixDeposit[]> {
    return this.http.get<PixDeposit[]>(`${this.apiUrl}/pix/deposit-requests?take=${take}`);
  }

  getDeposits(take = 30): Observable<PixDeposit[]> {
    return this.http.get<PixDeposit[]>(`${this.apiUrl}/deposit-requests?take=${take}`);
  }

  createPixDeposit(payload: CreatePixDepositRequest): Observable<PixDeposit> {
    return this.http.post<PixDeposit>(`${this.apiUrl}/pix/deposit-requests`, payload);
  }

  createDeposit(payload: CreateDepositRequest): Observable<PixDeposit> {
    return this.http.post<PixDeposit>(`${this.apiUrl}/deposit-requests`, payload);
  }

  confirmPixDeposit(depositId: string): Observable<ConfirmPixDepositResponse> {
    return this.http.post<ConfirmPixDepositResponse>(`${this.apiUrl}/pix/deposit-requests/${depositId}/confirm`, {});
  }

  confirmDeposit(depositId: string): Observable<ConfirmPixDepositResponse> {
    return this.http.post<ConfirmPixDepositResponse>(`${this.apiUrl}/deposit-requests/${depositId}/confirm`, {});
  }
}
