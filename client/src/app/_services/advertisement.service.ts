import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Advertisement } from '../_models/advertisement';
import { environment } from '../../environments/environment';
import { map, Observable, of, tap } from 'rxjs';
import { UpdateAdvertisementAdminRequest } from '../_models/updateAdvertisementAdminRequest';
import { UpdateAdvertisementStatusRequest } from '../_models/updateAdvertisementStatusRequest';
import { AdvertisementCacheService } from './advertisement.cache.service';
import { PaginationParams } from '../_models/paginationParams';
import { PaginatedResult } from '../_models/pagination';
import { setPaginationHeaders } from './paginationHelper';
import { AdvListType } from '../_framework/constants/advListType';
import { ManagePublish } from '../_models/managePublish';

@Injectable({
  providedIn: 'root',
})
export class AdvertisementService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private advertisementCacheService = inject(AdvertisementCacheService);
  private lastPaginationParams?: PaginationParams;

  getActualSearchType(): AdvListType | undefined {
    return this.advertisementCacheService.getPaginationParams()?.advListType;
  }

  save(advertisement: Advertisement): Observable<Advertisement> {
    return this.http
      .post<Advertisement>(this.baseUrl + 'advertisement/save', advertisement)
      .pipe(
        tap((savedAdvertisement: Advertisement) => {
          advertisement.updated = this.getUTCTime();
          this.advertisementCacheService.addItem(savedAdvertisement);
        })
      );
  }

  getUTCTime(): Date {
    let date = new Date();
    date.setDate(date.getUTCDate());
    date.setHours(date.getUTCHours());
    return date;
  }

  update(advertisement: Advertisement) {
    return this.http
      .put<Advertisement>(this.baseUrl + 'advertisement', advertisement)
      .pipe(
        tap(() => {
          advertisement.updated = this.getUTCTime();
          this.advertisementCacheService.updateItemInAllCaches(advertisement);
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
          advertisement.updated = this.getUTCTime();
          this.advertisementCacheService.updateItemInAllCaches(advertisement);
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

  cancelPublication(advertisement: Advertisement) {
    return this.http
      .put(
        this.baseUrl + `advertisement/cancelPublication/${advertisement.id}`,
        null
      )
      .pipe(
        tap(() => {
          advertisement.updated = this.getUTCTime();
          this.advertisementCacheService.updateItemInAllCaches(advertisement);
          this.advertisementCacheService.deleteItemFromCachesByAdvListType(
            advertisement.id,
            AdvListType.PendingPublication
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
        console.log('Loaded from cache');
        return of(result);
      }
    } else {
      console.log('Loaded from DB: id-' + id);
      return this.http.get<Advertisement>(this.baseUrl + `advertisement/${id}`);
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
      console.log('Cache returned:', JSON.stringify(paginationParams));
      return of(cachedResponse);
    }

    const params = setPaginationHeaders(paginationParams);

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

          console.log('Loaded from DB');
          return result;
        })
      );
  }

  // MY ADVERTISEMENTS
  getMyAdvertisements(paginationParams: PaginationParams) {
    this.lastPaginationParams = paginationParams;

    const cachedResponse =
      this.advertisementCacheService.getCache(paginationParams);
    if (cachedResponse) {
      console.log('Cache returned:', JSON.stringify(paginationParams));
      return of(cachedResponse);
    }

    const params = setPaginationHeaders(paginationParams);

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
          console.log('Loaded from DB');
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
      return of(cachedResponse);
    }

    const params = setPaginationHeaders(paginationParams);

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
          console.log('Loaded from DB');
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
      console.log('Cache returned:', JSON.stringify(paginationParams));
      return of(cachedResponse);
    }

    const params = setPaginationHeaders(paginationParams);

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
          console.log('Loaded from DB');
          return result;
        })
      );
  }

  // ADMIN
  cancelPublicationAdmin(
    managePublish: ManagePublish,
    advertisement: Advertisement
  ) {
    return this.http
      .put(this.baseUrl + 'advertisementAdmin/cancelPublication', managePublish)
      .pipe(
        tap(() => {
          advertisement.updated = this.getUTCTime();
          this.advertisementCacheService.updateItemInAllCaches(advertisement);
          this.advertisementCacheService.deleteItemFromCachesByAdvListType(
            advertisement.id,
            AdvListType.PendingPublication
          );
        })
      );
  }

  forcePublicationAdmin(
    managePublish: ManagePublish,
    advertisement: Advertisement
  ) {
    return this.http
      .put(this.baseUrl + 'advertisementAdmin/forcePublication', managePublish)
      .pipe(
        tap(() => {
          advertisement.updated = this.getUTCTime();
          this.advertisementCacheService.updateItemInAllCaches(advertisement);
          this.advertisementCacheService.deleteItemFromCachesByAdvListType(
            advertisement.id,
            AdvListType.PendingPublication
          );
        })
      );
  }

  getPendingValidationAdvertisements(
    paginationParams: PaginationParams
  ): Observable<PaginatedResult<Advertisement[]>> {
    this.lastPaginationParams = paginationParams;

    const cachedResponse =
      this.advertisementCacheService.getCache(paginationParams);
    if (cachedResponse) {
      console.log('Cache returned:', JSON.stringify(paginationParams));
      return of(cachedResponse);
    }

    const params = setPaginationHeaders(paginationParams);

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
          console.log('Loaded from DB');
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
          this.advertisementCacheService.checkResetPendingAdvertisementsCache(
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
            AdvListType.PendingValidation
          );
          this.advertisementCacheService.resetCache(
            AdvListType.MyAdvertisements
          );
        })
      );
  }
}
