import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortfolioResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly apiUrl = 'http://localhost:5208/api/users/me/portfolio';

  constructor(private readonly http: HttpClient) {}

  getPortfolio(): Observable<PortfolioResponse> {
    return this.http.get<PortfolioResponse>(this.apiUrl);
  }
}
