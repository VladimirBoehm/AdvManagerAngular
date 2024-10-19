import { AdvListType } from '../_framework/constants/advListType';
import { SortOption } from './sortOption';

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  itemsCount: number
  advListType: AdvListType;
  sortOption: SortOption;
}
