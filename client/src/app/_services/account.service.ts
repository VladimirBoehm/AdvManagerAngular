import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { User } from '../_models/user';
import { Observable, tap } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  currentUser = signal<User | null>(null);

  login(): Observable<User> {
    return this.http.get<User>(this.baseUrl + 'account/getLoginData').pipe(
      tap((user: User) => {
        this.currentUser.set(user);
      })
    );
  }
}
