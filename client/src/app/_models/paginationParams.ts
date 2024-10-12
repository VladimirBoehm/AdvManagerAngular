import { SearchType } from '../_framework/constants/searchType';

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  searchValue?: string;
  searchType: SearchType;
}
