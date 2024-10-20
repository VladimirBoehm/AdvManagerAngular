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
  private selectedAdvListType?: AdvListType;
  private paginationParams?: PaginationParams;

  resetPendingAdvertisementsCache(counter: number) {
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

  private getSearchParamsKey(advListType: AdvListType): string {
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

    let deepClone: PaginationParams = JSON.parse(
      JSON.stringify(this.paginationParams)
    );
    deepClone.pageSize = 0;
    const flattenedParams = flattenObject(deepClone);
    return Object.values(flattenedParams).join('-') + '-' + advListType;
  }

  private setPaginationParams(paginationParams: PaginationParams) {
    this.paginationParams = {
      ...this.paginationParams,
      ...paginationParams,
    };
  }

  //First step
  getCache(
    advListType: AdvListType,
    paginationParams?: PaginationParams
  ): PaginatedResult<Advertisement[]> | undefined {
    this.selectedAdvListType = advListType;
    if (paginationParams) this.setPaginationParams(paginationParams);
    console.log(
      'cache requested: ' + this.getSearchParamsKey(this.selectedAdvListType)
    );
    return this.advertisementCache.get(
      this.getSearchParamsKey(this.selectedAdvListType)
    );
  }
  
  //Second step
  setCache(advertisements: PaginatedResult<Advertisement[]>) {
    if (!this.selectedAdvListType) {
      console.error('selectedAdvListType is undefined');
      return;
    }
    const key = this.getSearchParamsKey(this.selectedAdvListType);
    console.log('Cache set: ' + key);
    this.advertisementCache.set(key, advertisements);
  }

  addItem(advertisement: Advertisement) {
    if (!this.selectedAdvListType) {
      console.error('advListType is undefined');
      return;
    }
    const searchParamsKey = this.getSearchParamsKey(this.selectedAdvListType);
    console.log('Cache: addItem: ' + searchParamsKey);

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
    if (!this.selectedAdvListType) {
      console.error('advListType is undefined');
      return;
    }
    const searchParamsKey = this.getSearchParamsKey(this.selectedAdvListType);
    const cachedAdvertisements = this.advertisementCache.get(searchParamsKey);
    console.log('Cache: updateItemsStatus: ' + searchParamsKey);

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
    if (!this.selectedAdvListType) {
      console.error('advListType is undefined');
      return;
    }
    const searchParamsKey = this.getSearchParamsKey(this.selectedAdvListType);
    console.log('Cache: deleteItem: ' + searchParamsKey);
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
