import { AdvertisementSearchType } from '../_framework/constants/advertisementSearchType';

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  searchValue?: string;
  advertisementSearchType: AdvertisementSearchType;
}
