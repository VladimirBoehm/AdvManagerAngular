import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
  AppStore,
  defaultPageSize,
  pendingValidationConfig,
} from '../appStore/app.store';
import { Localization } from '../_framework/component/helpers/localization';
import { take } from 'rxjs';
import { Router } from '@angular/router';
import { Advertisement } from '../_models/advertisement';
import { patchState } from '@ngrx/signals';
import { addEntity } from '@ngrx/signals/entities';
import cloneDeep from 'lodash-es/cloneDeep';
import { AppListType } from '../_framework/constants/advListType';
import { getDefaultPaginationParams } from '../appStore/app.store.helper';
import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection?: HubConnection;
  readonly appStore = inject(AppStore);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  Localization = Localization;

  async createHubConnection() {
    if (!environment.isLocal) {
      while (!window?.Telegram?.WebApp?.initData) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    const params = new URLSearchParams();
    params.append('initData', window?.Telegram?.WebApp?.initData);

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(
        environment.hubUrl + 'advertisementsHub' + `?${params.toString()}`
      )
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch((error) => console.error(error));

    // ------------ METHODS ------------
    this.hubConnection.on(
      'AdvertisementValidated',
      (advertisementId: number) => {
        const updatedAdvertisement = this.appStore
          .myAdvertisementsEntities()
          .find((ad) => ad.id === advertisementId);
        if (updatedAdvertisement) {
          updatedAdvertisement.statusId = AdvertisementStatus.validated;
          this.appStore.updateAdvertisementInList(
            AppListType.MyAdvertisements,
            updatedAdvertisement
          );
        }
        if (this.appStore.selectedAdvertisement()?.id === advertisementId) {
          this.appStore.setSelectedAdvertisement(updatedAdvertisement!);
        }

        this.toastr
          .success(Localization.getWord('advertisement_validated'))
          .onTap.pipe(take(1))
          .subscribe(() => {
            var advertisement = this.appStore
              .myAdvertisementsEntities()
              .find((x) => x.id === advertisementId);
            if (advertisement) {
              this.appStore.setSelectedAdvertisement(advertisement);
              this.router.navigateByUrl('/app-advertisement-preview');
            }
          });
      }
    );

    this.hubConnection.on(
      'AdvertisementRejected',
      (advertisementId: number) => {
        const updatedAdvertisement = this.appStore
          .myAdvertisementsEntities()
          .find((ad) => ad.id === advertisementId);
        if (updatedAdvertisement) {
          updatedAdvertisement.statusId = AdvertisementStatus.rejected;
          this.appStore.updateAdvertisementInList(
            AppListType.MyAdvertisements,
            updatedAdvertisement
          );
        }
        if (this.appStore.selectedAdvertisement()?.id === advertisementId) {
          this.appStore.setSelectedAdvertisement(updatedAdvertisement!);
        }

        this.toastr
          .warning(Localization.getWord('advertisement_rejected'))
          .onTap.pipe(take(1))
          .subscribe(() => {
            var advertisement = this.appStore
              .myAdvertisementsEntities()
              .find((x) => x.id === advertisementId);
            if (advertisement) {
              this.appStore.setSelectedAdvertisement(advertisement);
              this.router.navigateByUrl('/app-advertisement-preview');
            }
          });
      }
    );

    this.hubConnection.on(
      'NewValidationRequest',
      (advertisement: Advertisement) => {
        const cache = this.appStore.pendingValidationCacheInfo();
        if (cache.size === 1) {
          const [paginationParams, ids] = Array.from(cache.entries())[0];
          if (paginationParams.totalItems < paginationParams.pageSize) {
            const updatedIds = [...ids, advertisement.id];
            paginationParams.totalItems++;
            const updatedCache = new Map();
            updatedCache.set(cloneDeep(paginationParams), updatedIds);
            patchState(
              this.appStore as any,
              addEntity(advertisement, pendingValidationConfig)
            );
            patchState(this.appStore as any, {
              pendingValidationCacheInfo: updatedCache,
              pendingValidationPaginationParams: cloneDeep(paginationParams),
            });
          }
          this.toastr
            .info(Localization.getWord('validation_request'))
            .onTap.pipe(take(1))
            .subscribe(() => {
              if (advertisement) {
                this.appStore.setSelectedAdvertisement(advertisement);
                this.router.navigateByUrl('/app-advertisement-validate');
              }
            });
        } else {
          this.appStore.clearCacheInfo(AppListType.PendingValidation);
          patchState(this.appStore as any, {
            pendingValidationCount: this.appStore.pendingValidationCount() + 1,
            pendingValidationPaginationParams: cloneDeep(
              getDefaultPaginationParams(defaultPageSize)
            ),
          });
          this.appStore.getPendingValidationAdvertisementsAsync();
          this.toastr
            .info(Localization.getWord('validation_request'))
            .onTap.pipe(take(1))
            .subscribe(() => {
              if (advertisement) {
                this.appStore.getPendingValidationAdvertisementsAsync();
                this.router.navigateByUrl('/app-adv-list-pending-validation');
              }
            });
        }
      }
    );

    this.hubConnection.on(
      'AdvertisementPlaced',
      (advertisement: Advertisement) => {
        this.placementNotificationHandler(advertisement, false);
      }
    );

    this.hubConnection.on(
      'AdvertisementForced',
      (advertisement: Advertisement) => {
        console.log('AdvertisementForced1');
        this.placementNotificationHandler(advertisement, true);
      }
    );
  }

  placementNotificationHandler = (
    advertisement: Advertisement,
    isForced: boolean
  ) => {
    this.appStore.clearCacheInfo(AppListType.AllHistory);
    this.appStore.clearCacheInfo(AppListType.PrivateHistory);
    this.appStore.updateAdvertisementInList(
      AppListType.MyAdvertisements,
      advertisement
    );
    this.appStore.deleteAdvertisementFromList(
      AppListType.PendingPublication,
      advertisement.id
    );

    if (this.appStore.selectedAdvertisement()?.id === advertisement.id) {
      this.appStore.updateSelectedAdvertisement(advertisement);
    }

    if (this.router.url.includes('/app-adv-list-private-history')) {
      this.appStore.getAdvertisementPrivateHistoryAsync();
    }
    if (this.router.url.includes('/app-adv-list-all-history')) {
      this.appStore.getAdvertisementAllHistoryAsync();
    }

    let message;
    if (isForced) {
      message = Localization.getWord('advertisement_forced');
      console.log('AdvertisementForced2');
    } else {
      message = Localization.getWord('advertisement_placed');
    }

    this.toastr
      .success(message)
      .onTap.pipe(take(1))
      .subscribe(() => {
        this.appStore.setSelectedAdvertisement(advertisement);
        this.appStore.getMyAdvertisementsAsync();
        this.router.navigateByUrl('/app-advertisement-preview');
      });
  };
}
