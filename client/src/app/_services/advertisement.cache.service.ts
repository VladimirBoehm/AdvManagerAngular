import { Injectable, signal } from '@angular/core';
import { Advertisement } from '../_models/advertisement';
import { AdvertisementSearchParams } from '../_framework/constants/advertisementSearchParams';
import { AdvertisementSearchType } from '../_framework/constants/advertisementSearchType';
import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';
import { PaginatedResult } from '../_models/pagination';
import { PaginationParams } from '../_models/paginationParams';

@Injectable({
  providedIn: 'root',
})
export class AdvertisementCacheService {
  private advertisementCache = new Map<any, Advertisement[]>();
  //TEST
  private advertisementCacheTest = new Map<
    any,
    PaginatedResult<Advertisement[]>
  >();

  advertisementSearchParams = signal<AdvertisementSearchParams>(
    new AdvertisementSearchParams()
  );

  private getSearchParamsKey(): string {
    const flattenObject = (obj: any): any => {
      const flattened: any = {};

      for (const key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
          Object.assign(flattened, flattenObject(obj[key]));
        } else {
          flattened[key] = obj[key];
        }
      }
      return flattened;
    };

    const flattenedParams = flattenObject(this.advertisementSearchParams());
    return Object.values(flattenedParams).join('-');
  }

  private setSearchParams(advertisementCacheType: AdvertisementSearchType) {
    this.advertisementSearchParams.update((params) => ({
      ...params,
      cacheType: advertisementCacheType,
    }));
  }

  //TEST
  private setSearchParamsTest(
    advertisementCacheType: AdvertisementSearchType,
    paginationParams: PaginationParams
  ) {
    this.advertisementSearchParams.update((params) => ({
      ...params,
      cacheType: advertisementCacheType,
      paginationParams,
    }));
  }

  getCache(
    advertisementCacheType: AdvertisementSearchType
  ): Advertisement[] | undefined {
    this.setSearchParams(advertisementCacheType);

    return this.advertisementCache.get(this.getSearchParamsKey());
  }
  //TEST
  getCacheTest(
    advertisementCacheType: AdvertisementSearchType,
    paginationParams: PaginationParams
  ): PaginatedResult<Advertisement[]> | undefined {
    this.setSearchParamsTest(advertisementCacheType, paginationParams);
    return this.advertisementCacheTest.get(this.getSearchParamsKey());
  }

  setCache(advertisements: Advertisement[]) {
    this.advertisementCache.set(this.getSearchParamsKey(), advertisements);
  }

  //TEST
  setCacheTest(advertisements: PaginatedResult<Advertisement[]>) {
    this.advertisementCacheTest.set(this.getSearchParamsKey(), advertisements);
  }

  addItem(advertisement: Advertisement) {
    const searchParamsKey = this.getSearchParamsKey();

    const cachedAdvertisements =
      this.advertisementCache.get(searchParamsKey) || [];
    this.advertisementCache.set(searchParamsKey, [
      ...cachedAdvertisements,
      advertisement,
    ]);
  }

  updateItem(advertisement: Advertisement) {
    const searchParamsKey = this.getSearchParamsKey();
    const cachedAdvertisements =
      this.advertisementCache.get(searchParamsKey) || [];
    const updatedCache = cachedAdvertisements.map((item) =>
      item.id === advertisement?.id ? advertisement : item
    );
    this.advertisementCache.set(searchParamsKey, updatedCache);
  }

  updateItemsStatus(
    advertisementStatus: AdvertisementStatus,
    advertisementId: number
  ) {
    const searchParamsKey = this.getSearchParamsKey();
    const cachedAdvertisements =
      this.advertisementCache.get(searchParamsKey) || [];

    const updatedCache = cachedAdvertisements.map((item) => {
      if (item.id === advertisementId) {
        return {
          ...item,
          statusId: advertisementStatus,
        } as Advertisement;
      }
      return item;
    });
    this.advertisementCache.set(searchParamsKey, updatedCache);
  }

  deleteItem(advertisementId: number) {
    const searchParamsKey = this.getSearchParamsKey();
    const cachedAdvertisements = this.advertisementCache.get(searchParamsKey);
    if (cachedAdvertisements)
      this.advertisementCache.set(
        searchParamsKey,
        cachedAdvertisements.filter((x) => x.id !== advertisementId)
      );
  }
}
