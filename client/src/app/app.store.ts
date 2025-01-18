import { computed, effect, inject } from '@angular/core';
import {
  getState,
  patchState,
  signalStore,
  signalStoreFeature,
  type,
  withHooks,
  withMethods,
  withState,
  withComputed,
} from '@ngrx/signals';
import { lastValueFrom } from 'rxjs';
import { User } from './_models/user';
import { AccountService } from './_services/account.service';
import { AdvertisementService } from './_services/advertisement.service';
import {
  addEntities,
  addEntity,
  entityConfig,
  removeEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { ChatFilter } from './_models/chatFilter';
import { ChatFilterService } from './_services/chat-filter.service';
import { PaginationParams } from './_models/paginationParams';
import { DEFAULT_SORT_OPTION } from './_framework/constants/defaultSortOption';
import { SortOption } from './_models/sortOption';

type appState = {
  user: User | null;
  pendingValidationAdvertisementsCount: number;
  chatFilterPaginationParams: PaginationParams;
};
function getDefaultSortOptions(): SortOption {
  return {
    field: DEFAULT_SORT_OPTION.field,
    order: DEFAULT_SORT_OPTION.order,
    searchType: DEFAULT_SORT_OPTION.searchType,
    searchValue: DEFAULT_SORT_OPTION.searchValue,
  };
}
const initialState: appState = {
  user: null,
  pendingValidationAdvertisementsCount: 0,
  chatFilterPaginationParams: {
    pageNumber: 0,
    pageSize: 999,
    sortOption: getDefaultSortOptions(),
  },
};
export function withLogger(name: string) {
  return signalStoreFeature(
    withHooks({
      onInit(store) {
        effect(() => {
          const state = getState(store);
          console.log(`${name} state changed:`, state);
        });
      },
    })
  );
}
const chatFilterConfig = entityConfig({
  entity: type<ChatFilter>(),
  collection: 'chatFilter',
});

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities(chatFilterConfig),
  withLogger('appState'),
  withComputed(({ chatFilterEntities, chatFilterPaginationParams }) => ({
    sortedChatFilters: computed(() => {
      let filteredList = [...chatFilterEntities()];
      if (chatFilterPaginationParams().sortOption.searchType === 'title') {
        filteredList = filteredList.filter((item) =>
          item.value.includes(
            chatFilterPaginationParams().sortOption.searchValue ?? ''
          )
        );
      } else if (
        chatFilterPaginationParams().sortOption.searchType === 'date'
      ) {
        filteredList = filteredList.filter((item) => {
          const dateRange = chatFilterPaginationParams()?.sortOption.dateRange;
          return (
            dateRange &&
            item.created >= dateRange.start &&
            item.created <= dateRange.end
          );
        });
      }
      filteredList.sort((a, b) => {
        let compareResult = 0;
        if (chatFilterPaginationParams().sortOption.field === 'date') {
          compareResult = new Date(a.created).getTime() - new Date(b.created).getTime(); 
        } else if (chatFilterPaginationParams().sortOption.field === 'title') {
          compareResult = a.value.localeCompare(b.value);
        }
        return chatFilterPaginationParams().sortOption.order === 'asc' ? compareResult : -compareResult;
      });
  
      const startIndex = chatFilterPaginationParams().pageNumber  * chatFilterPaginationParams().pageSize;
      const endIndex = startIndex + chatFilterPaginationParams().pageSize;
      return filteredList.slice(startIndex, endIndex);

    }),
  })),
  withMethods(
    (
      store,
      accountService = inject(AccountService),
      advertisementService = inject(AdvertisementService),
      chatFilterService = inject(ChatFilterService)
    ) => ({
      async login() {
        if (!store.user()) {
          const user = await lastValueFrom(accountService.login());
          patchState(store, { user });
          console.log('>>> AppStore: user loaded');
        }
      },
      async getPendingValidationAdvertisementsCount() {
        if (store.user()?.isAdmin) {
          const pendingCounter = await lastValueFrom(
            advertisementService.getPendingValidationAdvertisementsCount()
          );
          patchState(store, {
            pendingValidationAdvertisementsCount: pendingCounter,
          });
          console.log(
            '>>> AppStore: pendingValidationAdvertisementsCount loaded'
          );
        }
      },
      async loadChatFilters() {
        if (store.chatFilterEntities().length === 0) {
          const chatFilters = await lastValueFrom(chatFilterService.getAll());
          const chatFiltersWithDates = chatFilters.map((cf) => ({
            ...cf,
            created: new Date(cf.created),
          }));
          patchState(
            store,
            addEntities(chatFiltersWithDates, chatFilterConfig)
          );
          console.log('>>> AppStore: chatFilters loaded');
        }
      },
      async updateChatFilterPaginationParams(params: PaginationParams) {
        patchState(store, { chatFilterPaginationParams: params });
        console.log('>>> AppStore: PaginationParams updated');
      },
      async resetChatFilterPaginationParams() {
        patchState(store, {
          chatFilterPaginationParams: {
            ...store.chatFilterPaginationParams(),
            sortOption: getDefaultSortOptions(),
          },
        });
        console.log('>>> AppStore: PaginationParams reset');
      },
      async addChatFilter(chatFilter: ChatFilter) {
        const chatFilterFromServer = await lastValueFrom(
          chatFilterService.save(chatFilter)
        );
        patchState(store, addEntity(chatFilterFromServer, chatFilterConfig));
        console.log('>>> AppStore: ChatFilter saved');
      },
      async deleteChatFilter(chatFilter: ChatFilter) {
        lastValueFrom(chatFilterService.delete(chatFilter.id));
        patchState(store, removeEntity(chatFilter.id, chatFilterConfig));
        console.log('>>> AppStore: ChatFilter deleted');
      },
    })
  )
);
