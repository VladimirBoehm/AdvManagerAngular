import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, shareReplay } from 'rxjs';
import { LoginResponse } from '../../_models/loginResponse';
import { ResponseWrapper } from '../../_entities/responseWrapper';
@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  login(): Observable<ResponseWrapper<LoginResponse>> {
    return this.http
      .get<ResponseWrapper<LoginResponse>>(this.baseUrl + 'account/login')
      .pipe(shareReplay());
  }
}
