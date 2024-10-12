import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Advertisement } from '../_models/advertisement';
import { environment } from '../../environments/environment';
import { map, Observable, of, tap } from 'rxjs';
import { UpdateAdvertisementAdminRequest } from '../_models/updateAdvertisementAdminRequest';
import { UpdateAdvertisementStatusRequest } from '../_models/updateAdvertisementStatusRequest';
import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';
import { AdvertisementCacheService } from './advertisement.cache.service';
import { PaginationParams } from '../_models/paginationParams';
import { PaginatedResult } from '../_models/pagination';
import { setPaginationHeaders } from './paginationHelper';
import { SearchType } from '../_framework/constants/searchType';

@Injectable({
  providedIn: 'root',
})
export class AdvertisementService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private advertisementCacheService = inject(AdvertisementCacheService);
  private lastPaginationParams?: PaginationParams;

  getPaginationParams() {
    return this.advertisementCacheService.getPaginationParams();
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

  getById(id: number) {
    const cachedAdvertisements = this.advertisementCacheService.getCache(
      this.lastPaginationParams
    );

    if (cachedAdvertisements) {
      const result = cachedAdvertisements.items?.find(
        (x: Advertisement) => x.id === id
      );
      if (result) {
        return of(result);
      }
    }
    return null;
  }

  getPendingPublicationAdvertisements(
    paginationParams: PaginationParams
  ): Observable<PaginatedResult<Advertisement[]>> {
    this.lastPaginationParams = paginationParams;

    const cachedResponse =
      this.advertisementCacheService.getCache(paginationParams);
    if (cachedResponse) {
      console.log('Cache returned');
      return of(cachedResponse);
    }

    const params = setPaginationHeaders(
      paginationParams.pageNumber,
      paginationParams.pageSize
    );

    return this.http
      .get<Advertisement[]>(
        this.baseUrl + 'advertisement/getPendingPublicationAdvertisements',
        {
          observe: 'response',
          params,
        }
      )
      .pipe(
        map((response) => {
          const result = new PaginatedResult<Advertisement[]>();
          result.items = response.body as Advertisement[];
          result.pagination = JSON.parse(response.headers.get('Pagination')!);

          this.advertisementCacheService.setCache(result);
          return result;
        })
      );
  }

  // MY ADVERTISEMENTS
  getMyAdvertisements() {
    const paginationParams = {
      pageNumber: 0,
      pageSize: 10,
      searchType: SearchType.MyAdvertisements,
    } as PaginationParams;
    this.lastPaginationParams = paginationParams;

    const cachedResponse =
      this.advertisementCacheService.getCache(paginationParams);
    if (cachedResponse) {
      console.log('Cache returned');
      return of(cachedResponse);
    }

    const params = setPaginationHeaders(
      paginationParams.pageNumber,
      paginationParams.pageSize
    );

    return this.http
      .get<Advertisement[]>(this.baseUrl + 'advertisement', {
        observe: 'response',
        params,
      })
      .pipe(
        map((response) => {
          const result = new PaginatedResult<Advertisement[]>();
          result.items = response.body as Advertisement[];
          result.pagination = JSON.parse(response.headers.get('Pagination')!);

          this.advertisementCacheService.setCache(result);
          return result;
        })
      );
  }

  // ALL_HISTORY
  getAllAdvertisementHistory(
    paginationParams: PaginationParams
  ): Observable<PaginatedResult<Advertisement[]>> {
    this.lastPaginationParams = paginationParams;

    const cachedResponse =
      this.advertisementCacheService.getCache(paginationParams);
    if (cachedResponse) {
      console.log('Cache returned');
      return of(cachedResponse);
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

          this.advertisementCacheService.setCache(result);
          return result;
        })
      );
  }

  // PRIVATE_HISTORY
  getPrivateAdvertisementHistory(
    paginationParams: PaginationParams
  ): Observable<PaginatedResult<Advertisement[]>> {
    this.lastPaginationParams = paginationParams;

    const cachedResponse =
      this.advertisementCacheService.getCache(paginationParams);
    if (cachedResponse) {
      console.log('Cache returned');
      return of(cachedResponse);
    }

    const params = setPaginationHeaders(
      paginationParams.pageNumber,
      paginationParams.pageSize
    );

    return this.http
      .get<Advertisement[]>(
        this.baseUrl + 'advertisementHistory/getUserSpecific',
        {
          observe: 'response',
          params,
        }
      )
      .pipe(
        map((response) => {
          const result = new PaginatedResult<Advertisement[]>();
          result.items = response.body as Advertisement[];
          result.pagination = JSON.parse(response.headers.get('Pagination')!);

          this.advertisementCacheService.setCache(result);
          return result;
        })
      );
  }

  // ADMIN
  getPendingValidationAdvertisements(
    paginationParams: PaginationParams
  ): Observable<PaginatedResult<Advertisement[]>> {
    this.lastPaginationParams = paginationParams;

    const cachedResponse =
      this.advertisementCacheService.getCache(paginationParams);
    if (cachedResponse) {
      console.log('Cache returned');
      return of(cachedResponse);
    }

    const params = setPaginationHeaders(
      paginationParams.pageNumber,
      paginationParams.pageSize
    );

    return this.http
      .get<Advertisement[]>(
        this.baseUrl + 'advertisementAdmin/getPendingAdvertisements',
        {
          observe: 'response',
          params,
        }
      )
      .pipe(
        map((response) => {
          const result = new PaginatedResult<Advertisement[]>();
          result.items = response.body as Advertisement[];
          result.pagination = JSON.parse(response.headers.get('Pagination')!);

          this.advertisementCacheService.setCache(result);
          return result;
        })
      );
  }

  getPendingValidationAdvertisementsCount(): Observable<number> {
    return this.http
      .get<number>(
        this.baseUrl + 'advertisementAdmin/getPendingAdvertisementsCount'
      )
      .pipe(
        tap((result) => {
          this.advertisementCacheService.checkResetPendingAdverisementsCache(
            result
          );
        })
      );
  }

  //TODO обновлять cache
  updateAdvertisementAdmin(
    updateAdvertisementAdminRequest: UpdateAdvertisementAdminRequest
  ) {
    return this.http
      .post(
        this.baseUrl + 'advertisementAdmin',
        updateAdvertisementAdminRequest
      )
      .pipe(
        tap(() => {
          this.advertisementCacheService.resetCache(
            SearchType.PendingValidation
          );
        })
      );
  }
}
