import { AdvertisementCacheType } from './advertisementCacheType';

export class AdvertisementSearchParams {
  cacheType: AdvertisementCacheType | undefined;
  pageNumber = 1;
  pageSize = 5;
 // orderBy = 'username'; TODO сортировка по пользователю, по дате публикации, по username и тд
}



