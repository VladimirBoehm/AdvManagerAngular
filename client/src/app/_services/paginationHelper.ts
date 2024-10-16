import { HttpParams } from '@angular/common/http';
import { SortOption } from '../_models/sortOption';

export function setPaginationHeaders(
  pageNumber: number,
  pageSize: number,
  sortOption: SortOption
) {
  let params = new HttpParams();
  {
    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);
    params = params.append('field', sortOption.field);
    params = params.append('order', sortOption.order);
  }
  return params;
}
