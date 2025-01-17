import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { ChatFilter } from '../_models/chatFilter';
import { PaginationParams } from '../_models/paginationParams';
import { SortOption } from '../_models/sortOption';
import { ChatFilterCacheService } from './caches/chat-filter.cache.service';
import { DEFAULT_SORT_OPTION } from '../_framework/constants/defaultSortOption';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatFilterService {
  private http = inject(HttpClient);
  private chatFilterCacheService = inject(ChatFilterCacheService);
  private baseUrl = environment.apiUrl;

  private chatFiltersSubject = new BehaviorSubject<ChatFilter[]>([]);
  readonly chatFilters$ = this.chatFiltersSubject.asObservable();

  isLoaded = signal<boolean>(false);

  public paginationParams = signal<PaginationParams>(
    this.getDefaultPaginationParams()
  );

  resetPaginationParams() {
    this.paginationParams.set(this.getDefaultPaginationParams());
  }

  private getDefaultPaginationParams(): PaginationParams {
    return {
      pageNumber: 0,
      pageSize: 30,
      sortOption: {
        field: DEFAULT_SORT_OPTION.field,
        order: DEFAULT_SORT_OPTION.order,
        searchType: DEFAULT_SORT_OPTION.searchType,
        searchValue: DEFAULT_SORT_OPTION.searchValue,
      },
    };
  }

  getCurrentSortOptions() {
    return this.paginationParams().sortOption;
  }

  private updatePaginationParams(
    pageSize?: number,
    pageNumber?: number,
    sortOption?: SortOption
  ) {
    const currentParams = this.paginationParams();
    const updatedParams: PaginationParams = {
      ...currentParams,
      pageSize: pageSize !== undefined ? pageSize : currentParams.pageSize,
      pageNumber:
        pageNumber !== undefined ? pageNumber : currentParams.pageNumber,
      sortOption:
        sortOption !== undefined ? sortOption : currentParams.sortOption,
    };
    this.paginationParams.set(updatedParams);
  }

  save(chatFilter: ChatFilter) {
    chatFilter.id = 0;
    this.chatFilterCacheService.addItem(chatFilter);

    this.http
      .post<ChatFilter>(this.baseUrl + 'chatFilter', chatFilter)
      .subscribe({
        next: (newChatFilter: ChatFilter) => {
          this.chatFilterCacheService.updateId(newChatFilter.id);
          const cache = this.chatFilterCacheService.getCache(
            this.paginationParams()
          );
          if (cache) this.chatFiltersSubject.next(cache);
        },
        error: (err) => {
          console.error('Error when saving chatFilters:', err);
        },
      });
  }

  getAll(sortOption?: SortOption) {
    this.updatePaginationParams(undefined, 0, sortOption);

    if (!this.isLoaded()) {
      this.http.get<ChatFilter[]>(this.baseUrl + 'chatFilter', {}).subscribe({
        next: (result) => {
          console.log('Loaded from DB');

          this.chatFiltersSubject.next(result);

          const chatFiltersWithDates = result.map((cf) => ({
            ...cf,
            created: new Date(cf.created),
          }));
          this.chatFilterCacheService.setCache(chatFiltersWithDates);
          this.chatFiltersSubject.next(chatFiltersWithDates);
          this.isLoaded.set(true);
        },
        error: (err) => {
          console.error('Error when loading chatFilters:', err);
        },
      });
    } else {
      const cache = this.chatFilterCacheService.getCache(
        this.paginationParams()
      );
      if (cache) this.chatFiltersSubject.next(cache);
      console.log('Cache taken');
    }
  }

  getAll2(sortOption?: SortOption) {
    return this.http.get<ChatFilter[]>(this.baseUrl + 'chatFilter', {});
    //this.updatePaginationParams(undefined, 0, sortOption);

    // if (!this.isLoaded()) {
    //   this.http.get<ChatFilter[]>(this.baseUrl + 'chatFilter', {}).subscribe({
    //     next: (result) => {
    //       console.log('Loaded from DB');

    //      // this.chatFiltersSubject.next(result);

    //       const chatFiltersWithDates = result.map((cf) => ({
    //         ...cf,
    //         created: new Date(cf.created),
    //       }));
    //       this.chatFilterCacheService.setCache(chatFiltersWithDates);
    //       this.chatFiltersSubject.next(chatFiltersWithDates);
    //      // this.isLoaded.set(true);
    //     },
    //     error: (err) => {
    //       console.error('Error when loading chatFilters:', err);
    //     },
    //   });
    // } else {
    //   const cache = this.chatFilterCacheService.getCache(
    //     this.paginationParams()
    //   );
    //   if (cache) this.chatFiltersSubject.next(cache);
    //   console.log('Cache taken');
    // }
  } 

  delete(id: number) {
    this.chatFilterCacheService.deleteItem(id);
    const cache = this.chatFilterCacheService.getCache(this.paginationParams());
    if (cache) this.chatFiltersSubject.next(cache);
    return this.http.delete(this.baseUrl + `chatFilter/${id}`).subscribe({
      error: (err) => {
        console.error('Error when deleting chatFilter:', err);
      },
    });
  }
}
