import { SortOption } from './sortOption';

//To make a request
export interface PaginationParams {
  pageNumber: number; // currentPage
  pageSize: number; // itemsPerPage
  totalItems: number;
  sortOption: SortOption;
}
