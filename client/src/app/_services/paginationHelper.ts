import { HttpParams } from '@angular/common/http';
import { PaginationParams } from '../_models/paginationParams';

export function setPaginationHeaders(paginationParams?: PaginationParams) {
  let params = new HttpParams();
  if (!paginationParams) return params;
  {
    params = params.append('pageNumber', paginationParams.pageNumber);
    params = params.append('pageSize', paginationParams.pageSize);
    params = params.append('orderField', paginationParams.sortOption.field);
    params = params.append('order', paginationParams.sortOption.order);
    params = params.append(
      'searchValue',
      paginationParams.sortOption.searchValue ?? ''
    );
    params = params.append(
      'searchType',
      paginationParams.sortOption.searchType ?? ''
    );
  }
  return params;
}
