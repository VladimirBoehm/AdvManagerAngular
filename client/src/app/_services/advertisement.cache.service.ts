import { Injectable, signal } from '@angular/core';
import { Advertisement } from '../_models/advertisement';
import { AdvertisementSearchParams } from '../_framework/constants/advertisementSearchParams';
import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';
import { PaginatedResult } from '../_models/pagination';
import { PaginationParams } from '../_models/paginationParams';

@Injectable({
  providedIn: 'root',
})
export class AdvertisementCacheService {
  private advertisementCache = new Map<any, PaginatedResult<Advertisement[]>>();

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

  private setSearchParams(paginationParams: PaginationParams) {
    this.advertisementSearchParams.update((params) => ({
      ...params,
      paginationParams,
    }));
  }

  getCache(
    paginationParams: PaginationParams | undefined
  ): PaginatedResult<Advertisement[]> | undefined {
    if (paginationParams) this.setSearchParams(paginationParams);
    console.log('getCache: ' + this.getSearchParamsKey());
    return this.advertisementCache.get(this.getSearchParamsKey());
  }

  setCache(advertisements: PaginatedResult<Advertisement[]>) {
    this.advertisementCache.set(this.getSearchParamsKey(), advertisements);
  }

  addItem(advertisement: Advertisement) {
    const searchParamsKey = this.getSearchParamsKey();
    console.log('addItem: ' + searchParamsKey);

    const cachedAdvertisements = this.advertisementCache.get(searchParamsKey);
    if (cachedAdvertisements) {
      const updatedItems = cachedAdvertisements.items
        ? [...cachedAdvertisements.items, advertisement]
        : [advertisement];

      cachedAdvertisements.items = updatedItems;

      this.advertisementCache.set(searchParamsKey, cachedAdvertisements);
    } else {
      this.advertisementCache.set(searchParamsKey, {
        items: [advertisement],
        pagination: undefined,
      });
    }
  }

  updateItem(advertisement: Advertisement) {
    const searchParamsKey = this.getSearchParamsKey();
    console.log('updateItem: ' + searchParamsKey);
    const cachedAdvertisements = this.advertisementCache.get(searchParamsKey);

    if (cachedAdvertisements?.items) {
      const updatedItems = cachedAdvertisements.items.map((item) =>
        item.id === advertisement.id ? advertisement : item
      );
      cachedAdvertisements.items = updatedItems;
      this.advertisementCache.set(searchParamsKey, cachedAdvertisements);
    }
  }

  updateItemsStatus(
    advertisementStatus: AdvertisementStatus,
    advertisementId: number
  ) {
    const searchParamsKey = this.getSearchParamsKey();
    const cachedAdvertisements = this.advertisementCache.get(searchParamsKey);
    console.log('updateItemsStatus: ' + searchParamsKey);

    if (cachedAdvertisements?.items) {
      const updatedItems = cachedAdvertisements.items.map((item) => {
        if (item.id === advertisementId) {
          return {
            ...item,
            statusId: advertisementStatus,
          } as Advertisement;
        }
        return item;
      });
      cachedAdvertisements.items = updatedItems;
      this.advertisementCache.set(searchParamsKey, cachedAdvertisements);
    }
  }

  deleteItem(advertisementId: number) {
    const searchParamsKey = this.getSearchParamsKey();
    console.log('deleteItem: ' + searchParamsKey);
    const cachedAdvertisements = this.advertisementCache.get(searchParamsKey);
    if (cachedAdvertisements?.items) {
      const updatedItems = cachedAdvertisements.items.filter(
        (x) => x.id !== advertisementId
      );
      cachedAdvertisements.items = updatedItems;
      this.advertisementCache.set(searchParamsKey, cachedAdvertisements);
    }
  }
}
