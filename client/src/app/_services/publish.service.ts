import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

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
  saveRegularPublishDate(advertisementId: number) {
    return this.http.post(
      this.baseUrl + `regularPublish`,
       advertisementId
    );
  }
}
