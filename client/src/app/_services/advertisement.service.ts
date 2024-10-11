import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Advertisement } from '../_models/advertisement';
import { environment } from '../../environments/environment';
import { AdvertisementSearchType } from '../_framework/constants/advertisementSearchType';
import { map, Observable, of, tap } from 'rxjs';
import { UpdateAdvertisementAdminRequest } from '../_models/updateAdvertisementAdminRequest';
import { UpdateAdvertisementStatusRequest } from '../_models/updateAdvertisementStatusRequest';
import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';
import { AdvertisementCacheService } from './advertisement.cache.service';
import { PaginationParams } from '../_models/paginationParams';
import { PaginatedResult } from '../_models/pagination';
import { setPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root',
})
export class AdvertisementService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private advertisementCacheService = inject(AdvertisementCacheService);

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

  // MY ADVERTISEMENTS

  getMyAdvertisements(forceRefresh: boolean = false) {
    if (!forceRefresh) {
      const cachedResponse = this.advertisementCacheService.getCache(
        AdvertisementSearchType.MyAdvertisements
      );
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
    const cachedAdvertisements = this.advertisementCacheService.getCache(
      AdvertisementSearchType.MyAdvertisements
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

  // ADMIN

  getPendingValidationAdvertisementsCount(): Observable<number> {
    return this.http.get<number>(
      this.baseUrl + 'advertisementAdmin/getPendingAdvertisementsCount'
    );
  }

  getPendingValidationAdvertisements(
    forceRefresh: boolean = false
  ): Observable<Advertisement[]> {
    if (!forceRefresh) {
      const cachedResponse = this.advertisementCacheService.getCache(
        AdvertisementSearchType.PendingValidation
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
          this.advertisementCacheService.setCache(response);
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

  // ALL_HISTORY

  getByIdHistory(id: number) {
    const cachedAdvertisements = this.advertisementCacheService.getCache(
      AdvertisementSearchType.AllHistory
    );
    if (cachedAdvertisements) {
      const result = cachedAdvertisements.find(
        (x: Advertisement) => x.id === id
      );
      if (result) {
        return of(result);
      }
    }
    return null;
  }

  getAllAdvertisementHistory(
    paginationParams: PaginationParams,
    forceRefresh: boolean = false
  ): Observable<PaginatedResult<Advertisement[]>> {
    if (!forceRefresh) {
      const cachedResponse = this.advertisementCacheService.getCacheTest(
        AdvertisementSearchType.AllHistory,
        paginationParams
      );

      if (cachedResponse) {
        console.log('Cache returned');
        return of(cachedResponse);
      }
    }

    const params = setPaginationHeaders(
      paginationParams.pageNumber,
      paginationParams.pageSize
    );

    return this.http
      .get<Advertisement[]>(this.baseUrl + 'advertisementHistory', {
        observe: 'response',
        params,
      })
      .pipe(
        map((response) => {
          const result = new PaginatedResult<Advertisement[]>();
          result.items = response.body as Advertisement[];
          result.pagination = JSON.parse(response.headers.get('Pagination')!);

          this.advertisementCacheService.setCacheTest(result);
          return result;
        })
      );
  }
}
