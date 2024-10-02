import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { User } from '../_models/user';
// Singleton создает при создании приложения, подходит для хранения состояния
@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);
  isAdmin: boolean = false;
  baseUrl = environment.apiUrl;
  currentUser = signal<User | null>(null);

  login() {
    this.http.get<User>(this.baseUrl + 'account/getLoginData').subscribe({
      next: (user: User) => {
        this.currentUser.set(user);
        console.log(user);
      },
      error: (error) => {
        console.error('Error during login:', error);
      },
    });
  }
}
