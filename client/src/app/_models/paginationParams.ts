import { SearchType } from '../_framework/constants/searchType';
import { SortOption } from './sortOption';

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  searchValue?: string;
  searchType: SearchType;
  sortOption: SortOption;
}
