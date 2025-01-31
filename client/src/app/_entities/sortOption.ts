export type SortField = 'date' | 'title' | 'username' | 'name';
export type SortOrder = 'asc' | 'desc';
export type SearchType = 'title' | 'content' | 'date' | 'username' | 'name';
export interface SortOption {
  field: SortField;
  order: SortOrder;
  searchType: SearchType;
  searchValue?: string;
  dateRange?: { start: Date; end: Date };
}
