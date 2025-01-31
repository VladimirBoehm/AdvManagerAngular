import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Advertisement } from '../../_models/advertisement';

@Injectable({
  providedIn: 'root',
})
export class PublishService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getRegularPublishNextDate(advertisementId: number): Observable<Date> {
    return this.http.get<Date>(
      this.baseUrl + `regularPublish/${advertisementId}`
    );
  }

  publish(advertisement: Advertisement) {
    return this.http.post(this.baseUrl + `regularPublish`, advertisement.id);
  }
}
