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

  //TEST
  private setSearchParamsTest(paginationParams: PaginationParams) {
    this.advertisementSearchParams.update((params) => ({
      ...params,
      cacheType: paginationParams.advertisementSearchType,
      paginationParams,
    }));
  }

  //TEST
  getCacheTest(
    paginationParams: PaginationParams | undefined
  ): PaginatedResult<Advertisement[]> | undefined {
    if (paginationParams) this.setSearchParamsTest(paginationParams);
    return this.advertisementCacheTest.get(this.getSearchParamsKey());
  }

  //TEST
  setCacheTest(advertisements: PaginatedResult<Advertisement[]>) {
    this.advertisementCacheTest.set(this.getSearchParamsKey(), advertisements);
  }

  //TODO Update Test
  addItem(advertisement: Advertisement) {
    const searchParamsKey = this.getSearchParamsKey();

    const cachedAdvertisements =
      this.advertisementCache.get(searchParamsKey) || [];
    this.advertisementCache.set(searchParamsKey, [
      ...cachedAdvertisements,
      advertisement,
    ]);
  }

  addItemTest(advertisement: Advertisement) {
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
      this.advertisementCacheTest.get(searchParamsKey);

    if (cachedAdvertisements?.items) {
      const updatedCache = cachedAdvertisements.items.map((item) =>
        item.id === advertisement?.id ? advertisement : item
      );
      this.advertisementCache.set(searchParamsKey, updatedCache);
    }
  }

  //TODO Update Test
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

  //TODO Update Test
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
