import { HttpParams } from '@angular/common/http';
import { PaginationParams } from '../_models/paginationParams';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export function setPaginationHeaders(paginationParams?: PaginationParams) {
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
    params = params.append(
      'startDate',
      dayjs(paginationParams.sortOption.dateRange.start)
        .utcOffset(0, true)
        .format()
    );
  }

  if (paginationParams.sortOption.dateRange?.end) {
    params = params.append(
      'endDate',
      dayjs(paginationParams.sortOption.dateRange.end)
        .utcOffset(0, true)
        .format()
    );
  }

  return params;
}
