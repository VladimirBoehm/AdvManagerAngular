import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { ChatFilter } from '../_models/chatFilter';
import { PaginatedResult } from '../_models/pagination';
import { tap } from 'rxjs';
import { PaginationParams } from '../_models/paginationParams';
import { setPaginationHeaders } from './paginationHelper';
import { SortOption } from '../_models/sortOption';
import { ChatFilterCacheService } from './caches/chat-filter.cache.service';
import { DEFAULT_SORT_OPTION } from '../_framework/constants/defaultSortOption';

@Injectable({
  providedIn: 'root',
})
export class ChatFilterService {
  private http = inject(HttpClient);
  private chatFilterCacheService = inject(ChatFilterCacheService);
  private baseUrl = environment.apiUrl;

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
        searchValue: '',
      },
    };
  }

  chatFiltersPaginatedResult = signal<PaginatedResult<ChatFilter>>(
    new PaginatedResult<ChatFilter>()
  );

  isLoaded = signal<boolean>(false);

  getCurrentSortOptions() {
    return this.paginationParams()?.sortOption;
  }

  private updatePaginationParams(
    pageSize?: number,
    pageNumber?: number,
    sortOption?: SortOption
  ) {
    const updatedParams: PaginationParams = {
      ...this.paginationParams,
      pageSize:
        pageSize !== undefined ? pageSize : this.paginationParams().pageSize,
      pageNumber:
        pageNumber !== undefined
          ? pageNumber
          : this.paginationParams().pageNumber,
      sortOption:
        sortOption !== undefined
          ? sortOption
          : this.paginationParams().sortOption,
    };
    this.paginationParams.set(updatedParams);
  }

  save(chatFilter: ChatFilter) {
    chatFilter.id = 0;

    const currentResult = this.chatFiltersPaginatedResult();
    var updatedResult = currentResult.addItem(chatFilter);
    this.chatFiltersPaginatedResult.set(updatedResult);

    // Proceed with the HTTP POST request
    this.http
      .post<ChatFilter>(this.baseUrl + 'chatFilter', chatFilter)
      .subscribe({
        next: (newChatFilter: ChatFilter) => {
          const result = this.chatFiltersPaginatedResult();
          const updatedResult = result.setItemId(newChatFilter.id);
          if (updatedResult) this.chatFiltersPaginatedResult.set(updatedResult);
        },
        error: (err) => {
          console.error('Error when saving chatFilters:', err);
        },
      });
  }

  getAll(sortOption?: SortOption) {
    this.updatePaginationParams(undefined, 0, sortOption);
    const params = setPaginationHeaders(this.paginationParams());
    const cache = this.chatFilterCacheService.getCache(this.paginationParams());

    if (!cache) {
      this.http
        .get<ChatFilter[]>(this.baseUrl + 'chatFilter', {
          observe: 'response',
          params,
        })
        .pipe(
          tap((response) => {
            this.handleResponse(response);

            console.log(
              'Loaded from db:' +
                JSON.stringify(this.chatFiltersPaginatedResult())
            );
            this.isLoaded.set(true);
          })
        )
        .subscribe({
          error: (err) => {
            console.error('Error when loading chatFilters:', err);
          },
        });
    } else {
      this.chatFiltersPaginatedResult.set(cache);
      console.log(
        'Cache taken: ' + JSON.stringify(this.chatFiltersPaginatedResult())
      );
    }
  }

  delete(id: number) {
    const currentResult = this.chatFiltersPaginatedResult();
    const updatedResult = currentResult.deleteItemById(id);
    if (updatedResult) this.chatFiltersPaginatedResult.set(updatedResult);
    this.chatFilterCacheService.deleteItem(id);

    return this.http.delete(this.baseUrl + `chatFilter/${id}`).subscribe({
      error: (err) => {
        console.error('Error when deleting chatFilter:', err);
      },
    });
  }

  private handleResponse(response: HttpResponse<ChatFilter[]>) {
    const result = new PaginatedResult<ChatFilter>();
    result.items = response.body as ChatFilter[];
    result.pagination = JSON.parse(response.headers.get('Pagination')!);
    console.log('Loaded from DB');
    this.chatFiltersPaginatedResult.set(result);
    this.chatFilterCacheService.setCache(result);
    return result;
  }
}
