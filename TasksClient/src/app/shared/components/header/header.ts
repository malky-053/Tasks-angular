import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true
})

export class Header {
  authService = inject(AuthService);
  private router = inject(Router);

  // בדיקה אם המשתמש מחובר
  isLoggedIn = computed(() => !!this.authService.currentUser());
  
  // קבלת שם המשתמש המחובר
  userName = computed(() => this.authService.currentUser()?.name);

  onLogout() {
    this.authService.logout();
  }
}
