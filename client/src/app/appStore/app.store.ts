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
import { AccountService } from '../_services/api.services/account.service';
import { AdvertisementService } from '../_services/api.services/advertisement.service';
import {
  addEntities,
  addEntity,
  updateEntity,
  entityConfig,
  removeEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { withHooks } from '@ngrx/signals';
import { ChatFilter } from '../_models/chatFilter';
import { ChatFilterService } from '../_services/api.services/chat-filter.service';
import { PaginationParams } from '../_entities/paginationParams';
import { SortOption } from '../_entities/sortOption';
import { Advertisement } from '../_models/advertisement';
import { AppListType } from '../_framework/constants/advListType';
import {
  arePaginationParamsEqual,
  deleteFromCache,
  getDefaultPaginationParams,
  getDefaultSortOptions,
  getPaginatedResponse,
  getSelectedAdvertisement,
  getUser,
  withLogger,
} from './app.store.helper';
import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';
import { PublishService } from '../_services/api.services/publish.service';
import { DateHelper } from '../_framework/component/helpers/dateHelper';
import cloneDeep from 'lodash-es/cloneDeep';
import { ManagePublish } from '../_entities/managePublish';
import { SignalRService } from '../_services/signalRService';

const defaultPageSize = 6;
const chatFilterPageSize = 999;

type appState = {
  user: User | null;
  selectedAdvertisement: Advertisement | null;
  areChatFiltersLoaded: boolean;
  chatFilterPaginationParams: PaginationParams;
  allHistoryPaginationParams: PaginationParams;
  allHistoryCacheInfo: Map<PaginationParams, number[]>;
  privateHistoryPaginationParams: PaginationParams;
  privateHistoryCacheInfo: Map<PaginationParams, number[]>;
  pendingPublicationPaginationParams: PaginationParams;
  pendingPublicationCacheInfo: Map<PaginationParams, number[]>;
  pendingValidationCount: number;
  pendingValidationPaginationParams: PaginationParams;
  pendingValidationCacheInfo: Map<PaginationParams, number[]>;
  myAdvertisementsPaginationParams: PaginationParams;
  _pendingValidationCountCache: number;
  arePendingValidationAdvertisementsLoaded: boolean;
  selectedListType: AppListType | undefined;
  isAdvertisementListLoading: boolean;
  areMyAdvertisementsLoaded: boolean;
};

const pendingPublicationDefaultPaginationParams = getDefaultPaginationParams(
  defaultPageSize,
  { ...getDefaultSortOptions(), field: 'date', order: 'asc' }
);

const initialState: appState = {
  user: getUser(),
  selectedListType: undefined,
  selectedAdvertisement: getSelectedAdvertisement(),
  pendingValidationCount: 0,
  areChatFiltersLoaded: false,
  chatFilterPaginationParams: getDefaultPaginationParams(chatFilterPageSize),
  allHistoryPaginationParams: getDefaultPaginationParams(defaultPageSize),
  allHistoryCacheInfo: new Map<PaginationParams, number[]>(),
  privateHistoryPaginationParams: getDefaultPaginationParams(defaultPageSize),
  privateHistoryCacheInfo: new Map<PaginationParams, number[]>(),
  pendingPublicationPaginationParams: pendingPublicationDefaultPaginationParams,
  pendingPublicationCacheInfo: new Map<PaginationParams, number[]>(),
  pendingValidationPaginationParams:
    getDefaultPaginationParams(defaultPageSize),
  pendingValidationCacheInfo: new Map<PaginationParams, number[]>(),
  myAdvertisementsPaginationParams: getDefaultPaginationParams(defaultPageSize),
  _pendingValidationCountCache: 0,
  arePendingValidationAdvertisementsLoaded: false,
  isAdvertisementListLoading: false,
  areMyAdvertisementsLoaded: false,
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
  withHooks({
    async onInit(
      appStore,
      accountService = inject(AccountService),
      signalRService = inject(SignalRService)
    ) {
      const user = await lastValueFrom(accountService.login());
      localStorage.setItem('user', JSON.stringify(user));
      patchState(appStore, { user });
      signalRService.createHubConnection();
    },
  }),
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
      myAdvertisementsEntities,
      privateHistoryPaginationParams,
      privateHistoryEntities,
      allHistoryCacheInfo: allHistoryCacheInfo,
      privateHistoryCacheInfo: privateHistoryCacheInfo,
      pendingValidationCacheInfo: pendingValidationCacheInfo,
      pendingPublicationCacheInfo: pendingPublicationCacheInfo,
    }) => ({
      // ------- sortedAllHistory -------
      sortedAllHistory: computed(() => {
        for (const key of allHistoryCacheInfo().keys()) {
          if (
            arePaginationParamsEqual(key, allHistoryPaginationParams(), false)
          ) {
            return (
              allHistoryCacheInfo()
                .get(key)
                ?.map(
                  (id) => allHistoryEntities().find((ad) => ad.id === id)!
                ) ?? []
            );
          }
        }
        return [];
      }),
      // ------- sortedPrivateHistory -------
      sortedPrivateHistory: computed(() => {
        for (const key of privateHistoryCacheInfo().keys()) {
          if (
            arePaginationParamsEqual(
              key,
              privateHistoryPaginationParams(),
              false
            )
          ) {
            return (
              privateHistoryCacheInfo()
                .get(key)
                ?.map(
                  (id) => privateHistoryEntities().find((ad) => ad.id === id)!
                ) ?? []
            );
          }
        }
        return [];
      }),
      // ------- sortedMyAdvertisements -------
      sortedMyAdvertisements: computed(() => {
        return myAdvertisementsEntities();
      }),
      // ------- sortedChatFilters -------
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
      // ------- sortedPendingValidationAdvertisements -------
      sortedPendingValidationAdvertisements: computed(() => {
        for (const key of pendingValidationCacheInfo().keys()) {
          if (
            arePaginationParamsEqual(
              key,
              pendingValidationPaginationParams(),
              false
            )
          ) {
            return (
              pendingValidationCacheInfo()
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
      // ------- sortedPendingPublicationAdvertisements -------
      sortedPendingPublicationAdvertisements: computed(() => {
        for (const key of pendingPublicationCacheInfo().keys()) {
          if (
            arePaginationParamsEqual(
              key,
              pendingPublicationPaginationParams(),
              false
            )
          ) {
            return (
              pendingPublicationCacheInfo()
                .get(key)
                ?.map(
                  (id) =>
                    pendingPublicationAdvertisementsEntities().find(
                      (ad) => ad.id === id
                    )!
                ) ?? []
            );
          }
        }
        return [];
      }),
    })
  ),
  withMethods(
    (
      appStore,
      accountService = inject(AccountService),
      advertisementService = inject(AdvertisementService),
      chatFilterService = inject(ChatFilterService),
      publishService = inject(PublishService)
    ) => ({
      setSelectedAppListType(appListType: AppListType) {
        patchState(appStore, { selectedListType: appListType });
        console.log('>>> AppStore: selectedListType set to', appListType);
      },
      // ------- updateSelectedAdvertisement -------
      updateSelectedAdvertisement(advertisement: Partial<Advertisement>) {
        const updatedAdvertisement: Advertisement = {
          ...appStore.selectedAdvertisement(),
          ...advertisement,
          id: appStore.selectedAdvertisement()?.id ?? 0,
          userId: appStore.selectedAdvertisement()?.userId ?? 0,
          title:
            advertisement.title ??
            appStore.selectedAdvertisement()?.title ??
            '',
          message:
            advertisement.message ??
            appStore.selectedAdvertisement()?.message ??
            '',
          statusId:
            advertisement.statusId ??
            appStore.selectedAdvertisement()?.statusId ??
            AdvertisementStatus.new,
          updated: DateHelper.getUTCTime(),
        };
        patchState(appStore, { selectedAdvertisement: updatedAdvertisement });
        localStorage.setItem(
          'selectedAdvertisement',
          JSON.stringify(updatedAdvertisement)
        );
        console.log('>>> AppStore: selectedAdvertisement updated');
      },
      // ------- setSelectedAdvertisement -------
      setSelectedAdvertisement(advertisement: Advertisement) {
        patchState(appStore, {
          selectedAdvertisement: cloneDeep(advertisement),
        });
        localStorage.setItem(
          'selectedAdvertisement',
          JSON.stringify(advertisement)
        );
        console.log('>>> AppStore: selectedAdvertisement set');
      },
      // ------- getAdvertisementPrivateHistoryAsync -------
      async getAdvertisementPrivateHistoryAsync(
        pageNumber?: number,
        sortOption?: SortOption
      ) {
        if (pageNumber !== undefined) {
          patchState(appStore, {
            privateHistoryPaginationParams: {
              ...appStore.privateHistoryPaginationParams(),
              pageNumber,
            },
          });
        }
        if (sortOption) {
          patchState(appStore, {
            privateHistoryPaginationParams: {
              ...appStore.privateHistoryPaginationParams(),
              sortOption: cloneDeep(sortOption),
            },
          });
        }

        for (const key of appStore.privateHistoryCacheInfo().keys()) {
          if (
            arePaginationParamsEqual(
              key,
              appStore.privateHistoryPaginationParams(),
              false
            )
          ) {
            patchState(appStore, {
              privateHistoryPaginationParams: cloneDeep(key),
            });
            console.log('>>> AppStore: privateHistory loaded from cache');
            return;
          }
        }

        const response = await lastValueFrom(
          advertisementService.getAdvertisementPrivateHistory(
            appStore.privateHistoryPaginationParams()
          )
        );

        const advertisements = response.body as Advertisement[];
        const paginatedResponse = getPaginatedResponse(response);

        patchState(appStore, addEntities(advertisements, privateHistoryConfig));
        patchState(appStore, {
          privateHistoryPaginationParams: {
            ...cloneDeep(appStore.privateHistoryPaginationParams()),
            totalItems: paginatedResponse.totalItems,
          },
        });

        patchState(appStore, {
          privateHistoryCacheInfo: appStore.privateHistoryCacheInfo().set(
            appStore.privateHistoryPaginationParams(),
            advertisements.map((ad) => ad.id)
          ),
        });
        console.log('>>> AppStore: privateHistory loaded');
      },
      // ------- getAdvertisementAllHistoryAsync -------
      async getAdvertisementAllHistoryAsync(
        pageNumber?: number,
        sortOption?: SortOption
      ) {
        if (pageNumber !== undefined) {
          patchState(appStore, {
            allHistoryPaginationParams: {
              ...cloneDeep(appStore.allHistoryPaginationParams()),
              pageNumber,
            },
          });
        }
        if (sortOption) {
          patchState(appStore, {
            allHistoryPaginationParams: {
              ...cloneDeep(appStore.allHistoryPaginationParams()),
              sortOption: cloneDeep(sortOption),
            },
          });
        }

        for (const key of appStore.allHistoryCacheInfo().keys()) {
          if (
            arePaginationParamsEqual(
              key,
              appStore.allHistoryPaginationParams(),
              false
            )
          ) {
            patchState(appStore, {
              allHistoryPaginationParams: cloneDeep(key),
            });
            console.log('>>> AppStore: allHistory loaded from cache');
            return;
          }
        }

        const response = await lastValueFrom(
          advertisementService.getAdvertisementAllHistory(
            appStore.allHistoryPaginationParams()
          )
        );
        const advertisements = response.body as Advertisement[];
        const paginatedResponse = getPaginatedResponse(response);

        patchState(appStore, addEntities(advertisements, allHistoryConfig));
        patchState(appStore, {
          allHistoryPaginationParams: {
            ...cloneDeep(appStore.allHistoryPaginationParams()),
            totalItems: paginatedResponse.totalItems,
          },
        });
        patchState(appStore, {
          allHistoryCacheInfo: appStore.allHistoryCacheInfo().set(
            appStore.allHistoryPaginationParams(),
            advertisements.map((ad) => ad.id)
          ),
        });
        console.log('>>> AppStore: allHistory loaded');
      },
      // ------- getMyAdvertisementsAsync -------
      async getMyAdvertisementsAsync() {
        if (appStore.areMyAdvertisementsLoaded()) {
          console.log('>>> AppStore: myAdvertisements loaded from cache');
          return;
        }

        patchState(appStore, {
          isAdvertisementListLoading: true,
        });
        const response = await lastValueFrom(
          advertisementService.getMyAdvertisements(
            appStore.myAdvertisementsPaginationParams()
          )
        );
        const advertisements = response.body as Advertisement[];
        const paginatedResponse = getPaginatedResponse(response);

        patchState(
          appStore,
          addEntities(advertisements, myAdvertisementsConfig)
        );
        patchState(appStore, {
          myAdvertisementsPaginationParams: {
            ...cloneDeep(appStore.myAdvertisementsPaginationParams()),
            totalItems: paginatedResponse.totalItems,
          },
        });

        console.log('>>> AppStore: myAdvertisements loaded');
        patchState(appStore, {
          isAdvertisementListLoading: false,
          areMyAdvertisementsLoaded: true,
        });
      },
      // ------- getPendingPublicationAdvertisementsAsync -------
      async getPendingPublicationAdvertisementsAsync(
        pageNumber?: number,
        sortOption?: SortOption
      ) {
        if (pageNumber !== undefined) {
          patchState(appStore, {
            pendingPublicationPaginationParams: {
              ...cloneDeep(appStore.pendingPublicationPaginationParams()),
              pageNumber,
            },
          });
        }
        if (sortOption) {
          patchState(appStore, {
            pendingPublicationPaginationParams: {
              ...cloneDeep(appStore.pendingPublicationPaginationParams()),
              sortOption: cloneDeep(sortOption),
            },
          });
        }

        for (const key of appStore.pendingPublicationCacheInfo().keys()) {
          if (
            arePaginationParamsEqual(
              key,
              appStore.pendingPublicationPaginationParams(),
              false
            )
          ) {
            patchState(appStore, {
              pendingPublicationPaginationParams: cloneDeep(key),
            });
            console.log('>>> AppStore: pendingPublication loaded from cache');
            return;
          }
        }
        patchState(appStore, {
          isAdvertisementListLoading: true,
        });
        const response = await lastValueFrom(
          advertisementService.getPendingPublicationAdvertisements(
            appStore.pendingPublicationPaginationParams()
          )
        );
        const advertisements = response.body as Advertisement[];
        const paginatedResponse = getPaginatedResponse(response);

        patchState(
          appStore,
          addEntities(advertisements, pendingPublicationConfig)
        );
        patchState(appStore, {
          pendingPublicationPaginationParams: {
            ...cloneDeep(appStore.pendingPublicationPaginationParams()),
            totalItems: paginatedResponse.totalItems,
          },
        });

        patchState(appStore, {
          pendingPublicationCacheInfo: appStore
            .pendingPublicationCacheInfo()
            .set(
              appStore.pendingPublicationPaginationParams(),
              advertisements.map((ad) => ad.id)
            ),
        });
        console.log('>>> AppStore: pendingPublicationAdvertisements loaded');
        patchState(appStore, {
          isAdvertisementListLoading: false,
        });
      },
      // ------- getPendingValidationAdvertisementsAsync -------
      async getPendingValidationAdvertisementsAsync(
        pageNumber?: number,
        sortOption?: SortOption
      ) {
        if (pageNumber !== undefined) {
          patchState(appStore, {
            pendingValidationPaginationParams: {
              ...cloneDeep(appStore.pendingValidationPaginationParams()),
              pageNumber,
            },
          });
        }
        if (sortOption) {
          patchState(appStore, {
            pendingValidationPaginationParams: {
              ...cloneDeep(appStore.pendingValidationPaginationParams()),
              sortOption: cloneDeep(sortOption),
            },
          });
        }

        for (const key of appStore.pendingValidationCacheInfo().keys()) {
          if (
            arePaginationParamsEqual(
              key,
              appStore.pendingValidationPaginationParams(),
              false
            )
          ) {
            patchState(appStore, {
              pendingValidationPaginationParams: cloneDeep(key),
            });
            console.log('>>> AppStore: pendingValidation loaded from cache');

            patchState(appStore, {
              arePendingValidationAdvertisementsLoaded: true,
            });

            return;
          }
        }

        patchState(appStore, {
          isAdvertisementListLoading: true,
        });
        const response = await lastValueFrom(
          advertisementService.getPendingValidationAdvertisements(
            appStore.pendingValidationPaginationParams()
          )
        );
        const advertisements = response.body as Advertisement[];
        const paginatedResponse = getPaginatedResponse(response);

        patchState(
          appStore,
          addEntities(advertisements, pendingValidationConfig)
        );

        patchState(appStore, {
          pendingValidationPaginationParams: {
            ...cloneDeep(appStore.pendingValidationPaginationParams()),
            totalItems: paginatedResponse.totalItems,
          },
        });

        patchState(appStore, {
          pendingValidationCacheInfo: appStore.pendingValidationCacheInfo().set(
            appStore.pendingValidationPaginationParams(),
            advertisements.map((ad) => ad.id)
          ),
        });
        console.log('>>> AppStore: pendingValidationAdvertisements loaded');
        patchState(appStore, {
          isAdvertisementListLoading: false,
        });
      },
      // ------- loginAsync -------
      async loginAsync() {
        if (!appStore.user()) {
          const user = await lastValueFrom(accountService.login());
          localStorage.setItem('user', JSON.stringify(user));
          patchState(appStore, { user });
          console.log('>>> AppStore: user loaded');
        }
      },
      // ------- getPendingValidationCountAsync -------
      async getPendingValidationCountAsync() {
        if (appStore.user()?.isAdmin) {
          const pendingCounter = await lastValueFrom(
            advertisementService.getPendingValidationAdvertisementsCount()
          );
          patchState(appStore, {
            pendingValidationCount: pendingCounter,
          });
          //TODO SignalR refactoring
          if (
            pendingCounter !== appStore._pendingValidationCountCache() &&
            pendingCounter !==
              appStore.pendingValidationAdvertisementsEntities().length
          ) {
            this.clearCacheInfo(AppListType.PendingValidation);
          }
          patchState(appStore, {
            _pendingValidationCountCache: pendingCounter,
          });
          console.log(
            '>>> AppStore: pendingValidationAdvertisementsCount loaded'
          );
        }
      },
      // ------- getChatFiltersAsync -------
      async getChatFiltersAsync() {
        if (appStore.areChatFiltersLoaded() === false) {
          const chatFilters = await lastValueFrom(chatFilterService.getAll());
          const chatFiltersWithDates = chatFilters.map((cf) => ({
            ...cf,
            created: new Date(cf.created),
          }));
          patchState(
            appStore,
            addEntities(chatFiltersWithDates, chatFilterConfig)
          );
          patchState(appStore, { areChatFiltersLoaded: true });
          console.log('>>> AppStore: chatFilters loaded');
        }
      },
      // ------- updateChatFilterPaginationParamsAsync -------
      async updateChatFilterPaginationParamsAsync(params: PaginationParams) {
        patchState(appStore, { chatFilterPaginationParams: params });
        console.log('>>> AppStore: PaginationParams updated');
      },
      // ------- createChatFilterAsync -------
      async createChatFilterAsync(chatFilter: ChatFilter) {
        const chatFilterResponse = await lastValueFrom(
          chatFilterService.save(chatFilter)
        );
        patchState(appStore, addEntity(chatFilterResponse, chatFilterConfig));
        console.log('>>> AppStore: ChatFilter saved');
      },
      // ------- deleteChatFilterAsync -------
      async deleteChatFilterAsync(chatFilter: ChatFilter) {
        lastValueFrom(chatFilterService.delete(chatFilter.id));
        patchState(appStore, removeEntity(chatFilter.id, chatFilterConfig));
        console.log('>>> AppStore: ChatFilter deleted');
      },
      // ------- deleteAdvertisement -------
      deleteAdvertisement(id: number) {
        lastValueFrom(advertisementService.delete(id));
        this.deleteAdvertisementFromList(AppListType.PendingPublication, id);
        this.deleteAdvertisementFromList(AppListType.PendingValidation, id);
        this.deleteAdvertisementFromList(AppListType.MyAdvertisements, id);
        console.log('>>> AppStore: Advertisement deleted');
      },
      // ------- deleteAdvertisementFromList -------
      deleteAdvertisementFromList(appListType: AppListType, id: number) {
        let updatedCacheInfo = new Map<PaginationParams, number[]>();
        switch (appListType) {
          case AppListType.AllHistory:
            console.error(">>> AppStore: history shouldn't be deleted");
            break;
          case AppListType.PrivateHistory:
            console.error(">>> AppStore: history shouldn't be deleted");
            break;
          case AppListType.PendingPublication:
            patchState(appStore, removeEntity(id, pendingPublicationConfig));
            updatedCacheInfo = deleteFromCache(
              id,
              appStore.pendingPublicationCacheInfo(),
              pendingPublicationDefaultPaginationParams
            );
            {
              const currentParams =
                appStore.pendingPublicationPaginationParams();
              const allKeys = Array.from(updatedCacheInfo.keys());
              let isCurrentPaginationParamsContainsInCache = false;
              for (let i = 0; i < allKeys.length; i++) {
                const key = allKeys[i];
                if (arePaginationParamsEqual(key, currentParams, false)) {
                  isCurrentPaginationParamsContainsInCache = true;
                  break;
                }
              }
              if (
                !isCurrentPaginationParamsContainsInCache &&
                currentParams.pageNumber >= 1
              ) {
                const newPaginationParams = cloneDeep(currentParams);
                newPaginationParams.pageNumber =
                  newPaginationParams.pageNumber - 1;
                patchState(appStore, {
                  pendingPublicationCacheInfo: updatedCacheInfo,
                  pendingPublicationPaginationParams: newPaginationParams,
                });
                console.log(
                  '>>> AppStore: pendingPublication updated, changed to previous page due to empty cache'
                );
              } else {
                patchState(appStore, {
                  pendingPublicationCacheInfo: updatedCacheInfo,
                  pendingPublicationPaginationParams: cloneDeep(currentParams),
                });
                console.log('>>> AppStore: pendingPublication updated');
              }
            }
            break;
          case AppListType.PendingValidation:
            patchState(appStore, removeEntity(id, pendingValidationConfig));
            updatedCacheInfo = deleteFromCache(
              id,
              appStore.pendingValidationCacheInfo(),
              getDefaultPaginationParams(defaultPageSize)
            );
            {
              const currentParams =
                appStore.pendingValidationPaginationParams();
              const allKeys = Array.from(updatedCacheInfo.keys());
              let isCurrentPaginationParamsContainsInCache = false;
              for (let i = 0; i < allKeys.length; i++) {
                const key = allKeys[i];
                if (arePaginationParamsEqual(key, currentParams, false)) {
                  isCurrentPaginationParamsContainsInCache = true;
                  break;
                }
              }

              if (
                !isCurrentPaginationParamsContainsInCache &&
                currentParams.pageNumber >= 1
              ) {
                const newPaginationParams = cloneDeep(currentParams);
                newPaginationParams.pageNumber =
                  newPaginationParams.pageNumber - 1;
                patchState(appStore, {
                  pendingValidationCacheInfo: updatedCacheInfo,
                  pendingValidationPaginationParams: newPaginationParams,
                });
                console.log(
                  '>>> AppStore: pendingValidation updated, changed to previous page due to empty cache'
                );
              } else {
                patchState(appStore, {
                  pendingValidationCacheInfo: updatedCacheInfo,
                  pendingValidationPaginationParams: cloneDeep(currentParams),
                });
                console.log('>>> AppStore: pendingValidation updated');
              }
            }
            break;
          case AppListType.MyAdvertisements:
            patchState(appStore, removeEntity(id, myAdvertisementsConfig));
            break;
        }
        console.log(
          `>>> AppStore: Advertisement deleted from list ${appListType}`
        );
      },
      // ------- updateAdvertisementInList -------
      updateAdvertisementInList(
        appListType: AppListType,
        advertisement: Advertisement
      ) {
        const clonedAdvertisement = cloneDeep(advertisement);
        clonedAdvertisement.updated = DateHelper.getUTCTime();
        switch (appListType) {
          case AppListType.PendingPublication:
            patchState(
              appStore,
              updateEntity(
                { id: advertisement.id, changes: clonedAdvertisement },
                pendingPublicationConfig
              )
            );
            break;
          case AppListType.PendingValidation:
            patchState(
              appStore,
              updateEntity(
                { id: advertisement.id, changes: clonedAdvertisement },
                pendingValidationConfig
              )
            );
            break;
          case AppListType.MyAdvertisements:
            patchState(
              appStore,
              updateEntity(
                { id: advertisement.id, changes: clonedAdvertisement },
                myAdvertisementsConfig
              )
            );
            break;
        }
        console.log('>>> AppStore: Advertisement updated in list', appListType);
      },
      // ------- validateAdvertisementAdminAsync -------
      validateAdvertisementAdmin(advertisement: Advertisement) {
        if (!appStore.user()?.isAdmin) {
          console.error('>>> AppStore: user is not admin');
          return;
        }
        this.deleteAdvertisementFromList(
          AppListType.PendingValidation,
          advertisement.id
        );
        this.updateAdvertisementInList(
          AppListType.MyAdvertisements,
          advertisement
        );
        lastValueFrom(
          advertisementService.validateAdvertisementAdmin(advertisement)
        );
      },
      // ------- clearCacheInfo -------
      clearCacheInfo(appListType: AppListType) {
        switch (appListType) {
          case AppListType.AllHistory:
            patchState(appStore, { allHistoryCacheInfo: new Map() });
            break;
          case AppListType.PrivateHistory:
            patchState(appStore, { privateHistoryCacheInfo: new Map() });
            break;
          case AppListType.PendingPublication:
            patchState(appStore, { pendingPublicationCacheInfo: new Map() });
            break;
          case AppListType.PendingValidation:
            patchState(appStore, { pendingValidationCacheInfo: new Map() });
            break;
        }
        console.log(`>>> AppStore: CacheInfo cleared for ${appListType}`);
      },
      // ------- cancelPublication -------
      cancelPublication() {
        const selectedAdvertisement = appStore.selectedAdvertisement();
        if (selectedAdvertisement) {
          this.deleteAdvertisementFromList(
            AppListType.PendingPublication,
            selectedAdvertisement.id
          );
          selectedAdvertisement.nextPublishDate = undefined;
          selectedAdvertisement.nextPublishId = 0;
          selectedAdvertisement.statusId = AdvertisementStatus.validated;
          this.updateAdvertisementInList(
            AppListType.MyAdvertisements,
            selectedAdvertisement
          );

          this.setSelectedAdvertisement(selectedAdvertisement);
          lastValueFrom(
            advertisementService.cancelPublication(selectedAdvertisement.id)
          );
        }
      },
      // ------- confirmPublication -------
      confirmPublication(nextPublishDate?: Date) {
        if (nextPublishDate === undefined) {
          console.error('>>> AppStore: nextPublishDate is not defined');
          return;
        }

        const updatedAdvertisement = appStore.selectedAdvertisement();
        if (updatedAdvertisement) {
          updatedAdvertisement.nextPublishDate = nextPublishDate;
          updatedAdvertisement.statusId =
            AdvertisementStatus.pendingPublication;
          updatedAdvertisement.updated = DateHelper.getUTCTime();

          patchState(
            appStore,
            updateEntity(
              {
                id: appStore.selectedAdvertisement()?.id!,
                changes: {
                  ...updatedAdvertisement,
                },
              },
              myAdvertisementsConfig
            )
          );

          this.setSelectedAdvertisement(updatedAdvertisement);
          this.clearCacheInfo(AppListType.PendingPublication);
          lastValueFrom(publishService.publish(updatedAdvertisement));
        }
      },
      // ------- createAdvertisementAsync -------
      async createAdvertisementAsync(advertisement: Advertisement) {
        const advertisementResponse = await lastValueFrom(
          await advertisementService.save(advertisement)
        );
        patchState(
          appStore,
          addEntity(advertisementResponse, myAdvertisementsConfig)
        );
        this.setSelectedAdvertisement(advertisementResponse);
        console.log('>>> AppStore: advertisementResponse created');
      },
      // ------- updateAdvertisementAsync -------
      async updateAdvertisementAsync(advertisement: Advertisement) {
        this.updateSelectedAdvertisement(advertisement);
        const advertisementResponse = await lastValueFrom(
          await advertisementService.update(advertisement)
        );
        this.updateAdvertisementInList(
          AppListType.MyAdvertisements,
          advertisementResponse
        );
        console.log('>>> AppStore: advertisement updated');
      },
      // ------- sendToValidationAsync -------
      async sendToValidationAsync() {
        const selectedAdvertisement = appStore.selectedAdvertisement();
        if (selectedAdvertisement) {
          selectedAdvertisement.statusId =
            AdvertisementStatus.pendingValidation;
          this.updateAdvertisementInList(
            AppListType.MyAdvertisements,
            selectedAdvertisement
          );
          this.updateSelectedAdvertisement(selectedAdvertisement);

          lastValueFrom(
            advertisementService.sendToValidation(selectedAdvertisement.id)
          );

          this.clearCacheInfo(AppListType.PendingValidation);
          console.log('>>> AppStore: advertisement sent to validation');
        }
      },
      // ------- forcePublication -------
      forcePublication(adminComment?: string) {
        if (!appStore.user()?.isAdmin) {
          console.error('>>> AppStore: user is not admin');
          return;
        }
        const managePublish = {
          advertisementId: appStore.selectedAdvertisement()?.id,
          comment: adminComment,
          publishId: appStore.selectedAdvertisement()?.nextPublishId,
          shouldRejectValidation: false,
        } as ManagePublish;

        lastValueFrom(
          advertisementService.forcePublicationAdmin(managePublish)
        );
        this.deleteAdvertisementFromList(
          AppListType.PendingPublication,
          appStore.selectedAdvertisement()?.id!
        );
        if (
          appStore
            .myAdvertisementsIds()
            .includes(appStore.selectedAdvertisement()?.id!)
        ) {
          const updatedAdvertisement = cloneDeep(
            appStore.selectedAdvertisement()
          );
          if (updatedAdvertisement) {
            updatedAdvertisement.nextPublishDate = undefined;
            updatedAdvertisement.statusId = AdvertisementStatus.validated;

            this.updateAdvertisementInList(
              AppListType.MyAdvertisements,
              updatedAdvertisement
            );
          }
        }
      },
      // ------- cancelPublicationAdmin -------
      cancelPublicationAdmin(
        shouldRejectValidation: boolean,
        adminComment?: string
      ) {
        if (!appStore.user()?.isAdmin) {
          console.error('>>> AppStore: user is not admin');
          return;
        }
        const managePublish = {
          advertisementId: appStore.selectedAdvertisement()?.id,
          comment: adminComment,
          publishId: appStore.selectedAdvertisement()?.nextPublishId,
          shouldRejectValidation,
        } as ManagePublish;

        lastValueFrom(
          advertisementService.cancelPublicationAdmin(managePublish)
        );
        this.deleteAdvertisementFromList(
          AppListType.PendingPublication,
          appStore.selectedAdvertisement()?.id!
        );
      },
    })
  )
);
