import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortfolioResponse } from '../models/user.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly apiUrl = `${API_BASE_URL}/users/me/portfolio`;

  constructor(private readonly http: HttpClient) {}

  getPortfolio(): Observable<PortfolioResponse> {
    return this.http.get<PortfolioResponse>(this.apiUrl);
  }
}
