import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { PortfolioResponse } from '../../../core/models/user.model';
import { PortfolioService } from '../../../core/services/portfolio.service';

@Component({
  selector: 'app-portfolio-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule],
  templateUrl: './portfolio-page.component.html',
  styleUrl: './portfolio-page.component.css'
})
export class PortfolioPageComponent implements OnInit {
  data: PortfolioResponse | null = null;
  errorMessage = '';

  constructor(private readonly portfolioService: PortfolioService) {}

  ngOnInit(): void {
    this.portfolioService.getPortfolio().subscribe({
      next: (data) => {
        this.data = data;
      },
      error: () => {
        this.errorMessage = 'Faca login para visualizar seu portfolio.';
      }
    });
  }
}
