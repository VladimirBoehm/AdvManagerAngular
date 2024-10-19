import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
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
import { SortOption } from '../_models/sortOption';

@Injectable({
  providedIn: 'root',
})
export class AdvertisementService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private advertisementCacheService = inject(AdvertisementCacheService);
  advertisements = signal<PaginatedResult<Advertisement[]>>(
    new PaginatedResult<Advertisement[]>()
  );
  paginationParams: WritableSignal<PaginationParams>;

  constructor() {
    this.paginationParams = signal<PaginationParams>({
      pageNumber: 0,
      pageSize: 5,
      itemsCount: 0,
      sortOption: { field: 'date', order: 'desc' },
    } as PaginationParams);
  }
  updatePaginationParams(
    pageSize?: number,
    pageNumber?: number,
    itemsCount?: number,
    advListType?: AdvListType,
    sortOption?: SortOption
  ) {
    this.paginationParams.update((params) => ({
      ...params,
      pageSize: pageSize !== undefined ? pageSize : params.pageSize,
      pageNumber: pageNumber !== undefined ? pageNumber : params.pageNumber,
      itemsCount: itemsCount !== undefined ? itemsCount : params.itemsCount,
      advListType: advListType !== undefined ? advListType : params.advListType,
      sortOption: sortOption !== undefined ? sortOption : params.sortOption,
    }));
  }

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
      this.paginationParams()
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

  // PUBLICATION
  getPendingPublicationAdvertisements() {
    if (this.getCache(AdvListType.PendingPublication)) return;

    const params = setPaginationHeaders(this.paginationParams());

    return this.http
      .get<Advertisement[]>(
        this.baseUrl + 'advertisement/getPendingPublicationAdvertisements',
        {
          observe: 'response',
          params,
        }
      )
      .pipe(map((response) => this.handleAdvertisementResponse(response)))
      .subscribe({
        error: (err) => {
          console.error('Error when loading pending publication ads:', err);
        },
      });
  }

  getCache(advListType: AdvListType): boolean {
    this.updatePaginationParams(undefined, undefined, undefined, advListType);

    const cachedResponse = this.advertisementCacheService.getCache(
      this.paginationParams()
    );
    if (cachedResponse) {
      console.log('Cache returned:', JSON.stringify(this.paginationParams()));
      this.advertisements.set(cachedResponse);
      return true;
    }
    return false;
  }

  // MY ADVERTISEMENTS
  getMyAdvertisements() {
    if (this.getCache(AdvListType.MyAdvertisements)) return;

    const params = setPaginationHeaders(this.paginationParams());

    return this.http
      .get<Advertisement[]>(this.baseUrl + 'advertisement', {
        observe: 'response',
        params,
      })
      .pipe(map((response) => this.handleAdvertisementResponse(response)))
      .subscribe({
        error: (err) => {
          console.error('Error when loading ads:', err);
        },
      });
  }

  // ALL_HISTORY
  getAllAdvertisementHistory() {
    if (this.getCache(AdvListType.AllHistory)) return;

    const params = setPaginationHeaders(this.paginationParams());

    this.http
      .get<Advertisement[]>(this.baseUrl + 'advertisementHistory', {
        observe: 'response',
        params,
      })
      .pipe(map((response) => this.handleAdvertisementResponse(response)))
      .subscribe({
        error: (err) => {
          console.error('Error when loading advertisement history:', err);
        },
      });
  }

  // PRIVATE_HISTORY
  getPrivateAdvertisementHistory() {
    if (this.getCache(AdvListType.PrivateHistory)) return;

    const params = setPaginationHeaders(this.paginationParams());

    return this.http
      .get<Advertisement[]>(
        this.baseUrl + 'advertisementHistory/getUserSpecific',
        {
          observe: 'response',
          params,
        }
      )
      .pipe(map((response) => this.handleAdvertisementResponse(response)))
      .subscribe({
        error: (err) => {
          console.error(
            'Error when loading private advertisement history:',
            err
          );
        },
      });
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

  // VALIDATION
  getPendingValidationAdvertisements() {
    if (this.getCache(AdvListType.PendingValidation)) return;

    const params = setPaginationHeaders(this.paginationParams());

    this.http
      .get<Advertisement[]>(
        this.baseUrl + 'advertisementAdmin/getPendingAdvertisements',
        {
          observe: 'response',
          params,
        }
      )
      .pipe(map((response) => this.handleAdvertisementResponse(response)))
      .subscribe({
        error: (err) => {
          console.error('Error when loading pending validation ads:', err);
        },
      });
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

  private handleAdvertisementResponse(response: HttpResponse<Advertisement[]>) {
    const result = new PaginatedResult<Advertisement[]>();
    result.items = response.body as Advertisement[];
    result.pagination = JSON.parse(response.headers.get('Pagination')!);

    this.advertisementCacheService.setCache(result);
    console.log('Loaded from DB');
    this.advertisements.set(result);

    this.updatePaginationParams(
      result.pagination?.itemsPerPage,
      result.pagination?.currentPage,
      result.pagination?.totalItems
    );

    return result;
  }
}
