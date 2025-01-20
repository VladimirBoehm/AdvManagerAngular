import { HttpParams } from '@angular/common/http';
import { PaginationParams } from '../_entities/paginationParams';

export function getPaginationHeaders(paginationParams?: PaginationParams) {
  let params = new HttpParams();
  if (!paginationParams) return params;

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

  if (paginationParams.sortOption.dateRange?.start) {
    const startDate = new Date(paginationParams.sortOption.dateRange.start);
    const utcStartDate = new Date(
      Date.UTC(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      )
    );
    params = params.append('startDate', utcStartDate.toISOString());
  }

  if (paginationParams.sortOption.dateRange?.end) {
    const endDate = new Date(paginationParams.sortOption.dateRange.end);
    const utcEndDate = new Date(
      Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    );
    params = params.append('endDate', utcEndDate.toISOString());
  }

  return params;
}
