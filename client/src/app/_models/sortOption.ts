export interface SortOption {
  field: 'date' | 'title' | 'username' | 'name';
  order: 'asc' | 'desc';
  searchType: 'title' | 'content' | 'date' | 'link';
  searchValue?: string;
}
