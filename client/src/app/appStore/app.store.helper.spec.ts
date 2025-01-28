import { PaginationParams } from '../_entities/paginationParams';
import {
  getUpdatedSearchRow,
  arePaginationParamsEqual,
  getPaginationParamsContainsId,
  deleteFromCache,
  getDefaultPaginationParams,
} from './app.store.helper';

describe('deleteFromCache', () => {
  let sameSearch: Map<PaginationParams, number[]>;
  beforeEach(() => {
    sameSearch = new Map();
  });
  it('should return PaginationParams that contains selected id', () => {
    const paginationParamsFirstPage1: PaginationParams = {
      pageNumber: 1,
      pageSize: 5,
      totalItems: 12,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    };
    const paginationParamsFirstPage2: PaginationParams = {
      pageNumber: 2,
      pageSize: 5,
      totalItems: 12,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    };
    const paginationParamsFirstPage3: PaginationParams = {
      pageNumber: 3,
      pageSize: 5,
      totalItems: 12,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    };
    sameSearch = new Map<PaginationParams, number[]>();
    sameSearch.set(paginationParamsFirstPage1, [1, 7, 3, 4, 5]);
    sameSearch.set(paginationParamsFirstPage2, [6, 2, 8, 9, 10]);
    sameSearch.set(paginationParamsFirstPage3, [11, 12]);
    const paginationParamsContainsId = getPaginationParamsContainsId(
      2,
      sameSearch
    );
    expect(paginationParamsContainsId.length).toEqual(1);
    if (paginationParamsContainsId[0]) {
      expect(paginationParamsContainsId[0].pageNumber).toEqual(2);
    }
  });
  it('should return all PaginationParams that contains selected id', () => {
    const paginationParamsFirstPage1: PaginationParams = {
      pageNumber: 1,
      pageSize: 5,
      totalItems: 12,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    };
    const paginationParamsFirstPage2: PaginationParams = {
      pageNumber: 2,
      pageSize: 5,
      totalItems: 12,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    };
    const paginationParamsFirstPage3: PaginationParams = {
      pageNumber: 3,
      pageSize: 5,
      totalItems: 12,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    };
    sameSearch = new Map<PaginationParams, number[]>();
    sameSearch.set(paginationParamsFirstPage1, [1, 2, 3, 4, 5]);
    sameSearch.set(paginationParamsFirstPage2, [6, 2, 8, 9, 10]);
    sameSearch.set(paginationParamsFirstPage3, [11, 12]);
    const paginationParamsContainsId = getPaginationParamsContainsId(
      2,
      sameSearch
    );
    expect(paginationParamsContainsId.length).toEqual(2);
  });
  it('should return updated search row', () => {
    sameSearch = new Map<PaginationParams, number[]>();
    const paginationParamsFirstPage1: PaginationParams = {
      pageNumber: 1,
      pageSize: 5,
      totalItems: 12,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    };
    const paginationParamsFirstPage2: PaginationParams = {
      pageNumber: 2,
      pageSize: 5,
      totalItems: 12,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    };
    const paginationParamsFirstPage3: PaginationParams = {
      pageNumber: 3,
      pageSize: 5,
      totalItems: 12,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    };
    const paginationParamsFirstPage4: PaginationParams = {
      pageNumber: 4,
      pageSize: 5,
      totalItems: 12,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    };

    sameSearch.set(paginationParamsFirstPage1, [1, 2, 3, 4, 5]);
    sameSearch.set(paginationParamsFirstPage2, [6, 7, 8, 9, 10]);
    sameSearch.set(paginationParamsFirstPage3, [11, 12, 13, 14, 15]);
    sameSearch.set(paginationParamsFirstPage4, [16, 17]);

    const updatedSearchRow: Map<PaginationParams, number[]> =
      getUpdatedSearchRow(
        7,
        [paginationParamsFirstPage1],
        paginationParamsFirstPage2,
        [paginationParamsFirstPage3, paginationParamsFirstPage4],
        sameSearch
      );

    for (const key of updatedSearchRow.keys()) {
      expect(key.totalItems).toEqual(11);
      if (key.pageNumber === 1) {
        expect(updatedSearchRow.get(key)).toEqual([1, 2, 3, 4, 5]);
      }
      if (key.pageNumber === 2) {
        expect(updatedSearchRow.get(key)).toEqual([6, 8, 9, 10, 11]);
      }
      if (key.pageNumber === 3) {
        expect(updatedSearchRow.get(key)).toEqual([12, 13, 14, 15, 16]);
      }
      if (key.pageNumber === 4) {
        expect(updatedSearchRow.get(key)).toEqual([17]);
      }
    }
  });
  it('should return updated search row, extra row', () => {
    sameSearch = new Map<PaginationParams, number[]>();
    const paginationParamsFirstPage1: PaginationParams = {
      pageNumber: 1,
      pageSize: 5,
      totalItems: 24,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    };
    const paginationParamsFirstPage2: PaginationParams = {
      pageNumber: 2,
      pageSize: 5,
      totalItems: 24,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    };
    const paginationParamsFirstPage3: PaginationParams = {
      pageNumber: 3,
      pageSize: 5,
      totalItems: 24,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    };
    const paginationParamsFirstPage4: PaginationParams = {
      pageNumber: 4,
      pageSize: 5,
      totalItems: 24,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    };
    const paginationParamsFirstPage5: PaginationParams = {
      pageNumber: 5,
      pageSize: 5,
      totalItems: 24,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    };

    sameSearch.set(paginationParamsFirstPage1, [1, 2, 3, 4, 5]);
    sameSearch.set(paginationParamsFirstPage2, [6, 7, 8, 9, 10]);
    sameSearch.set(paginationParamsFirstPage3, [11, 12, 13, 14, 15]);
    sameSearch.set(paginationParamsFirstPage4, [16, 17, 18, 19, 20]);
    sameSearch.set(paginationParamsFirstPage5, [21, 22, 23, 24]);

    const updatedSearchRow: Map<PaginationParams, number[]> =
      getUpdatedSearchRow(
        7,
        [paginationParamsFirstPage1],
        paginationParamsFirstPage2,
        [
          paginationParamsFirstPage3,
          paginationParamsFirstPage4,
          paginationParamsFirstPage5,
        ],
        sameSearch
      );
    for (const key of updatedSearchRow.keys()) {
      expect(key.totalItems).toEqual(23);
      if (key.pageNumber === 1) {
        expect(updatedSearchRow.get(key)).toEqual([1, 2, 3, 4, 5]);
      }
      if (key.pageNumber === 2) {
        expect(updatedSearchRow.get(key)).toEqual([6, 8, 9, 10, 11]);
      }
      if (key.pageNumber === 3) {
        expect(updatedSearchRow.get(key)).toEqual([12, 13, 14, 15, 16]);
      }
      if (key.pageNumber === 4) {
        expect(updatedSearchRow.get(key)).toEqual([17, 18, 19, 20, 21]);
      }
      if (key.pageNumber === 5) {
        expect(updatedSearchRow.get(key)).toEqual([22]);
      }
    }
  });
  it('should return updated search row without last page', () => {
    sameSearch = new Map<PaginationParams, number[]>();
    const paginationParamsFirstPage1 = {
      pageNumber: 1,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;
    const paginationParamsFirstPage2 = {
      pageNumber: 2,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;
    const paginationParamsFirstPage3 = {
      pageNumber: 3,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;
    const paginationParamsFirstPage4 = {
      pageNumber: 4,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;

    sameSearch.set(paginationParamsFirstPage1, [1, 2, 3, 4, 5]);
    sameSearch.set(paginationParamsFirstPage2, [6, 7, 8, 9, 10]);
    sameSearch.set(paginationParamsFirstPage3, [11, 12, 13, 14, 15]);
    sameSearch.set(paginationParamsFirstPage4, [16]);

    const updatedSearchRow: Map<PaginationParams, number[]> =
      getUpdatedSearchRow(
        7,
        [paginationParamsFirstPage1],
        paginationParamsFirstPage2,
        [paginationParamsFirstPage3, paginationParamsFirstPage4],
        sameSearch
      );

    for (const key of updatedSearchRow.keys()) {
      expect(key.totalItems).toEqual(15);
      if (key.pageNumber === 1) {
        expect(updatedSearchRow.get(key)).toEqual([1, 2, 3, 4, 5]);
      }
      if (key.pageNumber === 2) {
        expect(updatedSearchRow.get(key)).toEqual([6, 8, 9, 10, 11]);
      }
      if (key.pageNumber === 3) {
        expect(updatedSearchRow.get(key)).toEqual([12, 13, 14, 15, 16]);
      }
    }
    expect(updatedSearchRow.size).toEqual(3);
  });
  it('getUpdatedSearchRow should not affect main dict keys', () => {
    sameSearch = new Map<PaginationParams, number[]>();
    const paginationParamsFirstPage1 = {
      pageNumber: 1,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;
    const paginationParamsFirstPage2 = {
      pageNumber: 2,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;
    const paginationParamsFirstPage3 = {
      pageNumber: 3,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;
    const paginationParamsFirstPage4 = {
      pageNumber: 4,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;

    sameSearch.set(paginationParamsFirstPage1, [1, 2, 3, 4, 5]);
    sameSearch.set(paginationParamsFirstPage2, [6, 7, 8, 9, 10]);
    sameSearch.set(paginationParamsFirstPage3, [11, 12, 13, 14, 15]);
    sameSearch.set(paginationParamsFirstPage4, [16]);

    const paginationParamsFirstPage1Clone = { ...paginationParamsFirstPage1 };
    const paginationParamsFirstPage2Clone = { ...paginationParamsFirstPage2 };
    const paginationParamsFirstPage3Clone = { ...paginationParamsFirstPage3 };
    const paginationParamsFirstPage4Clone = { ...paginationParamsFirstPage4 };

    const updatedSearchRow: Map<PaginationParams, number[]> =
      getUpdatedSearchRow(
        7,
        [paginationParamsFirstPage1],
        paginationParamsFirstPage2,
        [paginationParamsFirstPage3, paginationParamsFirstPage4],
        sameSearch
      );

    expect(
      arePaginationParamsEqual(
        paginationParamsFirstPage1Clone,
        paginationParamsFirstPage1
      )
    ).toBe(true);
    expect(
      arePaginationParamsEqual(
        paginationParamsFirstPage2Clone,
        paginationParamsFirstPage2
      )
    ).toBe(true);
    expect(
      arePaginationParamsEqual(
        paginationParamsFirstPage3Clone,
        paginationParamsFirstPage3
      )
    ).toBe(true);
    expect(
      arePaginationParamsEqual(
        paginationParamsFirstPage4Clone,
        paginationParamsFirstPage4
      )
    ).toBe(true);
  });
  it('getUpdatedSearchRow without previous page should work', () => {
    sameSearch = new Map<PaginationParams, number[]>();
    const paginationParamsFirstPage1 = {
      pageNumber: 1,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;
    const paginationParamsFirstPage2 = {
      pageNumber: 2,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;
    const paginationParamsFirstPage3 = {
      pageNumber: 3,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;
    const paginationParamsFirstPage4 = {
      pageNumber: 4,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;

    sameSearch.set(paginationParamsFirstPage1, [1, 2, 3, 4, 5]);
    sameSearch.set(paginationParamsFirstPage2, [6, 7, 8, 9, 10]);
    sameSearch.set(paginationParamsFirstPage3, [11, 12, 13, 14, 15]);
    sameSearch.set(paginationParamsFirstPage4, [16]);

    const updatedSearchRow: Map<PaginationParams, number[]> =
      getUpdatedSearchRow(
        1,
        [],
        paginationParamsFirstPage1,
        [
          paginationParamsFirstPage3,
          paginationParamsFirstPage4,
          paginationParamsFirstPage2,
        ],
        sameSearch
      );

    for (const key of updatedSearchRow.keys()) {
      expect(key.totalItems).toEqual(15);
      if (key.pageNumber === 1) {
        expect(updatedSearchRow.get(key)).toEqual([2, 3, 4, 5, 6]);
      }
      if (key.pageNumber === 2) {
        expect(updatedSearchRow.get(key)).toEqual([7, 8, 9, 10, 11]);
      }
      if (key.pageNumber === 3) {
        expect(updatedSearchRow.get(key)).toEqual([12, 13, 14, 15, 16]);
      }
    }
    expect(updatedSearchRow.size).toEqual(3);
  });
  it('getUpdatedSearchRow without next page should work', () => {
    sameSearch = new Map<PaginationParams, number[]>();
    const paginationParamsFirstPage1 = {
      pageNumber: 1,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;
    const paginationParamsFirstPage2 = {
      pageNumber: 2,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;
    const paginationParamsFirstPage3 = {
      pageNumber: 3,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;
    const paginationParamsFirstPage4 = {
      pageNumber: 4,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;

    sameSearch.set(paginationParamsFirstPage1, [1, 2, 3, 4, 5]);
    sameSearch.set(paginationParamsFirstPage2, [6, 7, 8, 9, 10]);
    sameSearch.set(paginationParamsFirstPage3, [11, 12, 13, 14, 15]);
    sameSearch.set(paginationParamsFirstPage4, [16]);

    const updatedSearchRow: Map<PaginationParams, number[]> =
      getUpdatedSearchRow(
        16,
        [
          paginationParamsFirstPage1,
          paginationParamsFirstPage2,
          paginationParamsFirstPage3,
        ],
        paginationParamsFirstPage4,
        [],
        sameSearch
      );
    for (const key of updatedSearchRow.keys()) {
      expect(key.totalItems).toEqual(15);
      if (key.pageNumber === 1) {
        expect(updatedSearchRow.get(key)).toEqual([1, 2, 3, 4, 5]);
      }
      if (key.pageNumber === 2) {
        expect(updatedSearchRow.get(key)).toEqual([6, 7, 8, 9, 10]);
      }
      if (key.pageNumber === 3) {
        expect(updatedSearchRow.get(key)).toEqual([11, 12, 13, 14, 15]);
      }
    }
    expect(updatedSearchRow.size).toEqual(3);
  });
  it('getUpdatedSearchRow with one page should work', () => {
    sameSearch = new Map<PaginationParams, number[]>();
    const paginationParamsFirstPage1 = {
      pageNumber: 1,
      pageSize: 5,
      totalItems: 5,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;

    sameSearch.set(paginationParamsFirstPage1, [1, 2, 3, 4, 5]);

    const updatedSearchRow: Map<PaginationParams, number[]> =
      getUpdatedSearchRow(5, [], paginationParamsFirstPage1, [], sameSearch);
    for (const key of updatedSearchRow.keys()) {
      expect(key.totalItems).toEqual(4);
      if (key.pageNumber === 1) {
        expect(updatedSearchRow.get(key)).toEqual([1, 2, 3, 4]);
      }
    }
    expect(updatedSearchRow.size).toEqual(1);
  });
  it('getUpdatedSearchRow with one item should work', () => {
    sameSearch = new Map<PaginationParams, number[]>();
    const paginationParamsFirstPage1 = {
      pageNumber: 1,
      pageSize: 5,
      totalItems: 1,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;

    sameSearch.set(paginationParamsFirstPage1, [1]);

    const updatedSearchRow: Map<PaginationParams, number[]> =
      getUpdatedSearchRow(1, [], paginationParamsFirstPage1, [], sameSearch);

    expect(updatedSearchRow.size).toEqual(0);
  });
  it('getUpdatedSearchRow with two items should work', () => {
    sameSearch = new Map<PaginationParams, number[]>();
    const paginationParamsFirstPage1 = {
      pageNumber: 1,
      pageSize: 5,
      totalItems: 2,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;

    sameSearch.set(paginationParamsFirstPage1, [1, 2]);

    const updatedSearchRow: Map<PaginationParams, number[]> =
      getUpdatedSearchRow(1, [], paginationParamsFirstPage1, [], sameSearch);

    for (const key of updatedSearchRow.keys()) {
      expect(key.totalItems).toEqual(1);
      if (key.pageNumber === 1) {
        expect(updatedSearchRow.get(key)).toEqual([2]);
      }
    }

    expect(updatedSearchRow.size).toEqual(1);
  });
  //-------------------------------------
  it('deleteFromCache should update hashInfo', () => {
    const hashInfo = new Map<PaginationParams, number[]>();
    const paginationParamsFirstPage1 = {
      pageNumber: 1,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;
    const paginationParamsFirstPage2 = {
      pageNumber: 2,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;
    const paginationParamsFirstPage3 = {
      pageNumber: 3,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;
    const paginationParamsFirstPage4 = {
      pageNumber: 4,
      pageSize: 5,
      totalItems: 16,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;
    const paginationParamsAnotherSearch = {
      pageNumber: 1,
      pageSize: 5,
      totalItems: 9,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'GG',
      },
    } as PaginationParams;
    const paginationParamsAnotherSearch2 = {
      pageNumber: 2,
      pageSize: 5,
      totalItems: 9,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'GG',
      },
    } as PaginationParams;

    const defaultPaginationParams = getDefaultPaginationParams(8);
    hashInfo.set(paginationParamsFirstPage1, [1, 2, 3, 4, 5]);
    hashInfo.set(paginationParamsFirstPage2, [6, 7, 8, 9, 10]);
    hashInfo.set(paginationParamsFirstPage3, [11, 12, 13, 14, 15]);
    hashInfo.set(paginationParamsFirstPage4, [16]);
    hashInfo.set(paginationParamsAnotherSearch, [1, 2, 3, 4, 5]);
    hashInfo.set(paginationParamsAnotherSearch2, [6, 7, 8, 9]);
    const result = deleteFromCache(11, hashInfo, defaultPaginationParams);

    for (const key of result.keys()) {
      if (key.pageNumber === 1 && key.sortOption.searchValue === 'A') {
        expect(result.get(key)).toEqual([1, 2, 3, 4, 5]);
        expect(key.totalItems).toEqual(15);
      }
      if (key.pageNumber === 2 && key.sortOption.searchValue === 'A') {
        expect(result.get(key)).toEqual([6, 7, 8, 9, 10]);
      }
      if (key.pageNumber === 3 && key.sortOption.searchValue === 'A') {
        expect(result.get(key)).toEqual([12, 13, 14, 15, 16]);
      }
      if (key.pageNumber === 1 && key.sortOption.searchValue === 'GG') {
        expect(result.get(key)).toEqual([1, 2, 3, 4, 5]);
      }
      if (key.pageNumber === 2 && key.sortOption.searchValue === 'GG') {
        expect(result.get(key)).toEqual([6, 7, 8, 9]);
        expect(key.totalItems).toEqual(9);
      }
    }
    expect(result.size).toEqual(5);
  });
  it('deleteFromCache should return default paginationParams', () => {
    const hashInfo = new Map<PaginationParams, number[]>();
    const paginationParamsFirstPage1 = {
      pageNumber: 1,
      pageSize: 5,
      totalItems: 1,
      sortOption: {
        field: 'date',
        order: 'asc',
        searchType: 'content',
        searchValue: 'A',
      },
    } as PaginationParams;

    const defaultPaginationParams = getDefaultPaginationParams(8);
    hashInfo.set(paginationParamsFirstPage1, [1]);
    const result = deleteFromCache(1, hashInfo, defaultPaginationParams);

    const singleKey = result.keys().next().value;
    expect(singleKey).toBeDefined();
    if (singleKey) {
      expect(result.get(singleKey)).toEqual([]);
      expect(singleKey.totalItems).toEqual(0);
      expect(
        arePaginationParamsEqual(singleKey, defaultPaginationParams)
      ).toEqual(true);
      expect(result.size).toEqual(1);
    }
  });
});
