import { PaginationParams } from '../../_models/paginationParams';
import { AdvertisementSearchType as AdvertisementSearchType } from './advertisementSearchType';

export class AdvertisementSearchParams {
  cacheType: AdvertisementSearchType | undefined;
  paginationParams: PaginationParams | undefined;
}
