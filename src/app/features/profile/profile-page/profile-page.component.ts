import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { UserSummary } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {
  readonly user$: Observable<UserSummary | null>;

  constructor(private readonly authService: AuthService) {
    this.user$ = this.authService.user$;
  }
}
