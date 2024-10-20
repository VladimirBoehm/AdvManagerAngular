import { SortOption } from './sortOption';

//To make a request
export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  sortOption: SortOption;
}
