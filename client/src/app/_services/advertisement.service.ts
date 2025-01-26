import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Advertisement } from '../_models/advertisement';
import { environment } from '../../environments/environment';
import { Observable, of, tap } from 'rxjs';
import { UpdateAdvertisementAdminRequest } from '../_models/updateAdvertisementAdminRequest';
import { UpdateAdvertisementStatusRequest } from '../_models/updateAdvertisementStatusRequest';
import { PaginationParams } from '../_entities/paginationParams';
import { getPaginationHeaders } from './paginationHelper';
import { AppListType } from '../_framework/constants/advListType';
import { ManagePublish } from '../_entities/managePublish';
import { SortOption } from '../_entities/sortOption';
import { DEFAULT_SORT_OPTION } from '../_framework/constants/defaultSortOption';
@Injectable({
  providedIn: 'root',
})
export class AdvertisementService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private selectedAdvListType?: AppListType;

  paginationParamsState: WritableSignal<Map<AppListType, PaginationParams>>;

  constructor() {
    const paginationState = this.initializePaginationState();
    this.paginationParamsState = signal(paginationState);
  }

  private initializePaginationState() {
    const defaultPaginationParams: PaginationParams = {
      pageNumber: 0,
      totalItems: 0,
      pageSize: 6,
      sortOption: {
        field: DEFAULT_SORT_OPTION.field,
        order: DEFAULT_SORT_OPTION.order,
        searchType: DEFAULT_SORT_OPTION.searchType,
        searchValue: DEFAULT_SORT_OPTION.searchValue,
      },
    };

    const paginationState = new Map<AppListType, PaginationParams>();

    Object.values(AppListType).forEach((advListType) => {
      if (advListType === AppListType.PendingPublication) {
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
      // console.error('selectedAdvListType is undefined');
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
    advListType?: AppListType,
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

  getActualSearchType(): AppListType | undefined {
    return this.selectedAdvListType;
  }

  async save(advertisement: Advertisement): Promise<Observable<Advertisement>> {
    const formData = new FormData();
    formData.append('advertisementJson', JSON.stringify(advertisement));
    if (advertisement.adImage && advertisement.adImage.file) {
      try {
        formData.append('file', advertisement.adImage.file);
      } catch (error) {
        console.error('Error fetching or reconstructing file:', error);
      }
    }

    return this.http.post<Advertisement>(
      this.baseUrl + 'advertisement/save',
      formData
    );
  }

  async update(advertisement: Advertisement) {
    const formData = new FormData();
    formData.append('advertisementJson', JSON.stringify(advertisement));

    if (
      advertisement.adImage &&
      advertisement.adImage.id === 0 &&
      advertisement.adImage.file
    ) {
      if (advertisement.adImage && advertisement.adImage.file)
        try {
          formData.append('file', advertisement.adImage.file);
        } catch (error) {
          console.error('Error fetching or reconstructing file:', error);
        }
    }
    return this.http.put<Advertisement>(
      this.baseUrl + 'advertisement',
      formData
    );
  }

  sendToValidation(id: number) {
    return this.http.post<UpdateAdvertisementStatusRequest>(
      this.baseUrl + 'advertisement/sendToValidation',
      { id }
    );
  }

  delete(id: number) {
    return this.http.delete<Advertisement>(
      this.baseUrl + `advertisement/${id}`
    );
  }

  cancelPublication(id: number) {
    return this.http.put(
      this.baseUrl + `advertisement/cancelPublication/${id}`,
      null
    );
  }

  getById(id: number) {
    if (!this.selectedAdvListType) {
      console.error('getById: selectedAdvListType is undefined');
      return null;
    }
    // const cachedAdvertisements = this.advertisementCacheService.getCache(
    //   this.selectedAdvListType,
    //   this.paginationParamsState().get(this.selectedAdvListType)
    // );

    if (true) {
      const result = 2;
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
  getPendingPublicationAdvertisements(paginationParams: PaginationParams) {
    const params = getPaginationHeaders(paginationParams);
    return this.http.get<Advertisement[]>(
      this.baseUrl + 'advertisement/getPendingPublicationAdvertisements',
      {
        observe: 'response',
        params,
      }
    );
  }

  // MY ADVERTISEMENTS
  getMyAdvertisements(paginationParams: PaginationParams) {
    const params = getPaginationHeaders(paginationParams);
    return this.http.get<Advertisement[]>(this.baseUrl + 'advertisement', {
      observe: 'response',
      params,
    });
  }

  // ALL_HISTORY
  getAdvertisementAllHistory(paginationParams: PaginationParams) {
    const params = getPaginationHeaders(paginationParams);
    return this.http.get<Advertisement[]>(
      this.baseUrl + 'advertisementHistory',
      {
        observe: 'response',
        params,
      }
    );
  }

  // PRIVATE_HISTORY
  getAdvertisementPrivateHistory(paginationParams: PaginationParams) {
    const params = getPaginationHeaders(paginationParams);
    return this.http.get<Advertisement[]>(
      this.baseUrl + 'advertisementHistory/getAdvertisementPrivateHistory',
      {
        observe: 'response',
        params,
      }
    );
  }

  // ADMIN
  cancelPublicationAdmin(managePublish: ManagePublish) {
    return this.http.put(
      this.baseUrl + 'advertisementAdmin/cancelPublication',
      managePublish
    );
  }

  forcePublicationAdmin(managePublish: ManagePublish) {
    return this.http.put(
      this.baseUrl + 'advertisementAdmin/forcePublication',
      managePublish
    );
  }

  // VALIDATION
  getPendingValidationAdvertisements(paginationParams: PaginationParams) {
    const params = getPaginationHeaders(paginationParams);
    return this.http.get<Advertisement[]>(
      this.baseUrl + 'advertisementAdmin/getPendingAdvertisements',
      {
        observe: 'response',
        params,
      }
    );
  }

  getPendingValidationAdvertisementsCount(): Observable<number> {
    return this.http.get<number>(
      this.baseUrl + 'advertisementAdmin/getPendingAdvertisementsCount'
    );
  }

  validateAdvertisementAdmin(advertisement: Advertisement) {
    const updateAdvertisementAdminRequest: UpdateAdvertisementAdminRequest = {
      advertisementId: advertisement.id,
      advertisementStatus: advertisement.statusId,
      publishFrequency: advertisement.publishFrequency,
      adminMessage: advertisement.adminMessage,
    };

    return this.http.post(
      this.baseUrl + 'advertisementAdmin',
      updateAdvertisementAdminRequest
    );
  }
}
