import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

import { ErrorLogClient } from '../../_models/errorLogClient';

@Injectable({
  providedIn: 'root',
})
export class ErrorLogClientService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  send(errorLog: ErrorLogClient) {
    this.http.post<string>(this.baseUrl + 'errorLog', errorLog).subscribe({
      error: (err) => {
        console.error('Error when sending errorLog:', err);
      },
    });
  }
}
