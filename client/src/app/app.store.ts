import { effect, inject } from '@angular/core';
import {
  getState,
  patchState,
  signalStore,
  signalStoreFeature,
  type,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { lastValueFrom } from 'rxjs';
import { User } from './_models/user';
import { AccountService } from './_services/account.service';
import { AdvertisementService } from './_services/advertisement.service';
import {
  addEntities,
  entityConfig,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { ChatFilter } from './_models/chatFilter';
import { ChatFilterService } from './_services/chat-filter.service';
import { SortOption } from './_models/sortOption';

type appState = {
  user: User | null;
  pendingValidationAdvertisementsCount: number;
};
const initialState: appState = {
  user: null,
  pendingValidationAdvertisementsCount: 0,
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
          const chatFilters = await lastValueFrom(chatFilterService.getAll2());
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
    })
  )
);
