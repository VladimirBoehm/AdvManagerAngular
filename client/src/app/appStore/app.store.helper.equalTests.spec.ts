import { PaginationParams } from '../_entities/paginationParams';
import {
  arePaginationParamsEqual,
} from './app.store.helper';

describe('equalTests', () => {
  let paginationParams1: PaginationParams;
  let paginationParams11: PaginationParams;
  let paginationParams2: PaginationParams;
  let paginationParamsDate1: PaginationParams;
  let paginationParamsDate11: PaginationParams;
  let paginationParamsDate2: PaginationParams;

  beforeEach(() => {
    paginationParams1 = {
      pageNumber: 1,
      pageSize: 10,
      totalItems: 10,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    };
    paginationParams11 = {
      pageNumber: 1,
      pageSize: 10,
      totalItems: 10,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    };
    paginationParams2 = {
      pageNumber: 1,
      pageSize: 10,
      totalItems: 10,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'B',
      },
    };
    paginationParamsDate1 = {
      pageNumber: 1,
      pageSize: 10,
      totalItems: 10,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        dateRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-03-03'),
        },
      },
    };
    paginationParamsDate11 = {
      pageNumber: 1,
      pageSize: 10,
      totalItems: 10,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        dateRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-03-03'),
        },
      },
    };
    paginationParamsDate2 = {
      pageNumber: 1,
      pageSize: 10,
      totalItems: 10,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        dateRange: {
          start: new Date('2023-02-01'),
          end: new Date('2023-03-03'),
        },
      },
    };
  });
  it('should return true if paginationParams1 and paginationParams11 are equal', () => {
    expect(
      arePaginationParamsEqual(paginationParams1, paginationParams11)
    ).toBe(true);
  });
  it('should return false if paginationParams1 and paginationParams2 are not equal', () => {
    expect(arePaginationParamsEqual(paginationParams1, paginationParams2)).toBe(
      false
    );
  });
  it('should return true if paginationParamsDate1 and paginationParamsDate11 are equal', () => {
    expect(
      arePaginationParamsEqual(paginationParamsDate1, paginationParamsDate11)
    ).toBe(true);
  });
  it('should return false if paginationParamsDate1 and paginationParamsDate2 are not equal', () => {
    expect(
      arePaginationParamsEqual(paginationParamsDate1, paginationParamsDate2)
    ).toBe(false);
  });
});
