import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { User } from '../shared/models/user';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private API_URL = `${environment.apiUrl}/api/auth`;
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<User | null>(null);

  constructor() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.currentUser.set(JSON.parse(storedUser));
      } catch (e) {
        this.logout();
      }
    }
  }

  login(email: string, password: string) {
    return this.http
      .post<any>(`${this.API_URL}/login`, { email, password })
      .pipe(tap(res => this.saveAuth(res)));
  }

  register(name: string, email: string, password: string) {
    return this.http
      .post<any>(`${this.API_URL}/register`, { name, email, password })
      .pipe(tap(res => this.saveAuth(res)));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  private saveAuth(res: any) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  // בדיקה אם אימייל כבר קיים
  // הבדיקה הראשונית בשרת, אך ניתן להוסיף בדיקה מקדימה כאן
  isEmailTaken(email: string): boolean {
    const users = localStorage.getItem('allUsers');
    if (!users) return false;
    try {
      const userList = JSON.parse(users);
      return userList.some((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    } catch {
      return false;
    }
  }
}