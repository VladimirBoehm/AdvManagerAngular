import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Advertisement } from '../_models/advertisement';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { UpdateAdvertisementAdminRequest } from '../_models/updateAdvertisementAdminRequest';
import { UpdateAdvertisementStatusRequest } from '../_models/updateAdvertisementStatusRequest';
import { AdvertisementCacheService } from './caches/advertisement.cache.service';
import { PaginationParams } from '../_models/paginationParams';
import { PaginatedResult } from '../_models/pagination';
import { setPaginationHeaders } from './paginationHelper';
import { AdvListType } from '../_framework/constants/advListType';
import { ManagePublish } from '../_models/managePublish';
import { SortOption } from '../_models/sortOption';
import { DateHelper } from '../_framework/component/helpers/dateHelper';
import { DEFAULT_SORT_OPTION } from '../_framework/constants/defaultSortOption';
@Injectable({
  providedIn: 'root',
})
export class AdvertisementService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private advertisementCacheService = inject(AdvertisementCacheService);
  private dateHelper = DateHelper;
  private selectedAdvListType?: AdvListType;

  private advertisementsSubject = new BehaviorSubject<
    PaginatedResult<Advertisement>
  >(new PaginatedResult<Advertisement>());
  readonly advertisements$ = this.advertisementsSubject.asObservable();

  paginationParamsState: WritableSignal<Map<AdvListType, PaginationParams>>;

  constructor() {
    const paginationState = this.initializePaginationState();
    this.paginationParamsState = signal(paginationState);
  }

  private initializePaginationState() {
    const defaultPaginationParams: PaginationParams = {
      pageNumber: 0,
      pageSize: 6,
      sortOption: {
        field: DEFAULT_SORT_OPTION.field,
        order: DEFAULT_SORT_OPTION.order,
        searchType: DEFAULT_SORT_OPTION.searchType,
        searchValue: DEFAULT_SORT_OPTION.searchValue,
      },
    };

    const paginationState = new Map<AdvListType, PaginationParams>();

    Object.values(AdvListType).forEach((advListType) => {
      if (advListType === AdvListType.PendingPublication) {
        paginationState.set(advListType, {
          ...defaultPaginationParams,
          sortOption: {
            ...defaultPaginationParams.sortOption,
            field: 'date',
            order: 'asc',
          },
        });
      } else {
        paginationState.set(advListType, { ...defaultPaginationParams });
      }
    });
    return paginationState;
  }

  getCurrentSortOptions() {
    if (!this.selectedAdvListType) {
      console.error('selectedAdvListType is undefined');
      return;
    }
    return this.paginationParamsState().get(this.selectedAdvListType)
      ?.sortOption;
  }

  resetPaginationParams() {
    const paginationState = this.initializePaginationState();
    this.paginationParamsState.set(paginationState);
  }

  updatePaginationParams(
    advListType?: AdvListType,
    pageSize?: number,
    pageNumber?: number,
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
          savedAdvertisement.updated = this.dateHelper.getUTCTime();
          savedAdvertisement.created = this.dateHelper.getUTCTime();
          this.advertisementCacheService.add(savedAdvertisement);
        })
      );
  }

  update(advertisement: Advertisement) {
    return this.http
      .put<Advertisement>(this.baseUrl + 'advertisement', advertisement)
      .pipe(
        tap(() => {
          advertisement.updated = this.dateHelper.getUTCTime();
          this.advertisementCacheService.updateInAllCaches(advertisement);
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
          advertisement.updated = this.dateHelper.getUTCTime();
          this.advertisementCacheService.updateInAllCaches(advertisement);
        })
      );
  }

  delete(id: number | undefined) {
    if (!id) return;
    return this.http
      .delete<Advertisement>(this.baseUrl + `advertisement/${id}`)
      .pipe(
        tap(() => {
          this.advertisementCacheService.delete(id);
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
          advertisement.updated = this.dateHelper.getUTCTime();
          this.advertisementCacheService.updateInAllCaches(advertisement);
          this.advertisementCacheService.deleteByAdvListType(
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
    const cachedResult = this.getCache(AdvListType.PendingPublication);
    if (cachedResult) {
      this.advertisementsSubject.next(cachedResult);
      return of(cachedResult);
    }

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
      .pipe(tap((response) => this.handleAdvertisementResponse(response)))
      .subscribe({
        error: (err) => {
          console.error('Error when loading pending publication ads:', err);
        },
      });
  }

  getCache(advListType: AdvListType): PaginatedResult<Advertisement> | null {
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
      return cachedResponse;
    }
    return null;
  }

  // MY ADVERTISEMENTS
  getMyAdvertisements() {
    const cachedResult = this.getCache(AdvListType.MyAdvertisements);
    if (cachedResult) {
      this.advertisementsSubject.next(cachedResult);
      return;
    }

    const params = setPaginationHeaders(
      this.paginationParamsState().get(AdvListType.MyAdvertisements)
    );

    return this.http
      .get<Advertisement[]>(this.baseUrl + 'advertisement', {
        observe: 'response',
        params,
      })
      .pipe(tap((response) => this.handleAdvertisementResponse(response)))
      .subscribe({
        error: (err) => {
          console.error('Error when loading ads:', err);
        },
      });
  }

  // ALL_HISTORY
  getAllAdvertisementHistory() {
    const cachedResult = this.getCache(AdvListType.AllHistory);
    if (cachedResult) {
      this.advertisementsSubject.next(cachedResult);
      return;
    }

    const params = setPaginationHeaders(
      this.paginationParamsState().get(AdvListType.AllHistory)
    );

    this.http
      .get<Advertisement[]>(this.baseUrl + 'advertisementHistory', {
        observe: 'response',
        params,
      })
      .pipe(tap((response) => this.handleAdvertisementResponse(response)))
      .subscribe({
        error: (err) => {
          console.error('Error when loading advertisement history:', err);
        },
      });
  }

  // PRIVATE_HISTORY
  getPrivateAdvertisementHistory() {
    const cachedResult = this.getCache(AdvListType.PrivateHistory);
    if (cachedResult) {
      this.advertisementsSubject.next(cachedResult);
      return;
    }
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
      .pipe(tap((response) => this.handleAdvertisementResponse(response)))
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
          advertisement.updated = this.dateHelper.getUTCTime();
          this.advertisementCacheService.updateInAllCaches(advertisement);
          this.advertisementCacheService.deleteByAdvListType(
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
          advertisement.updated = this.dateHelper.getUTCTime();
          this.advertisementCacheService.updateInAllCaches(advertisement);
          this.advertisementCacheService.deleteByAdvListType(
            advertisement.id,
            AdvListType.PendingPublication
          );
        })
      );
  }

  // VALIDATION
  getPendingValidationAdvertisements() {
    const cachedResult = this.getCache(AdvListType.PendingValidation);
    if (cachedResult) {
      this.advertisementsSubject.next(cachedResult);
      return;
    }

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
      .pipe(tap((response) => this.handleAdvertisementResponse(response)))
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

  validateAdvertisementAdmin(
    updateAdvertisementAdminRequest: UpdateAdvertisementAdminRequest
  ) {
    this.advertisementCacheService.deleteByAdvListType(
      updateAdvertisementAdminRequest.advertisementId,
      AdvListType.PendingValidation
    );
    this.advertisementCacheService.updateStatus(
      updateAdvertisementAdminRequest.advertisementStatus,
      updateAdvertisementAdminRequest.advertisementId
    );

    return this.http.post(
      this.baseUrl + 'advertisementAdmin',
      updateAdvertisementAdminRequest
    );
  }

  private handleAdvertisementResponse(response: HttpResponse<Advertisement[]>) {
    const result = new PaginatedResult<Advertisement>();
    if (!this.selectedAdvListType) {
      console.error('advListType is undefined');
      return result;
    }

    result.items = response.body as Advertisement[];
    result.pagination = JSON.parse(response.headers.get('Pagination')!);

    this.advertisementCacheService.setCache(result);
    console.log('Loaded from DB');
    this.advertisementsSubject.next(result);

    this.updatePaginationParams(
      this.selectedAdvListType,
      result.pagination?.itemsPerPage,
      result.pagination?.currentPage
    );

    return result;
  }
}
