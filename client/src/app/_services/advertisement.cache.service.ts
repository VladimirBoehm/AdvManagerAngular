import { Injectable } from '@angular/core';
import { Advertisement } from '../_models/advertisement';

import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';
import { PaginatedResult } from '../_models/pagination';
import { PaginationParams } from '../_models/paginationParams';
import { AdvListType } from '../_framework/constants/advListType';

@Injectable({
  providedIn: 'root',
})
export class AdvertisementCacheService {
  private advertisementCache = new Map<any, PaginatedResult<Advertisement[]>>();
  private pendingAdvertisementsCache: number = 0;
  private paginationParams?: PaginationParams;

  checkResetPendingAdvertisementsCache(counter: number) {
    if (this.pendingAdvertisementsCache !== counter) {
      this.pendingAdvertisementsCache = counter;
      this.resetCache(AdvListType.PendingValidation);
    }
  }

  updateItemInAllCaches(advertisement: Advertisement) {
    this.advertisementCache.forEach((cachedAdvertisements, key) => {
      if (cachedAdvertisements?.items) {
        const updatedItems = cachedAdvertisements.items.map((item) =>
          item.id === advertisement.id ? advertisement : item
        );
        cachedAdvertisements.items = updatedItems;
        this.advertisementCache.set(key, cachedAdvertisements);
      }
    });

    console.log(
      'advertisement was updated in all caches. Id: ' + advertisement.id
    );
  }

  deleteItemFromCachesByAdvListType(
    advertisementId: number,
    advListType: AdvListType
  ) {
    this.advertisementCache.forEach((cachedAdvertisements, key) => {
      if (key.includes(advListType)) {
        if (cachedAdvertisements?.items) {
          const updatedItems = cachedAdvertisements.items.filter(
            (item) => item.id !== advertisementId
          );
          if (updatedItems.length > 0) {
            cachedAdvertisements.items = updatedItems;
            this.advertisementCache.set(key, cachedAdvertisements);
          } else {
            this.advertisementCache.delete(key);
          }
        }
      }
    });
    console.log(
      `Advertisement with id ${advertisementId} deleted from caches with keys containing '${advListType}'.`
    );
  }

  resetCache(advListType: AdvListType): void {
    const keysToReset: string[] = [];

    this.advertisementCache.forEach((value, key) => {
      if (key.includes(advListType)) {
        keysToReset.push(key);
      }
    });

    keysToReset.forEach((key) => {
      this.advertisementCache.delete(key);
    });

    console.log(`Cache reset for keys containing: '${advListType}'`);
  }

  getPaginationParams() {
    return this.paginationParams;
  }

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

    const flattenedParams = flattenObject(this.paginationParams);
    return Object.values(flattenedParams).join('-');
  }

  private setSearchParams(paginationParams: PaginationParams) {
    this.paginationParams = {
      ...this.paginationParams,
      ...paginationParams,
    };
  }

  getCache(
    paginationParams?: PaginationParams
  ): PaginatedResult<Advertisement[]> | undefined {
    if (paginationParams) this.setSearchParams(paginationParams);
    console.log('cache requested: ' + this.getSearchParamsKey());
    return this.advertisementCache.get(this.getSearchParamsKey());
  }

  setCache(advertisements: PaginatedResult<Advertisement[]>) {
    const key = this.getSearchParamsKey();
    console.log('Cache set: ' + key);
    this.advertisementCache.set(key, advertisements);
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
