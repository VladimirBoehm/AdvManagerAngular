import { PaginatedItem } from './paginatedItem';

//To get a response
export interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export class PaginatedResult<T extends PaginatedItem> {
  items?: T[];
  pagination?: Pagination;

  constructor(items?: T[], pagination?: Pagination);
  constructor(paginatedResult?: PaginatedResult<T>);

  constructor(
    itemsOrResult?: T[] | PaginatedResult<T>,
    pagination?: Pagination
  ) {
    if (itemsOrResult instanceof Array) {
      this.items = itemsOrResult;
      this.pagination = pagination;
    } else if (itemsOrResult instanceof PaginatedResult) {
      this.items = itemsOrResult.items;
      this.pagination = itemsOrResult.pagination;
    }
  }

  setItems(items: T[]): PaginatedResult<T> {
    this.items = items;
    return new PaginatedResult(this.items, this.pagination);
  }

  addItem(item: T): PaginatedResult<T> {
    this.items?.unshift(item);
    return new PaginatedResult(this.items, this.pagination);
  }

  setTotalItems(number: number): PaginatedResult<T> | null {
    if (!this.pagination) return null;
    this.pagination.totalItems = number;
    return new PaginatedResult(this.items, this.pagination);
  }

  deleteItemById(id: number): PaginatedResult<T> | null {
    if (!this.items) return null;
    this.items = this.items.filter((x) => x.id !== id);
    return new PaginatedResult(this.items, this.pagination);
  }

  setItemId(id: number): PaginatedResult<T> | null {
    if (!this.items) return null;
    const index = this.items?.findIndex((cf) => cf.id === 0);

    if (index !== -1) {
      this.items[index] = { ...this.items[index], id: id };
    }
    return new PaginatedResult(this.items, this.pagination);
  }
}
