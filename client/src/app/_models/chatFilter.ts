import { PaginatedItem } from './paginatedItem';

export interface ChatFilter extends PaginatedItem {
  value: string;
  created: Date;
}
