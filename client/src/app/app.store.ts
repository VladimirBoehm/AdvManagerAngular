import { effect, inject } from '@angular/core';
import {
  getState,
  patchState,
  signalStore,
  signalStoreFeature,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { lastValueFrom } from 'rxjs';
import { User } from './_models/user';
import { AccountService } from './_services/account.service';
import { AdvertisementService } from './_services/advertisement.service';

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

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withLogger('appState'),
  withMethods(
    (
      store,
      accountService = inject(AccountService),
      advertisementService = inject(AdvertisementService)
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
          console.log('>>> AppStore: pendingValidationAdvertisementsCount loaded');
        }
      },
    })
  )
);
