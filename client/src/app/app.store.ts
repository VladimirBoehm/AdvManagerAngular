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
import { Advertisement } from './_models/advertisement';

const defaultPageSize = 6;
const chatFilterPageSize = 999;

type appState = {
  user: User | null;
  pendingValidationAdvertisementsCount: number;
  areChatFiltersLoaded: boolean;
  chatFilterPaginationParams: PaginationParams;
  allHistoryPaginationParams: PaginationParams;
  privateHistoryPaginationParams: PaginationParams;
  pendingPublicationPaginationParams: PaginationParams;
  pendingValidationPaginationParams: PaginationParams;
  myAdvertisementsPaginationParams: PaginationParams;
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
  areChatFiltersLoaded: false,
  chatFilterPaginationParams: {
    totalItems: 0,
    pageNumber: 0,
    pageSize: chatFilterPageSize,
    sortOption: getDefaultSortOptions(),
  },
  allHistoryPaginationParams: {
    totalItems: 0,
    pageNumber: 0,
    pageSize: defaultPageSize,
    sortOption: getDefaultSortOptions(),
  },
  privateHistoryPaginationParams: {
    totalItems: 0,
    pageNumber: 0,
    pageSize: defaultPageSize,
    sortOption: getDefaultSortOptions(),
  },
  pendingPublicationPaginationParams: {
    totalItems: 0,
    pageNumber: 0,
    pageSize: defaultPageSize,
    sortOption: { ...getDefaultSortOptions(), field: 'date', order: 'asc' },
  },
  myAdvertisementsPaginationParams: {
    totalItems: 0,
    pageNumber: 0,
    pageSize: defaultPageSize,
    sortOption: getDefaultSortOptions(),
  },
  pendingValidationPaginationParams: {
    totalItems: 0,
    pageNumber: 0,
    pageSize: defaultPageSize,
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
const allHistoryConfig = entityConfig({
  entity: type<Advertisement>(),
  collection: 'allHistory',
});
const privateHistoryConfig = entityConfig({
  entity: type<Advertisement>(),
  collection: 'privateHistory',
});
const myAdvertisementsConfig = entityConfig({
  entity: type<Advertisement>(),
  collection: 'myAdvertisements',
});
const pendingPublicationAdvertisementsConfig = entityConfig({
  entity: type<Advertisement>(),
  collection: 'pendingPublicationAdvertisements',
});
const pendingValidationAdvertisementsConfig = entityConfig({
  entity: type<Advertisement>(),
  collection: 'pendingValidationAdvertisements',
});

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities(chatFilterConfig),
  withEntities(allHistoryConfig),
  withEntities(privateHistoryConfig),
  withEntities(myAdvertisementsConfig),
  withEntities(pendingPublicationAdvertisementsConfig),
  withEntities(pendingValidationAdvertisementsConfig),
  withLogger('appState'),
  withComputed(
    ({
      chatFilterEntities,
      chatFilterPaginationParams,
      allHistoryEntities,
      allHistoryPaginationParams,
      pendingValidationPaginationParams,
      pendingValidationAdvertisementsEntities,
      pendingPublicationPaginationParams,
      pendingPublicationAdvertisementsEntities,
      myAdvertisementsPaginationParams,
      myAdvertisementsEntities,
      privateHistoryPaginationParams,
      privateHistoryEntities,
    }) => ({
      sortedPrivateHistory: computed(() => {
        const startIndex =
          privateHistoryPaginationParams().pageNumber *
          privateHistoryPaginationParams().pageSize;
        const endIndex = startIndex + privateHistoryPaginationParams().pageSize;
        return privateHistoryEntities().slice(startIndex, endIndex);
      }),

      sortedMyAdvertisements: computed(() => {
        const startIndex =
          myAdvertisementsPaginationParams().pageNumber *
          myAdvertisementsPaginationParams().pageSize;
        const endIndex =
          startIndex + myAdvertisementsPaginationParams().pageSize;
        return myAdvertisementsEntities().slice(startIndex, endIndex);
      }),

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
            const dateRange =
              chatFilterPaginationParams()?.sortOption.dateRange;
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
            compareResult =
              new Date(a.created).getTime() - new Date(b.created).getTime();
          } else if (
            chatFilterPaginationParams().sortOption.field === 'title'
          ) {
            compareResult = a.value.localeCompare(b.value);
          }
          return chatFilterPaginationParams().sortOption.order === 'asc'
            ? compareResult
            : -compareResult;
        });

        const startIndex =
          chatFilterPaginationParams().pageNumber *
          chatFilterPaginationParams().pageSize;
        const endIndex = startIndex + chatFilterPaginationParams().pageSize;
        return filteredList.slice(startIndex, endIndex);
      }),
      sortedPendingValidationAdvertisements: computed(() => {
        const startIndex =
          pendingValidationPaginationParams().pageNumber *
          pendingValidationPaginationParams().pageSize;
        const endIndex =
          startIndex + pendingValidationPaginationParams().pageSize;
        return pendingValidationAdvertisementsEntities().slice(
          startIndex,
          endIndex
        );
      }),
      sortedPendingPublicationAdvertisements: computed(() => {
        const startIndex =
          pendingPublicationPaginationParams().pageNumber *
          pendingPublicationPaginationParams().pageSize;
        const endIndex =
          startIndex + pendingPublicationPaginationParams().pageSize;
        return pendingPublicationAdvertisementsEntities().slice(
          startIndex,
          endIndex
        );
      }),
      sortedAllHistory: computed(() => {
        const startIndex =
          allHistoryPaginationParams().pageNumber *
          allHistoryPaginationParams().pageSize;
        const endIndex = startIndex + allHistoryPaginationParams().pageSize;
        return allHistoryEntities().slice(startIndex, endIndex);
      }),
    })
  ),
  withMethods(
    (
      store,
      accountService = inject(AccountService),
      advertisementService = inject(AdvertisementService),
      chatFilterService = inject(ChatFilterService)
    ) => ({
      async getAdvertisementPrivateHistory(pageNumber?: number) {
        if (pageNumber !== undefined) {
          patchState(store, {
            privateHistoryPaginationParams: {
              ...store.privateHistoryPaginationParams(),
              pageNumber,
            },
          });
        }
        const response = await lastValueFrom(
          advertisementService.getAdvertisementPrivateHistory(
            store.privateHistoryPaginationParams()
          )
        );
        const advertisements = response.body as Advertisement[];
        const paginatedResponse = JSON.parse(
          response.headers.get('Pagination')!
        );
        patchState(store, addEntities(advertisements, privateHistoryConfig));
        patchState(store, {
          privateHistoryPaginationParams: {
            ...store.privateHistoryPaginationParams(),
            totalItems: paginatedResponse.totalItems,
          },
        });
        console.log('>>> AppStore: privateHistory loaded');
      },
      async getMyAdvertisements(pageNumber?: number) {
        if (pageNumber !== undefined) {
          patchState(store, {
            myAdvertisementsPaginationParams: {
              ...store.myAdvertisementsPaginationParams(),
              pageNumber,
            },
          });
        }
        const response = await lastValueFrom(
          advertisementService.getMyAdvertisements(
            store.myAdvertisementsPaginationParams()
          )
        );
        const advertisements = response.body as Advertisement[];
        const paginatedResponse = JSON.parse(
          response.headers.get('Pagination')!
        );
        patchState(store, addEntities(advertisements, myAdvertisementsConfig));
        patchState(store, {
          myAdvertisementsPaginationParams: {
            ...store.myAdvertisementsPaginationParams(),
            totalItems: paginatedResponse.totalItems,
          },
        });
        console.log('>>> AppStore: myAdvertisements loaded');
      },

      async getPendingPublicationAdvertisements(pageNumber?: number) {
        if (pageNumber !== undefined) {
          patchState(store, {
            pendingPublicationPaginationParams: {
              ...store.pendingPublicationPaginationParams(),
              pageNumber,
            },
          });
        }
        const response = await lastValueFrom(
          advertisementService.getPendingPublicationAdvertisements(
            store.pendingPublicationPaginationParams()
          )
        );
        const advertisements = response.body as Advertisement[];
        const paginatedResponse = JSON.parse(
          response.headers.get('Pagination')!
        );
        patchState(
          store,
          addEntities(advertisements, pendingPublicationAdvertisementsConfig)
        );
        patchState(store, {
          pendingPublicationPaginationParams: {
            ...store.pendingPublicationPaginationParams(),
            totalItems: paginatedResponse.totalItems,
          },
        });
        console.log('>>> AppStore: pendingPublicationAdvertisements loaded');
      },

      async getPendingValidationAdvertisements(pageNumber?: number) {
        if (pageNumber !== undefined) {
          patchState(store, {
            pendingValidationPaginationParams: {
              ...store.pendingValidationPaginationParams(),
              pageNumber,
            },
          });
        }
        const response = await lastValueFrom(
          advertisementService.getPendingValidationAdvertisements(
            store.pendingValidationPaginationParams()
          )
        );
        const advertisements = response.body as Advertisement[];
        const paginatedResponse = JSON.parse(
          response.headers.get('Pagination')!
        );
        patchState(
          store,
          addEntities(advertisements, pendingValidationAdvertisementsConfig)
        );
        patchState(store, {
          pendingValidationPaginationParams: {
            ...store.pendingValidationPaginationParams(),
            totalItems: paginatedResponse.totalItems,
          },
        });
        console.log('>>> AppStore: pendingValidationAdvertisements loaded');
      },
      async getAdvertisementAllHistory(pageNumber?: number) {
        if (pageNumber !== undefined) {
          patchState(store, {
            allHistoryPaginationParams: {
              ...store.allHistoryPaginationParams(),
              pageNumber,
            },
          });
        }
        const response = await lastValueFrom(
          advertisementService.getAdvertisementAllHistory(
            store.allHistoryPaginationParams()
          )
        );
        const advertisements = response.body as Advertisement[];
        const paginatedResponse = JSON.parse(
          response.headers.get('Pagination')!
        );

        patchState(store, addEntities(advertisements, allHistoryConfig));
        patchState(store, {
          allHistoryPaginationParams: {
            ...store.allHistoryPaginationParams(),
            totalItems: paginatedResponse.totalItems,
          },
        });

        console.log('>>> AppStore: allHistory loaded');
      },
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
        if (store.areChatFiltersLoaded() === false) {
          const chatFilters = await lastValueFrom(chatFilterService.getAll());
          const chatFiltersWithDates = chatFilters.map((cf) => ({
            ...cf,
            created: new Date(cf.created),
          }));
          patchState(
            store,
            addEntities(chatFiltersWithDates, chatFilterConfig)
          );
          patchState(store, { areChatFiltersLoaded: true });
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
