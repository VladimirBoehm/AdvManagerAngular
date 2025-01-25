import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  type,
  withMethods,
  withState,
  withComputed,
} from '@ngrx/signals';
import { lastValueFrom } from 'rxjs';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';
import { AdvertisementService } from '../_services/advertisement.service';
import {
  addEntities,
  addEntity,
  updateEntity,
  entityConfig,
  removeEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { ChatFilter } from '../_models/chatFilter';
import { ChatFilterService } from '../_services/chat-filter.service';
import { PaginationParams } from '../_entities/paginationParams';
import { SortOption } from '../_entities/sortOption';
import { Advertisement } from '../_models/advertisement';
import { HashInfo } from '../_entities/hashInfo';
import { AppListType } from '../_framework/constants/advListType';
import {
  arePaginationParamsEqual,
  getDefaultSortOptions,
  getHashKey,
  getPaginatedResponse,
  getSelectedAdvertisement,
  getUser,
  withLogger,
} from './app.store.helper';

const defaultPageSize = 6;
const chatFilterPageSize = 999;

type appState = {
  user: User | null;
  selectedAdvertisement: Advertisement | null;

  areChatFiltersLoaded: boolean;
  chatFilterPaginationParams: PaginationParams;

  allHistoryPaginationParams: PaginationParams;
  allHistoryHashInfo: Map<string, HashInfo>;

  privateHistoryPaginationParams: PaginationParams;
  privateHistoryHashInfo: Map<string, HashInfo>;

  pendingPublicationPaginationParams: PaginationParams;
  pendingPublicationHashInfo: Map<string, HashInfo>;
  pendingValidationHashInfo2: Map<PaginationParams, number[]>;

  pendingValidationAdvertisementsCount: number;
  pendingValidationPaginationParams: PaginationParams;
  pendingValidationHashInfo: Map<string, HashInfo>;

  myAdvertisementsPaginationParams: PaginationParams;
  myAdvertisementsHashInfo: Map<PaginationParams, number[]>;
};

const initialState: appState = {
  user: getUser(),
  selectedAdvertisement: getSelectedAdvertisement(),
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
  allHistoryHashInfo: new Map<string, HashInfo>(),
  privateHistoryPaginationParams: {
    totalItems: 0,
    pageNumber: 0,
    pageSize: defaultPageSize,
    sortOption: getDefaultSortOptions(),
  },
  privateHistoryHashInfo: new Map<string, HashInfo>(),
  pendingPublicationPaginationParams: {
    totalItems: 0,
    pageNumber: 0,
    pageSize: defaultPageSize,
    sortOption: { ...getDefaultSortOptions(), field: 'date', order: 'asc' },
  },
  pendingPublicationHashInfo: new Map<string, HashInfo>(),
  pendingValidationPaginationParams: {
    totalItems: 0,
    pageNumber: 0,
    pageSize: defaultPageSize,
    sortOption: getDefaultSortOptions(),
  },
  pendingValidationHashInfo: new Map<string, HashInfo>(),
  pendingValidationHashInfo2: new Map<PaginationParams, number[]>(),
  myAdvertisementsPaginationParams: {
    totalItems: 0,
    pageNumber: 0,
    pageSize: defaultPageSize,
    sortOption: getDefaultSortOptions(),
  },
  myAdvertisementsHashInfo: new Map<PaginationParams, number[]>(),
};

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
const pendingPublicationConfig = entityConfig({
  entity: type<Advertisement>(),
  collection: 'pendingPublicationAdvertisements',
});
const pendingValidationConfig = entityConfig({
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
  withEntities(pendingPublicationConfig),
  withEntities(pendingValidationConfig),
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
      allHistoryHashInfo,
      privateHistoryHashInfo,
      pendingPublicationHashInfo,
      pendingValidationHashInfo2,
    }) => ({
      sortedAllHistory: computed(() => {
        const searchHashKey = getHashKey(allHistoryPaginationParams());
        if (allHistoryHashInfo().has(searchHashKey)) {
          const hashInfo = allHistoryHashInfo().get(searchHashKey);
          if (!hashInfo?.ids) return [];
          return hashInfo?.ids.map((id) => {
            return allHistoryEntities().find((ad) => ad.id === id)!;
          });
        } else {
          const startIndex =
            allHistoryPaginationParams().pageNumber *
            allHistoryPaginationParams().pageSize;
          const endIndex = startIndex + allHistoryPaginationParams().pageSize;
          return allHistoryEntities().slice(startIndex, endIndex);
        }
      }),
      sortedPrivateHistory: computed(() => {
        const searchHashKey = getHashKey(privateHistoryPaginationParams());
        if (privateHistoryHashInfo().has(searchHashKey)) {
          const hashInfo = privateHistoryHashInfo().get(searchHashKey);
          if (!hashInfo?.ids) return [];
          return hashInfo?.ids.map((id) => {
            return privateHistoryEntities().find((ad) => ad.id === id)!;
          });
        } else {
          const startIndex =
            privateHistoryPaginationParams().pageNumber *
            privateHistoryPaginationParams().pageSize;
          const endIndex =
            startIndex + privateHistoryPaginationParams().pageSize;
          return privateHistoryEntities().slice(startIndex, endIndex);
        }
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
        for (const key of pendingValidationHashInfo2().keys()) {
          if (
            arePaginationParamsEqual(
              key,
              pendingValidationPaginationParams(),
              false
            )
          ) {
            return (
              pendingValidationHashInfo2()
                .get(key)
                ?.map(
                  (id) =>
                    pendingValidationAdvertisementsEntities().find(
                      (ad) => ad.id === id
                    )!
                ) ?? []
            );
          }
        }
        return [];
      }),
      sortedPendingPublicationAdvertisements: computed(() => {
        const searchHashKey = getHashKey(pendingPublicationPaginationParams());
        if (pendingPublicationHashInfo().has(searchHashKey)) {
          const hashInfo = pendingPublicationHashInfo().get(searchHashKey);
          if (!hashInfo?.ids) return [];
          return hashInfo?.ids.map((id) => {
            return pendingPublicationAdvertisementsEntities().find(
              (ad) => ad.id === id
            )!;
          });
        } else {
          const startIndex =
            pendingPublicationPaginationParams().pageNumber *
            pendingPublicationPaginationParams().pageSize;
          const endIndex =
            startIndex + pendingPublicationPaginationParams().pageSize;
          return pendingPublicationAdvertisementsEntities().slice(
            startIndex,
            endIndex
          );
        }
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
      setSelectedAdvertisement(advertisement: Advertisement) {
        patchState(store, { selectedAdvertisement: advertisement });
        localStorage.setItem(
          'selectedAdvertisement',
          JSON.stringify(advertisement)
        );
        console.log('>>> AppStore: selectedAdvertisement set');
      },
      async getAdvertisementPrivateHistory(
        pageNumber?: number,
        sortOption?: SortOption
      ) {
        if (pageNumber !== undefined) {
          patchState(store, {
            privateHistoryPaginationParams: {
              ...store.privateHistoryPaginationParams(),
              pageNumber,
            },
          });
        }
        if (sortOption) {
          patchState(store, {
            privateHistoryPaginationParams: {
              ...store.privateHistoryPaginationParams(),
              sortOption,
            },
          });
        }
        const searchHashKey = getHashKey(
          store.privateHistoryPaginationParams()
        );
        if (store.privateHistoryHashInfo().has(searchHashKey)) {
          const hashInfo = store.privateHistoryHashInfo().get(searchHashKey);
          patchState(store, {
            privateHistoryPaginationParams: {
              ...store.privateHistoryPaginationParams(),
              totalItems: hashInfo?.totalItems ?? 0,
            },
          });
          console.log('>>> AppStore: privateHistory already loaded');
          return;
        }

        const response = await lastValueFrom(
          advertisementService.getAdvertisementPrivateHistory(
            store.privateHistoryPaginationParams()
          )
        );

        const advertisements = response.body as Advertisement[];
        const paginatedResponse = getPaginatedResponse(response);

        patchState(store, addEntities(advertisements, privateHistoryConfig));
        patchState(store, {
          privateHistoryPaginationParams: {
            ...store.privateHistoryPaginationParams(),
            totalItems: paginatedResponse.totalItems,
          },
        });
        patchState(store, {
          privateHistoryHashInfo: store
            .privateHistoryHashInfo()
            .set(getHashKey(store.privateHistoryPaginationParams()), {
              totalItems: paginatedResponse.totalItems,
              ids: advertisements.map((ad) => ad.id),
            }),
        });
        console.log('>>> AppStore: privateHistory loaded');
      },
      async getAdvertisementAllHistory(
        pageNumber?: number,
        sortOption?: SortOption
      ) {
        if (pageNumber !== undefined) {
          patchState(store, {
            allHistoryPaginationParams: {
              ...store.allHistoryPaginationParams(),
              pageNumber,
            },
          });
        }
        if (sortOption) {
          patchState(store, {
            allHistoryPaginationParams: {
              ...store.allHistoryPaginationParams(),
              sortOption,
            },
          });
        }

        const searchHashKey = getHashKey(store.allHistoryPaginationParams());
        if (store.allHistoryHashInfo().has(searchHashKey)) {
          const hashInfo = store.allHistoryHashInfo().get(searchHashKey);
          patchState(store, {
            allHistoryPaginationParams: {
              ...store.allHistoryPaginationParams(),
              totalItems: hashInfo?.totalItems ?? 0,
            },
          });
          console.log('>>> AppStore: allHistory already loaded');
          return;
        }

        const response = await lastValueFrom(
          advertisementService.getAdvertisementAllHistory(
            store.allHistoryPaginationParams()
          )
        );
        const advertisements = response.body as Advertisement[];
        const paginatedResponse = getPaginatedResponse(response);

        patchState(store, addEntities(advertisements, allHistoryConfig));
        patchState(store, {
          allHistoryPaginationParams: {
            ...store.allHistoryPaginationParams(),
            totalItems: paginatedResponse.totalItems,
          },
        });
        patchState(store, {
          allHistoryHashInfo: store
            .allHistoryHashInfo()
            .set(getHashKey(store.allHistoryPaginationParams()), {
              totalItems: paginatedResponse.totalItems,
              ids: advertisements.map((ad) => ad.id),
            }),
        });

        console.log('>>> AppStore: allHistory loaded');
      },
      async getMyAdvertisements(pageNumber?: number, sortOption?: SortOption) {
        if (pageNumber !== undefined) {
          patchState(store, {
            myAdvertisementsPaginationParams: {
              ...store.myAdvertisementsPaginationParams(),
              pageNumber,
            },
          });
        }
        if (sortOption) {
          patchState(store, {
            myAdvertisementsPaginationParams: {
              ...store.myAdvertisementsPaginationParams(),
              sortOption,
            },
          });
        }
        const searchHashKey = getHashKey(
          store.myAdvertisementsPaginationParams()
        );
        // if (store.myAdvertisementsHashInfo().has(searchHashKey)) {
        //   const hashInfo = store.myAdvertisementsHashInfo().get(searchHashKey);
        //   patchState(store, {
        //     myAdvertisementsPaginationParams: {
        //       ...store.myAdvertisementsPaginationParams(),
        //       totalItems: hashInfo?.totalItems ?? 0,
        //     },
        //   });
        //   console.log('>>> AppStore: myAdvertisements already loaded');
        //   return;
        // }

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

        // patchState(store, {
        //   myAdvertisementsHashInfo: store
        //     .myAdvertisementsHashInfo()
        //     .set(getHashKey(store.myAdvertisementsPaginationParams()), {
        //       totalItems: paginatedResponse.totalItems,
        //       ids: advertisements.map((ad) => ad.id),
        //     }),
        // });
        console.log('>>> AppStore: myAdvertisements loaded');
      },
      async getPendingPublicationAdvertisements(
        pageNumber?: number,
        sortOption?: SortOption
      ) {
        if (pageNumber !== undefined) {
          patchState(store, {
            pendingPublicationPaginationParams: {
              ...store.pendingPublicationPaginationParams(),
              pageNumber,
            },
          });
        }
        if (sortOption) {
          patchState(store, {
            pendingPublicationPaginationParams: {
              ...store.pendingPublicationPaginationParams(),
              sortOption,
            },
          });
        }
        const searchHashKey = getHashKey(
          store.pendingPublicationPaginationParams()
        );
        if (store.pendingPublicationHashInfo().has(searchHashKey)) {
          const hashInfo = store
            .pendingPublicationHashInfo()
            .get(searchHashKey);
          patchState(store, {
            pendingPublicationPaginationParams: {
              ...store.pendingPublicationPaginationParams(),
              totalItems: hashInfo?.totalItems ?? 0,
            },
          });
          console.log('>>> AppStore: pendingPublication already loaded');
          return;
        }

        const response = await lastValueFrom(
          advertisementService.getPendingPublicationAdvertisements(
            store.pendingPublicationPaginationParams()
          )
        );
        const advertisements = response.body as Advertisement[];
        const paginatedResponse = getPaginatedResponse(response);
        
        patchState(
          store,
          addEntities(advertisements, pendingPublicationConfig)
        );
        patchState(store, {
          pendingPublicationPaginationParams: {
            ...store.pendingPublicationPaginationParams(),
            totalItems: paginatedResponse.totalItems,
          },
        });

        patchState(store, {
          pendingPublicationHashInfo: store
            .pendingPublicationHashInfo()
            .set(getHashKey(store.pendingPublicationPaginationParams()), {
              totalItems: paginatedResponse.totalItems,
              ids: advertisements.map((ad) => ad.id),
            }),
        });
        console.log('>>> AppStore: pendingPublicationAdvertisements loaded');
      },
      async getPendingValidationAdvertisements(
        pageNumber?: number,
        sortOption?: SortOption
      ) {
        if (pageNumber !== undefined) {
          patchState(store, {
            pendingValidationPaginationParams: {
              ...store.pendingValidationPaginationParams(),
              pageNumber,
            },
          });
        }
        if (sortOption) {
          patchState(store, {
            pendingValidationPaginationParams: {
              ...store.pendingValidationPaginationParams(),
              sortOption: { ...sortOption },
            },
          });
        }

        for (const key of store.pendingValidationHashInfo2().keys()) {
          if (
            arePaginationParamsEqual(
              key,
              store.pendingValidationPaginationParams(),
              false
            )
          ) {
            patchState(store, {
              pendingValidationPaginationParams: {
                ...key,
              },
            });
            console.log('>>> AppStore: pendingValidation already loaded');
            return;
          }
        }

        const response = await lastValueFrom(
          advertisementService.getPendingValidationAdvertisements(
            store.pendingValidationPaginationParams()
          )
        );
        const advertisements = response.body as Advertisement[];
        const paginatedResponse = getPaginatedResponse(response);
        patchState(store, addEntities(advertisements, pendingValidationConfig));

        patchState(store, {
          pendingValidationPaginationParams: {
            ...store.pendingValidationPaginationParams(),
            totalItems: paginatedResponse.totalItems,
          },
        });

        patchState(store, {
          pendingValidationHashInfo2: store.pendingValidationHashInfo2().set(
            store.pendingValidationPaginationParams(),
            advertisements.map((ad) => ad.id)
          ),
        });
        console.log('>>> AppStore: pendingValidationAdvertisements loaded');
      },
      async login() {
        if (!store.user()) {
          const user = await lastValueFrom(accountService.login());
          localStorage.setItem('user', JSON.stringify(user));
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
      async deleteAdvertisement(id: number) {
        await lastValueFrom(advertisementService.delete(id));
        this.deleteAdvertisementFromList(AppListType.PendingPublication, id);
        this.clearHashInfo(AppListType.PendingPublication);
        this.deleteAdvertisementFromList(AppListType.PendingValidation, id);
        this.clearHashInfo(AppListType.PendingValidation);
        this.deleteAdvertisementFromList(AppListType.MyAdvertisements, id);
        this.clearHashInfo(AppListType.MyAdvertisements);

        console.log('>>> AppStore: Advertisement deleted');
      },
      deleteAdvertisementFromList(appListType: AppListType, id: number) {
        switch (appListType) {
          case AppListType.AllHistory:
            patchState(store, removeEntity(id, allHistoryConfig));
            break;
          case AppListType.PrivateHistory:
            patchState(store, removeEntity(id, privateHistoryConfig));
            break;
          case AppListType.PendingPublication:
            patchState(store, removeEntity(id, pendingPublicationConfig));
            break;
          case AppListType.PendingValidation:
            patchState(store, removeEntity(id, pendingValidationConfig));
            break;
          case AppListType.MyAdvertisements:
            patchState(store, removeEntity(id, myAdvertisementsConfig));
            break;
        }
        console.log(
          `>>> AppStore: Advertisement deleted from list ${appListType}`
        );
      },
      updateAdvertisementInAllLists(advertisement: Advertisement) {
        patchState(
          store,
          updateEntity(
            { id: advertisement.id, changes: { ...advertisement } },
            myAdvertisementsConfig
          )
        );
        patchState(
          store,
          updateEntity(
            { id: advertisement.id, changes: { ...advertisement } },
            pendingPublicationConfig
          )
        );
        patchState(
          store,
          updateEntity(
            { id: advertisement.id, changes: { ...advertisement } },
            pendingValidationConfig
          )
        );
        console.log('>>> AppStore: Advertisement updated in all lists');
      },
      async validateAdvertisementAdmin(advertisement: Advertisement) {
        if (!store.user()?.isAdmin) {
          console.error('User is not admin');
          return;
        }

        await lastValueFrom(
          advertisementService.validateAdvertisementAdmin(advertisement)
        );

        this.deleteAdvertisementFromList(
          AppListType.PendingValidation,
          advertisement.id
        );
        this.clearHashInfo(AppListType.PendingValidation);
        this.updateAdvertisementInAllLists(advertisement);
      },
      clearHashInfo(appListType: AppListType) {
        switch (appListType) {
          case AppListType.AllHistory:
            patchState(store, { allHistoryHashInfo: new Map() });
            break;
          case AppListType.PrivateHistory:
            patchState(store, { privateHistoryHashInfo: new Map() });
            break;
          case AppListType.PendingPublication:
            patchState(store, { pendingPublicationHashInfo: new Map() });
            break;
          case AppListType.PendingValidation:
            patchState(store, { pendingValidationHashInfo: new Map() });
            break;
        }
        console.log(`>>> AppStore: HashInfo cleared for ${appListType}`);
      },
    })
  )
);
