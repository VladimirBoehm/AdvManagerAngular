import { deleteFromCache } from './app.store.helper';

type HashInfo = {
  totalItems: number;
  ids: number[];
};

describe('deleteFromCache', () => {
  let hashInfo: Map<string, HashInfo>;

  beforeEach(() => {
    hashInfo = new Map<string, HashInfo>([
      ['key1', { totalItems: 10, ids: [1, 2, 3] }],
      ['key2', { totalItems: 20, ids: [4, 5, 6] }],
      ['key3', { totalItems: 30, ids: [7, 8, 9] }]
    ]);
  });

//   it('should find keys containing the id and remove the id from ids array', () => {
//     deleteFromCache(5, hashInfo);

//     expect(hashInfo.get('key2')?.ids).toEqual([4, 6]);
//   });

//   it('should not modify keys that do not contain the id', () => {
//     deleteFromCache(5, hashInfo);

//     expect(hashInfo.get('key1')?.ids).toEqual([1, 2, 3]);
//     expect(hashInfo.get('key3')?.ids).toEqual([7, 8, 9]);
//   });

//   it('should handle case where id is not found in any key', () => {
//     deleteFromCache(10, hashInfo);

//     expect(hashInfo.get('key1')?.ids).toEqual([1, 2, 3]);
//     expect(hashInfo.get('key2')?.ids).toEqual([4, 5, 6]);
//     expect(hashInfo.get('key3')?.ids).toEqual([7, 8, 9]);
//   });
});