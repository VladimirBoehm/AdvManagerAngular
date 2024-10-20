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

  private selectedAdvListType?: AdvListType;
  advertisements = signal<PaginatedResult<Advertisement[]>>(
    new PaginatedResult<Advertisement[]>()
  );
  paginationParamsState: WritableSignal<Map<AdvListType, PaginationParams>>;

  constructor() {
    const defaultPaginationParams: PaginationParams = {
      pageNumber: 0,
      pageSize: 5,
      itemsCount: 0,
      sortOption: { field: 'date', order: 'desc', searchType: 'title' },
    };

    const paginationState = new Map<AdvListType, PaginationParams>();

    Object.values(AdvListType).forEach((advListType) => {
      paginationState.set(advListType, { ...defaultPaginationParams });
    });

    this.paginationParamsState = signal(paginationState);
  }

  getCurrentSortOptions() {
    if (!this.selectedAdvListType) {
      console.error('selectedAdvListType is undefined');
      return;
    }
    return this.paginationParamsState().get(this.selectedAdvListType)
      ?.sortOption;
  }

  resetPaginationParams(advListType: AdvListType) {
    this.updatePaginationParams(
      advListType,
      undefined, // Keep pageSize unchanged
      0, // Reset pageNumber to 0
      undefined, // Keep itemsCount unchanged
      {
        field: 'date', // Sort by date
        order: 'desc', // In descending order
        searchType: 'title', // Search by title
        searchValue: undefined, // No specific search value
      } as SortOption
    );
  }

  updatePaginationParams(
    advListType?: AdvListType,
    pageSize?: number,
    pageNumber?: number,
    itemsCount?: number,
    sortOption?: SortOption
  ) {
    if (!advListType) return;
    const currentParams = this.paginationParamsState().get(advListType);
    if (currentParams) {
      const updatedParams: PaginationParams = {
        ...currentParams,
        pageSize: pageSize !== undefined ? pageSize : currentParams.pageSize,
        pageNumber:
          pageNumber !== undefined ? pageNumber : currentParams.pageNumber,
        itemsCount:
          itemsCount !== undefined ? itemsCount : currentParams.itemsCount,
        sortOption:
          sortOption !== undefined ? sortOption : currentParams.sortOption,
      };

      this.paginationParamsState.update((state) => {
        state.set(advListType, updatedParams);
        return state;
      });
    }
  }

  getActualSearchType(): AdvListType | undefined {
    return this.selectedAdvListType;
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
    if (!this.selectedAdvListType) {
      console.error('getById: selectedAdvListType is undefined');
      return null;
    }
    const cachedAdvertisements = this.advertisementCacheService.getCache(
      this.selectedAdvListType,
      this.paginationParamsState().get(this.selectedAdvListType)
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

    const params = setPaginationHeaders(
      this.paginationParamsState().get(AdvListType.PendingPublication)
    );

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
    this.selectedAdvListType = advListType;
    const cachedResponse = this.advertisementCacheService.getCache(
      advListType,
      this.paginationParamsState().get(advListType)
    );
    if (cachedResponse) {
      console.log(
        'Cache returned:',
        JSON.stringify(this.paginationParamsState().get(advListType))
      );
      this.advertisements.set(cachedResponse);
      return true;
    }
    return false;
  }

  // MY ADVERTISEMENTS
  getMyAdvertisements() {
    if (this.getCache(AdvListType.MyAdvertisements)) return;

    const params = setPaginationHeaders(
      this.paginationParamsState().get(AdvListType.MyAdvertisements)
    );

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

    const params = setPaginationHeaders(
      this.paginationParamsState().get(AdvListType.AllHistory)
    );

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

    const params = setPaginationHeaders(
      this.paginationParamsState().get(AdvListType.PrivateHistory)
    );

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

    const params = setPaginationHeaders(
      this.paginationParamsState().get(AdvListType.PendingValidation)
    );

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
          this.advertisementCacheService.resetPendingAdvertisementsCache(
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
    if (!this.selectedAdvListType) {
      console.error('advListType is undefined');
      return result;
    }

    result.items = response.body as Advertisement[];
    result.pagination = JSON.parse(response.headers.get('Pagination')!);

    this.advertisementCacheService.setCache(this.selectedAdvListType, result);
    console.log('Loaded from DB');
    this.advertisements.set(result);

    this.updatePaginationParams(
      this.selectedAdvListType,
      result.pagination?.itemsPerPage,
      result.pagination?.currentPage,
      result.pagination?.totalItems
    );

    return result;
  }
}
