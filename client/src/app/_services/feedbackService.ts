import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Feedback } from '../_models/feedback';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  send(feedback: Feedback) {
    this.http.post<string>(this.baseUrl + 'feedback', feedback).subscribe({
      error: (err) => {
        console.error('Error when sending feedback:', err);
      },
    });
  }
}
