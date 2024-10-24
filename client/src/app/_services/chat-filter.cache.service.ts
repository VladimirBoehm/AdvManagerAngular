import { Injectable } from '@angular/core';
import { ChatFilter } from '../_models/chatFilter';
import { PaginatedResult } from '../_models/pagination';
import { PaginationParams } from '../_models/paginationParams';

@Injectable({
  providedIn: 'root',
})
export class ChatFilterCacheService {
  private chatFilterCache = new Map<any, PaginatedResult<ChatFilter>>();
  private paginationParams?: PaginationParams;

  private setPaginationParams(paginationParams: PaginationParams) {
    this.paginationParams = {
      ...this.paginationParams,
      ...paginationParams,
    };
  }
  //First step
  getCache(
    paginationParams?: PaginationParams
  ): PaginatedResult<ChatFilter> | undefined {
    if (paginationParams) this.setPaginationParams(paginationParams);
    console.log('cache requested: ' + this.getSearchParamsKey());
    return this.chatFilterCache.get(this.getSearchParamsKey());
  }

  //Second step
  setCache(chatFilters: PaginatedResult<ChatFilter>) {
    const key = this.getSearchParamsKey();
    console.log('Cache set: ' + key);
    this.chatFilterCache.set(key, chatFilters);
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

    let deepClone: PaginationParams = JSON.parse(
      JSON.stringify(this.paginationParams)
    );
    deepClone.pageSize = 0;
    const flattenedParams = flattenObject(deepClone);
    return Object.values(flattenedParams).join('-');
  }

  addItem(chatFilter: ChatFilter) {
    const searchParamsKey = this.getSearchParamsKey();
    console.log('Cache: addItem: ' + searchParamsKey);

    const cachedAdvertisements = this.chatFilterCache.get(searchParamsKey);
    if (cachedAdvertisements) {
      const updatedCachedAdvertisements =
        cachedAdvertisements.addItem(chatFilter);

      this.chatFilterCache.set(searchParamsKey, updatedCachedAdvertisements);
    } else {
      const newPaginatedResult = new PaginatedResult([chatFilter]);
      this.chatFilterCache.set(searchParamsKey, newPaginatedResult);
    }
  }

  deleteItem(id: number) {
    console.log('Cache: deleteItem across all keys');
    for (const [key, cache] of this.chatFilterCache.entries()) {
      if (cache?.items) {
        const updatedPaginatedResult = cache.deleteItemById(id);
        if (updatedPaginatedResult) {
          this.chatFilterCache.set(key, updatedPaginatedResult);
        }
      }
    }
  }
}
