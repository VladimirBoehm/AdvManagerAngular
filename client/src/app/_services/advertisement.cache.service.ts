import { Injectable, signal } from '@angular/core';
import { Advertisement } from '../_models/advertisement';
import { AdvertisementSearchParams } from '../_framework/constants/advertisementSearchParams';
import { AdvertisementCacheType } from '../_framework/constants/advertisementCacheType';
import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';

@Injectable({
  providedIn: 'root',
})
export class AdvertisementCacheService {
  private advertisementCache = new Map<any, Advertisement[]>();
  advertisementSearchParams = signal<AdvertisementSearchParams>(
    new AdvertisementSearchParams()
  );

  private getSearchParamsKey(): string {
    return Object.values(this.advertisementSearchParams()).join('-');
  }

  setSearchParams(advertisementCacheType: AdvertisementCacheType) {
    this.advertisementSearchParams.update((params) => ({
      ...params,
      cacheType: advertisementCacheType,
    }));
  }

  getCache(): Advertisement[] | undefined {
    return this.advertisementCache.get(this.getSearchParamsKey());
  }

  setCache(advertisements: Advertisement[]) {
    this.advertisementCache.set(this.getSearchParamsKey(), advertisements);
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
    advertisementId: number,
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
