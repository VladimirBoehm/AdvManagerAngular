//To get a response
export interface Pagination {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

export class PaginatedResult<T> {
  items?: T;
  pagination?: Pagination;
}
