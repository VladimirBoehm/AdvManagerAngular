import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Advertisement } from '../_models/advertisement';
import { environment } from '../../environments/environment';
import { AdvertisementSearchParams } from '../_framework/constants/advertisementSearchParams';
import { AdvertisementCacheType } from '../_framework/constants/advertisementCacheType';
import { of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdvertisementService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  advertisementCache = new Map<any, Advertisement[]>();
  advertisementSearchParams = signal<AdvertisementSearchParams>(
    new AdvertisementSearchParams()
  );

  getPendingValidationAdvertisements() {
    this.advertisementSearchParams.update((params) => ({
      ...params,
      cacheType: AdvertisementCacheType.History,
    }));

    const cachedResponse = this.advertisementCache.get(
      Object.values(this.advertisementSearchParams()).join('-')
    );
    if (cachedResponse) {
      return of(cachedResponse);
    }

    return this.http
      .get<Advertisement[]>(
        this.baseUrl + 'advertisementAdmin/getPendingAdvertisements'
      )
      .pipe(
        tap((response) => {
          this.advertisementCache.set(
            Object.values(this.advertisementSearchParams()).join('-'),
            response
          );
        })
      );
  }

  getById(id: number) {
    const searchParamsKey = Object.values(
      this.advertisementSearchParams()
    ).join('-');
    const cachedAdvertisement = this.advertisementCache.get(searchParamsKey);
    if (cachedAdvertisement) {
      const result = cachedAdvertisement.find(
        (x: Advertisement) => x.id === id
      );
      if (result) {
        return of(result);
      }
    }
    return this.http.get<Advertisement>(this.baseUrl + `advertisement/${id}`);
  }
}
