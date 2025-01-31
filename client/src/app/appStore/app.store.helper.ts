import { effect } from '@angular/core';
import { signalStoreFeature, withHooks, getState } from '@ngrx/signals';
import { SortOption } from '../_entities/sortOption';
import { DEFAULT_SORT_OPTION } from '../_framework/constants/defaultSortOption';
import { Advertisement } from '../_models/advertisement';
import { User } from '../_models/user';
import { PaginationParams } from '../_entities/paginationParams';
import { forEach } from 'lodash-es';
import { HttpResponse } from '@angular/common/http';

export function getDefaultSortOptions(): SortOption {
  return {
    field: DEFAULT_SORT_OPTION.field,
    order: DEFAULT_SORT_OPTION.order,
    searchType: DEFAULT_SORT_OPTION.searchType,
    searchValue: DEFAULT_SORT_OPTION.searchValue,
  };
}

export function getDefaultPaginationParams(
  defaultPageSize: number,
  sortOptions?: SortOption
): PaginationParams {
  return {
    totalItems: 0,
    pageNumber: 0,
    pageSize: defaultPageSize,
    sortOption: sortOptions ?? getDefaultSortOptions(),
  };
}

export function getSelectedAdvertisement(): Advertisement | null {
  const selectedAdvertisement = localStorage.getItem('selectedAdvertisement');
  if (selectedAdvertisement) {
    try {
      return JSON.parse(selectedAdvertisement);
    } catch (e) {
      console.error('Error parsing selectedAdvertisement:', e);
      return null;
    }
  }
  return null;
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

export function deleteFromCache(
  id: number,
  hashInfo: Map<PaginationParams, number[]>,
  defaultPaginationParams: PaginationParams
): Map<PaginationParams, number[]> {
  const clonedHashInfo = new Map<PaginationParams, number[]>();
  for (const [key, value] of hashInfo) {
    const clonedKey: PaginationParams = {
      ...key,
      sortOption: { ...key.sortOption },
    };
    const clonedValue = [...value];
    clonedHashInfo.set(clonedKey, clonedValue);
  }

  const keysContainsId: PaginationParams[] = getPaginationParamsContainsId(
    id,
    clonedHashInfo
  );
  forEach(keysContainsId, (key) => {
    updateValuesIdInSameSearch(id, key, clonedHashInfo);
  });

  if (clonedHashInfo.size === 0) {
    clonedHashInfo.set(defaultPaginationParams, []);
  }

  return clonedHashInfo;
}

export function getPaginationParamsContainsId(
  id: number,
  hashInfo: Map<PaginationParams, number[]>
): PaginationParams[] {
  let keysContainsId: PaginationParams[] = [];
  for (const key of hashInfo.keys()) {
    if (hashInfo.get(key)?.includes(id)) {
      keysContainsId.push(key);
    }
  }
  return keysContainsId;
}

export function updateValuesIdInSameSearch(
  id: number,
  inputKey: PaginationParams,
  hashInfo: Map<PaginationParams, number[]>
) {
  let sameSearch: Map<PaginationParams, number[]> = new Map();
  for (const key of hashInfo.keys()) {
    if (areSortOptionEqual(key.sortOption, inputKey.sortOption)) {
      sameSearch.set(key, hashInfo.get(key) ?? []);
    }
  }
  let previousPages: PaginationParams[] = [];
  let nextPages: PaginationParams[] = [];

  for (const key of sameSearch.keys()) {
    if (key.pageNumber < inputKey.pageNumber) previousPages.push(key);
    if (key.pageNumber > inputKey.pageNumber) {
      if ((sameSearch.get(key)?.length ?? 0) > 0) nextPages.push(key);
    }
  }

  const updatedSearch: Map<PaginationParams, number[]> = getUpdatedSearchRow(
    id,
    previousPages,
    inputKey,
    nextPages,
    sameSearch
  );
  for (const key of sameSearch.keys()) {
    if (hashInfo.has(key)) {
      hashInfo.delete(key);
    }
  }
  for (const key of updatedSearch.keys()) {
    hashInfo.set(key, updatedSearch.get(key) ?? []);
  }
}

export function getUpdatedSearchRow(
  id: number,
  previousPages: PaginationParams[],
  actualPage: PaginationParams,
  nextPages: PaginationParams[],
  sameSearch: Map<PaginationParams, number[]>
): Map<PaginationParams, number[]> {
  const updatedSearch: Map<PaginationParams, number[]> = new Map();
  // Previous pages
  forEach(previousPages, (page) => {
    updatedSearch.set(
      { ...page, totalItems: page.totalItems - 1 },
      sameSearch.get(page) ?? []
    );
  });

  // Actual page
  const updatedActualPage: PaginationParams = {
    ...actualPage,
    totalItems: actualPage.totalItems - 1,
  };

  const newActualPageIds: number[] = [];
  const actualPageIds = sameSearch.get(actualPage) ?? [];
  for (const actualPageId of actualPageIds) {
    if (actualPageId !== id) {
      newActualPageIds.push(actualPageId);
    }
  }
  if (newActualPageIds.length > 0) {
    updatedSearch.set(updatedActualPage, newActualPageIds);
  }

  // Next pages
  nextPages = nextPages.sort((a, b) => a.pageNumber - b.pageNumber);
  for (let i = 0; i < nextPages.length; i++) {
    if (i === 0) {
      const firstIdNextPage = (sameSearch.get(nextPages[i]) ?? []).shift();
      if (firstIdNextPage !== undefined) {
        newActualPageIds.push(firstIdNextPage);
        updatedSearch.set(updatedActualPage, newActualPageIds);
        if (
          nextPages.length === 1 &&
          (sameSearch.get(nextPages[i]) ?? []).length > 0
        ) {
          const updatedKeyNextPage = {
            ...nextPages[i],
            totalItems: nextPages[i].totalItems - 1,
          };
          updatedSearch.set(updatedKeyNextPage, [
            ...(sameSearch.get(nextPages[i]) ?? []),
          ]);
        }
      }
    } else {
      if ((sameSearch.get(nextPages[i]) ?? []).length > 0) {
        const firstIdActualIPage = (sameSearch.get(nextPages[i]) ?? []).shift();
        const previousIPageIds = [...(sameSearch.get(nextPages[i - 1]) ?? [])];
        previousIPageIds.push(firstIdActualIPage ?? 0);

        const updatePreviousIPage = {
          ...nextPages[i - 1],
          totalItems: nextPages[i - 1].totalItems - 1,
        };
        updatedSearch.set(updatePreviousIPage, previousIPageIds);
      } else {
        const updatedKeyNextPage = {
          ...nextPages[i],
          totalItems: nextPages[i].totalItems - 1,
        };

        updatedSearch.set(
          updatedKeyNextPage,
          sameSearch.get(nextPages[i]) ?? []
        );
      }
    }
  }
  return updatedSearch;
}

function areValuesEqual(value1: any, value2: any): boolean {
  return (
    ((value1 === '' || value1 === undefined || value1 === null) &&
      (value2 === '' || value2 === undefined || value2 === null)) ||
    value1 === value2
  );
}

export function areSortOptionEqual(
  params1: SortOption,
  params2: SortOption
): boolean {
  return (
    params1.field === params2.field &&
    params1.order === params2.order &&
    params1.searchType === params2.searchType &&
    areValuesEqual(params1.searchValue, params2.searchValue) &&
    params1.dateRange?.start?.getTime() ===
      params2.dateRange?.start?.getTime() &&
    params1.dateRange?.end?.getTime() === params2.dateRange?.end?.getTime()
  );
}

export function arePaginationParamsEqual(
  params1: PaginationParams,
  params2: PaginationParams,
  compareTotalItems = true
): boolean {
  return (
    params1.pageNumber === params2.pageNumber &&
    params1.pageSize === params2.pageSize &&
    (!compareTotalItems || params1.totalItems === params2.totalItems) &&
    areSortOptionEqual(params1.sortOption, params2.sortOption)
  );
}

export function getPaginatedResponse(
  response: HttpResponse<any>
): PaginationParams {
  return JSON.parse(response.headers.get('Pagination')!);
}
