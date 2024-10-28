import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { AdvertisementCacheService } from './caches/advertisement.cache.service';
import { Advertisement } from '../_models/advertisement';

@Injectable({
  providedIn: 'root',
})
export class PublishService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private advertisementCacheService = inject(AdvertisementCacheService);

  getRegularPublishNextDate(advertisementId: number): Observable<Date> {
    return this.http.get<Date>(
      this.baseUrl + `regularPublish/${advertisementId}`
    );
  }

  unblockNextPublishDate(advertisement: Advertisement) {
    return this.http
      .post(this.baseUrl + `regularPublish`, advertisement.id)
      .pipe(
        tap(() => {
          this.advertisementCacheService.updateInAllCaches(advertisement);
        })
      );
  }
}
