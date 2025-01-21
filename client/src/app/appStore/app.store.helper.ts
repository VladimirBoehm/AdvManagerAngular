import { effect } from '@angular/core';
import { signalStoreFeature, withHooks, getState } from '@ngrx/signals';
import { SortOption } from '../_entities/sortOption';
import { DEFAULT_SORT_OPTION } from '../_framework/constants/defaultSortOption';
import { Advertisement } from '../_models/advertisement';
import { User } from '../_models/user';
import { PaginationParams } from '../_entities/paginationParams';
import { HashInfo } from '../_entities/hashInfo';

export function getDefaultSortOptions(): SortOption {
  return {
    field: DEFAULT_SORT_OPTION.field,
    order: DEFAULT_SORT_OPTION.order,
    searchType: DEFAULT_SORT_OPTION.searchType,
    searchValue: DEFAULT_SORT_OPTION.searchValue,
  };
}

export function getSelectedAdvertisement(): Advertisement | null {
  const selectedAdvertisement = localStorage.getItem('selectedAdvertisement');
  return selectedAdvertisement ? JSON.parse(selectedAdvertisement) : null;
}

export function getUser(): User | null {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function withLogger(name: string) {
  return signalStoreFeature(
    withHooks({
      onInit(store) {
        effect(() => {
          const state = getState(store);
          console.log(`${name} state changed:`, state);
        });
      },
    })
  );
}

export function getHashKey(paginationParams: PaginationParams): string {
  const clonedParams = JSON.parse(
    JSON.stringify({ ...paginationParams, totalItems: 0 })
  );
  function collectValues(obj: any, values: any[] = []): any[] {
    if (obj === null || obj === undefined || obj === '') {
      return values;
    }
    if (typeof obj === 'object' && !Array.isArray(obj)) {
      for (const key of Object.keys(obj)) {
        collectValues(obj[key], values);
      }
    } else {
      values.push(obj);
    }
    return values;
  }
  const resultValues = collectValues(clonedParams);
  return resultValues.join('-');
}

export function deleteFromCache(id: number, hashInfo: Map<string, HashInfo>){
   let keysContainsId: string[] = [];
    for (const key of hashInfo.keys()) {
      if (hashInfo.get(key)?.ids.includes(id)) {
         keysContainsId.push(key);
      }
    }
}

export function updateValues(keyList: string[], hashInfo: Map<string, HashInfo>){
    for (const key of keyList) {
        const hash = hashInfo.get(key);
        if (hash) {
        hash.totalItems = hash.ids.length;
        }
    }
}
