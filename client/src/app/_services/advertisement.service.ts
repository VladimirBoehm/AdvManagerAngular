import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Advertisement } from '../_models/advertisement';
import { environment } from '../../environments/environment';
import { AdvertisementSearchParams } from '../_framework/constants/advertisementSearchParams';
import { AdvertisementCacheType } from '../_framework/constants/advertisementCacheType';
import { map, Observable, of, tap } from 'rxjs';
import { UpdateAdvertisementAdminRequest } from '../_models/updateAdvertisementAdminRequest';
import { UpdateAdvertisementStatusRequest } from '../_models/updateAdvertisementStatusRequest';
import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';
import { AdvertisementCacheService } from './advertisement.cache.service';

@Injectable({
  providedIn: 'root',
})
export class AdvertisementService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private advertisementCacheService = inject(AdvertisementCacheService);
  
  advertisementCache = new Map<any, Advertisement[]>();
  advertisementSearchParams = signal<AdvertisementSearchParams>(
    new AdvertisementSearchParams()
  );

  getPendingValidationAdvertisements(
    forceRefresh: boolean = false
  ): Observable<Advertisement[]> {
    if (!forceRefresh) {
      this.advertisementSearchParams.update((params) => ({
        ...params,
        cacheType: AdvertisementCacheType.History,
      }));

      const cachedResponse = this.advertisementCacheService.getCache();
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
          this.advertisementCacheService.setCache(response);
        })
      );
  }

  getMyAdvertisements(forceRefresh: boolean = false) {
    if (!forceRefresh) {
      this.advertisementCacheService.setSearchParams(
        AdvertisementCacheType.MyAdvertisements
      );
      const cachedResponse = this.advertisementCacheService.getCache();
      if (cachedResponse) {
        return of(cachedResponse);
      }
    }

    return this.http.get<Advertisement[]>(this.baseUrl + 'advertisement').pipe(
      tap((response) => {
        this.advertisementCacheService.setCache(response);
      })
    );
  }

  getById(id: number) {
    const cachedAdvertisements = this.advertisementCacheService.getCache();
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

  save(advertisement: Advertisement): Observable<Advertisement> {
    return this.http
      .post<Advertisement>(this.baseUrl + 'advertisement/save', advertisement)
      .pipe(
        tap((savedAdvertisement: Advertisement) => {
          this.advertisementCacheService.addItem(savedAdvertisement);
        })
      );
  }

  update(advertisement: Advertisement) {
    return this.http
      .put<Advertisement>(this.baseUrl + 'advertisement', advertisement)
      .pipe(
        tap(() => {
          this.advertisementCacheService.updateItem(advertisement);
        })
      );
  }

  updateStatus(advertisement: Advertisement) {
    let updateAdvertisementStatusRequest = {
      advertisementId: advertisement.id,
      advertisementStatus: advertisement.statusId,
    } as UpdateAdvertisementStatusRequest;

    return this.http
      .put<UpdateAdvertisementStatusRequest>(
        this.baseUrl + 'advertisement/updateStatus',
        updateAdvertisementStatusRequest
      )
      .pipe(
        tap(() => {
          this.advertisementCacheService.updateItem(advertisement);
        })
      );
  }

  delete(id: number | undefined) {
    if (!id) return;

    return this.http
      .delete<Advertisement>(this.baseUrl + `advertisement/${id}`)
      .pipe(
        tap(() => {
          this.advertisementCacheService.deleteItem(id);
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

  сancelPublication(id: number) {
    return this.http
      .put(this.baseUrl + `advertisement/cancelPublication/${id}`, null)
      .pipe(
        tap(() => {
          this.advertisementCacheService.updateItemsStatus(
            AdvertisementStatus.validated,
            id
          );
        })
      );
  }
}
