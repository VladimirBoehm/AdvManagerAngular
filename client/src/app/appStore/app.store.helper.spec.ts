import { PaginationParams } from '../_entities/paginationParams';
import {
  getUpdatedSearchRow,
  arePaginationParamsEqual,
  getPaginationParamsContainsId,
} from './app.store.helper';

type HashInfo = {
  totalItems: number;
  ids: number[];
};

describe('deleteFromCache', () => {
  let sameSearch: Map<PaginationParams, number[]>;
  let allSearch: Map<PaginationParams, number[]>;
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
  //-------------------------------------
  // it('should return PaginationParams that contains selected id', () => {
  //   const paginationParamsFirstPage1: PaginationParams = {
  //     pageNumber: 1,
  //     pageSize: 5,
  //     totalItems: 12,
  //     sortOption: {
  //       field: 'date',
  //       order: 'asc',
  //       searchType: 'content',
  //       searchValue: 'A',
  //     },
  //   };
  //   const paginationParamsFirstPage2: PaginationParams = {
  //     pageNumber: 2,
  //     pageSize: 5,
  //     totalItems: 12,
  //     sortOption: {
  //       field: 'date',
  //       order: 'asc',
  //       searchType: 'content',
  //       searchValue: 'A',
  //     },
  //   };
  //   const paginationParamsFirstPage3: PaginationParams = {
  //     pageNumber: 3,
  //     pageSize: 5,
  //     totalItems: 12,
  //     sortOption: {
  //       field: 'date',
  //       order: 'asc',
  //       searchType: 'content',
  //       searchValue: 'A',
  //     },
  //   };
  //   sameSearch = new Map<PaginationParams, number[]>();
  //   sameSearch.set(paginationParamsFirstPage1, [1, 7, 3, 4, 5]);
  //   sameSearch.set(paginationParamsFirstPage2, [6, 2, 8, 9, 10]);
  //   sameSearch.set(paginationParamsFirstPage3, [11, 12]);
  //   const paginationParamsContainsId = getPaginationParamsContainsId(
  //     2,
  //     sameSearch
  //   );
  //   expect(paginationParamsContainsId.length).toEqual(1);
  //   if (paginationParamsContainsId[0]) {
  //     expect(paginationParamsContainsId[0].pageNumber).toEqual(2);
  //   }
  // });
  // it('should return all PaginationParams that contains selected id', () => {
  //   const paginationParamsFirstPage1: PaginationParams = {
  //     pageNumber: 1,
  //     pageSize: 5,
  //     totalItems: 12,
  //     sortOption: {
  //       field: 'date',
  //       order: 'asc',
  //       searchType: 'content',
  //       searchValue: 'A',
  //     },
  //   };
  //   const paginationParamsFirstPage2: PaginationParams = {
  //     pageNumber: 2,
  //     pageSize: 5,
  //     totalItems: 12,
  //     sortOption: {
  //       field: 'date',
  //       order: 'asc',
  //       searchType: 'content',
  //       searchValue: 'A',
  //     },
  //   };
  //   const paginationParamsFirstPage3: PaginationParams = {
  //     pageNumber: 3,
  //     pageSize: 5,
  //     totalItems: 12,
  //     sortOption: {
  //       field: 'date',
  //       order: 'asc',
  //       searchType: 'content',
  //       searchValue: 'A',
  //     },
  //   };
  //   const paginationParamsFirstPage4: PaginationParams = {
  //     pageNumber: 4,
  //     pageSize: 5,
  //     totalItems: 12,
  //     sortOption: {
  //       field: 'date',
  //       order: 'asc',
  //       searchType: 'content',
  //       searchValue: 'A',
  //     },
  //   };
  //   sameSearch = new Map<PaginationParams, number[]>();
  //   sameSearch.set(paginationParamsFirstPage1, [1, 2, 3, 4, 5]);
  //   sameSearch.set(paginationParamsFirstPage2, [6, 2, 8, 9, 10]);
  //   sameSearch.set(paginationParamsFirstPage3, [11, 12]);
  //   const paginationParamsContainsId = getPaginationParamsContainsId(
  //     2,
  //     sameSearch
  //   );
  //   expect(paginationParamsContainsId.length).toEqual(2);
  // });
  // it('should return updated search row', () => {
  //   sameSearch = new Map<PaginationParams, number[]>();
  //   const paginationParamsFirstPage1: PaginationParams = {
  //     pageNumber: 1,
  //     pageSize: 5,
  //     totalItems: 12,
  //     sortOption: {
  //       field: 'date',
  //       order: 'asc',
  //       searchType: 'content',
  //       searchValue: 'A',
  //     },
  //   };
  //   const paginationParamsFirstPage2: PaginationParams = {
  //     pageNumber: 2,
  //     pageSize: 5,
  //     totalItems: 12,
  //     sortOption: {
  //       field: 'date',
  //       order: 'asc',
  //       searchType: 'content',
  //       searchValue: 'A',
  //     },
  //   };
  //   const paginationParamsFirstPage3: PaginationParams = {
  //     pageNumber: 3,
  //     pageSize: 5,
  //     totalItems: 12,
  //     sortOption: {
  //       field: 'date',
  //       order: 'asc',
  //       searchType: 'content',
  //       searchValue: 'A',
  //     },
  //   };
  //   const paginationParamsFirstPage4: PaginationParams = {
  //     pageNumber: 4,
  //     pageSize: 5,
  //     totalItems: 12,
  //     sortOption: {
  //       field: 'date',
  //       order: 'asc',
  //       searchType: 'content',
  //       searchValue: 'A',
  //     },
  //   };

  //   sameSearch.set(paginationParamsFirstPage1, [1, 2, 3, 4, 5]);
  //   sameSearch.set(paginationParamsFirstPage2, [6, 7, 8, 9, 10]);
  //   sameSearch.set(paginationParamsFirstPage3, [11, 12, 13, 14, 15]);
  //   sameSearch.set(paginationParamsFirstPage4, [16, 17]);

  //   const updatedSearchRow: Map<PaginationParams, number[]> =
  //     getUpdatedSearchRow(
  //       7,
  //       [paginationParamsFirstPage1],
  //       paginationParamsFirstPage2,
  //       [paginationParamsFirstPage3, paginationParamsFirstPage4],
  //       sameSearch
  //     );

  //   for (const key of updatedSearchRow.keys()) {
  //     expect(key.totalItems).toEqual(11);
  //     if (key.pageNumber === 1) {
  //       expect(updatedSearchRow.get(key)).toEqual([1, 2, 3, 4, 5]);
  //     }
  //     if (key.pageNumber === 2) {
  //       expect(updatedSearchRow.get(key)).toEqual([6, 8, 9, 10, 11]);
  //     }
  //     if (key.pageNumber === 3) {
  //       expect(updatedSearchRow.get(key)).toEqual([12, 13, 14, 15, 16]);
  //     }
  //     if (key.pageNumber === 4) {
  //       expect(updatedSearchRow.get(key)).toEqual([17]);
  //     }
  //   }
  // });
  // it('should return updated search row, extra row', () => {
  //   sameSearch = new Map<PaginationParams, number[]>();
  //   const paginationParamsFirstPage1: PaginationParams = {
  //     pageNumber: 1,
  //     pageSize: 5,
  //     totalItems: 24,
  //     sortOption: {
  //       field: 'date',
  //       order: 'asc',
  //       searchType: 'content',
  //       searchValue: 'A',
  //     },
  //   };
  //   const paginationParamsFirstPage2: PaginationParams = {
  //     pageNumber: 2,
  //     pageSize: 5,
  //     totalItems: 24,
  //     sortOption: {
  //       field: 'date',
  //       order: 'asc',
  //       searchType: 'content',
  //       searchValue: 'A',
  //     },
  //   };
  //   const paginationParamsFirstPage3: PaginationParams = {
  //     pageNumber: 3,
  //     pageSize: 5,
  //     totalItems: 24,
  //     sortOption: {
  //       field: 'date',
  //       order: 'asc',
  //       searchType: 'content',
  //       searchValue: 'A',
  //     },
  //   };
  //   const paginationParamsFirstPage4: PaginationParams = {
  //     pageNumber: 4,
  //     pageSize: 5,
  //     totalItems: 24,
  //     sortOption: {
  //       field: 'date',
  //       order: 'asc',
  //       searchType: 'content',
  //       searchValue: 'A',
  //     },
  //   };
  //   const paginationParamsFirstPage5: PaginationParams = {
  //     pageNumber: 5,
  //     pageSize: 5,
  //     totalItems: 24,
  //     sortOption: {
  //       field: 'date',
  //       order: 'asc',
  //       searchType: 'content',
  //       searchValue: 'A',
  //     },
  //   };

  //   sameSearch.set(paginationParamsFirstPage1, [1, 2, 3, 4, 5]);
  //   sameSearch.set(paginationParamsFirstPage2, [6, 7, 8, 9, 10]);
  //   sameSearch.set(paginationParamsFirstPage3, [11, 12, 13, 14, 15]);
  //   sameSearch.set(paginationParamsFirstPage4, [16, 17, 18, 19, 20]);
  //   sameSearch.set(paginationParamsFirstPage5, [21, 22, 23, 24]);

  //   const updatedSearchRow: Map<PaginationParams, number[]> =
  //     getUpdatedSearchRow(
  //       7,
  //       [paginationParamsFirstPage1],
  //       paginationParamsFirstPage2,
  //       [
  //         paginationParamsFirstPage3,
  //         paginationParamsFirstPage4,
  //         paginationParamsFirstPage5,
  //       ],
  //       sameSearch
  //     );
  //   console.log(updatedSearchRow);
  //   for (const key of updatedSearchRow.keys()) {
  //     expect(key.totalItems).toEqual(23);
  //     if (key.pageNumber === 1) {
  //       expect(updatedSearchRow.get(key)).toEqual([1, 2, 3, 4, 5]);
  //     }
  //     if (key.pageNumber === 2) {
  //       expect(updatedSearchRow.get(key)).toEqual([6, 8, 9, 10, 11]);
  //     }
  //     if (key.pageNumber === 3) {
  //       expect(updatedSearchRow.get(key)).toEqual([12, 13, 14, 15, 16]);
  //     }
  //     if (key.pageNumber === 4) {
  //       expect(updatedSearchRow.get(key)).toEqual([17, 18, 19, 20, 21]);
  //     }
  //     if (key.pageNumber === 5) {
  //       expect(updatedSearchRow.get(key)).toEqual([22]);
  //     }
  //   }
  // });

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
    console.log('without last page', updatedSearchRow);
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
    }
    expect(updatedSearchRow.size).toEqual(3);
  });
});
