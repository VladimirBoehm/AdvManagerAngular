import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { AdvertisementCacheService } from './caches/advertisement.cache.service';
import { Advertisement } from '../_models/advertisement';
import { AppListType } from '../_framework/constants/advListType';
import { DateHelper } from '../_framework/component/helpers/dateHelper';

@Injectable({
  providedIn: 'root',
})
export class PublishService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private advertisementCacheService = inject(AdvertisementCacheService);
  private dateHelper = DateHelper;

  getRegularPublishNextDate(advertisementId: number): Observable<Date> {
    return this.http.get<Date>(
      this.baseUrl + `regularPublish/${advertisementId}`
    );
  }

  publish(advertisement: Advertisement) {
    return this.http
      .post(this.baseUrl + `regularPublish`, advertisement.id)
      .pipe(
        tap(() => {
          // advertisement.updated = this.dateHelper.getUTCTime();
          // this.advertisementCacheService.updateInAllCaches(advertisement);
          // this.advertisementCacheService.resetCache(
          //   AdvListType.PendingPublication
          // );
        })
      );
  }
}
