import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Advertisement } from '../_models/advertisement';
import { environment } from '../../environments/environment';
import { AdvertisementSearchParams } from '../_framework/constants/advertisementSearchParams';
import { AdvertisementCacheType } from '../_framework/constants/advertisementCacheType';
import { map, Observable, of, tap } from 'rxjs';
import { UpdateAdvertisementAdminRequest } from '../_models/updateAdvertisementAdminRequest';

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

  getPendingValidationAdvertisements(forceRefresh: boolean = false) {
    if (!forceRefresh) {
      this.advertisementSearchParams.update((params) => ({
        ...params,
        cacheType: AdvertisementCacheType.History,
      }));

      const cachedResponse = this.advertisementCache.get(
        this.getSearchParamsKey()
      );
      if (cachedResponse) {
        return of(cachedResponse);
      }
    }

    return this.http
      .get<Advertisement[]>(
        this.baseUrl + 'advertisementAdmin/getPendingAdvertisements'
      )
      .pipe(
        tap((response) => {
          this.advertisementCache.set(this.getSearchParamsKey(), response);
        })
      );
  }

  getMyAdvertisements(forceRefresh: boolean = false) {
    if (!forceRefresh) {
      this.advertisementSearchParams.update((params) => ({
        ...params,
        cacheType: AdvertisementCacheType.MyAdvertisements,
      }));

      const cachedResponse = this.advertisementCache.get(
        this.getSearchParamsKey()
      );
      if (cachedResponse) {
        return of(cachedResponse);
      }
    }

    return this.http.get<Advertisement[]>(this.baseUrl + 'advertisement').pipe(
      tap((response) => {
        this.advertisementCache.set(this.getSearchParamsKey(), response);
      })
    );
  }

  getById(id: number) {
    const cachedAdvertisements = this.advertisementCache.get(
      this.getSearchParamsKey()
    );
    if (cachedAdvertisements) {
      const result = cachedAdvertisements.find(
        (x: Advertisement) => x.id === id
      );
      if (result) {
        return of(result);
      }
    }
    return this.http.get<Advertisement>(this.baseUrl + `advertisement/${id}`);
  }

  getSearchParamsKey(): string {
    return Object.values(this.advertisementSearchParams()).join('-');
  }

  save(advertisement: Advertisement): Observable<Advertisement> {
    return this.http
      .post<Advertisement>(this.baseUrl + 'advertisement/save', advertisement)
      .pipe(
        tap((savedAdvertisement: Advertisement) => {
          const searchParamsKey = this.getSearchParamsKey();

          const cachedAdvertisements =
            this.advertisementCache.get(searchParamsKey) || [];
          this.advertisementCache.set(searchParamsKey, [
            ...cachedAdvertisements,
            savedAdvertisement,
          ]);
        })
      );
  }

  delete(id: number | undefined) {
    if (!id) return;
    const searchParamsKey = this.getSearchParamsKey();
    const cachedAdvertisements = this.advertisementCache.get(searchParamsKey);

    return this.http
      .delete<Advertisement>(this.baseUrl + `advertisement/${id}`)
      .pipe(
        tap(() => {
          if (cachedAdvertisements) {
            this.advertisementCache.set(
              searchParamsKey,
              cachedAdvertisements.filter((x) => x.id !== id)
            );
          }
        })
      );
  }

  //TODO обновлять cache
  updateAdvertisementAdmin(
    updateAdvertisementAdminRequest: UpdateAdvertisementAdminRequest
  ) {
    return this.http.post(
      this.baseUrl + 'advertisementAdmin',
      updateAdvertisementAdminRequest
    );
  }
}
