import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppStore } from '../appStore/app.store';
import { Localization } from '../_framework/component/helpers/localization';
import { take } from 'rxjs';
import { Router } from '@angular/router';
import { Advertisement } from '../_models/advertisement';
import { patchState } from '@ngrx/signals';
import { AppListType } from '../_framework/constants/advListType';

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
      (advertisement: Advertisement) => {
        this.appStore.updateAdvertisementInList(
          AppListType.MyAdvertisements,
          advertisement
        );

        if (this.appStore.selectedAdvertisement()?.id === advertisement.id) {
          this.appStore.updateSelectedAdvertisement(advertisement);
        }
        this.toastr
          .success(Localization.getWord('advertisement_validated'))
          .onTap.pipe(take(1))
          .subscribe(() => {
            this.appStore.getMyAdvertisementsAsync();
            this.appStore.setSelectedAdvertisement(advertisement);
            this.router.navigateByUrl('/app-advertisement-preview');
          });
        this.hapticFeedback();
      }
    );

    this.hubConnection.on(
      'AdvertisementRejected',
      (advertisement: Advertisement) => {
        this.appStore.updateAdvertisementInList(
          AppListType.MyAdvertisements,
          advertisement
        );

        if (this.appStore.selectedAdvertisement()?.id === advertisement.id) {
          this.appStore.updateSelectedAdvertisement(advertisement);
        }

        this.toastr
          .warning(Localization.getWord('advertisement_rejected'))
          .onTap.pipe(take(1))
          .subscribe(() => {
            this.appStore.getMyAdvertisementsAsync();
            this.appStore.setSelectedAdvertisement(advertisement);
            this.router.navigateByUrl('/app-advertisement-preview');
          });
        this.hapticFeedback();
      }
    );

    this.hubConnection.on(
      'NewValidationRequest',
      (advertisement: Advertisement) => {
        patchState(this.appStore as any, {
          pendingValidationCount: this.appStore.pendingValidationCount() + 1,
          listsToRefresh: [
            ...this.appStore.listsToRefresh(),
            AppListType.PendingValidation,
          ],
        });
        this.toastr
          .info(Localization.getWord('validation_request'))
          .onTap.pipe(take(1))
          .subscribe(() => {
            patchState(this.appStore as any, {
              listsToRefresh: this.appStore
                .listsToRefresh()
                ?.filter(
                  (listType: AppListType) =>
                    listType !== AppListType.PendingValidation
                ),
            });
            this.appStore.clearCacheInfo(AppListType.PendingValidation);
            this.appStore.getPendingValidationAdvertisementsAsync();
            this.appStore.setSelectedAdvertisement(advertisement);
            this.router.navigateByUrl('/app-advertisement-validate');
          });
        this.hapticFeedback();
      }
    );
    this.hubConnection.on(
      'AdvertisementPlaced',
      (advertisement: Advertisement) => {
        this.placementNotificationHandler(advertisement, false);
        this.hapticFeedback();
      }
    );

    this.hubConnection.on(
      'AdvertisementForced',
      (advertisement: Advertisement) => {
        this.placementNotificationHandler(advertisement, true);
        this.hapticFeedback();
      }
    );
    this.hubConnection.on(
      'CancelPublicationAdmin',
      (advertisement: Advertisement) => {
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
        this.toastr
          .warning(Localization.getWord('cancel_publication_admin'))
          .onTap.pipe(take(1))
          .subscribe(() => {
            this.appStore.setSelectedAdvertisement(advertisement);
            this.appStore.getMyAdvertisementsAsync();
            this.router.navigateByUrl('/app-advertisement-preview');
          });
        this.hapticFeedback();
      }
    );
    this.hubConnection.on(
      'CancelPublicationUser',
      (advertisement: Advertisement) => {
        this.appStore.deleteAdvertisementFromList(
          AppListType.PendingPublication,
          advertisement.id
        );
      }
    );
    this.hubConnection.on('UpdateClientList', (listType: AppListType) => {
      patchState(this.appStore as any, {
        listsToRefresh: [...this.appStore.listsToRefresh(), listType],
      });
    });
  }

  //  ----------- Helpers -----------

  placementNotificationHandler = (
    advertisement: Advertisement,
    isForced: boolean
  ) => {
    patchState(this.appStore as any, {
      listsToRefresh: [
        ...this.appStore.listsToRefresh(),
        AppListType.PrivateHistory,
        AppListType.AllHistory,
      ],
    });
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

  hapticFeedback() {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred();
    }
  }
}
