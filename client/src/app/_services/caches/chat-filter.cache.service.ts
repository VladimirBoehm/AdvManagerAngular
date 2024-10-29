import { Injectable, signal } from '@angular/core';
import { PaginationParams } from '../../_models/paginationParams';
import { ChatFilter } from '../../_models/chatFilter';

@Injectable({
  providedIn: 'root',
})
export class ChatFilterCacheService {
  private chatFilterCache = signal<ChatFilter[]>([]);

  getCache(paginationParams?: PaginationParams): ChatFilter[] | undefined {
    console.log('cache requested');

    if (!paginationParams) {
      return this.chatFilterCache();
    }

    const { pageNumber, pageSize, sortOption } = paginationParams;
    let filteredList = [...this.chatFilterCache()];

    if (sortOption.searchValue) {
      if (sortOption.searchType === 'title') {
        filteredList = filteredList.filter((item) =>
          item.value.includes(sortOption.searchValue!)
        );
      } else if (sortOption.searchType === 'date' && sortOption.dateRange) {
        const { start, end } = sortOption.dateRange;
        filteredList = filteredList.filter(
          (item) => item.created >= start && item.created <= end
        );
      }
    }
    filteredList.sort((a, b) => {
      let compareResult = 0;
      if (sortOption.field === 'date') {
        compareResult = a.created.getTime() - b.created.getTime(); 
      } else if (sortOption.field === 'title') {
        compareResult = a.value.localeCompare(b.value);
      }
      return sortOption.order === 'asc' ? compareResult : -compareResult;
    });

    const startIndex = pageNumber  * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredList.slice(startIndex, endIndex);
  }

  setCache(chatFilters: ChatFilter[]) {
    console.log('Cache is set');
    
    const chatFiltersWithDates = chatFilters.map((cf) => ({
      ...cf,
      created: new Date(cf.created),
    }));
    this.chatFilterCache.set(chatFiltersWithDates);
  }

  updateId(id: number) {
    const result = this.chatFilterCache();
    const updatedItems = result.map((item) =>
      item.id === 0 ? { ...item, id } : item
    );
    this.chatFilterCache.set(updatedItems);
  }

  addItem(chatFilter: ChatFilter) {
    const newChatFilter = {
      ...chatFilter,
      created: new Date(chatFilter.created),
    };
    const newItems = [newChatFilter, ...this.chatFilterCache()];
    this.chatFilterCache.set(newItems);
  }

  deleteItem(id: number) {
    const items = this.chatFilterCache();
    const result = items.filter((item) => item.id !== id);
    this.chatFilterCache.set(result);
  }
}
