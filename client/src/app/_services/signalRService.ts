import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppStore } from '../appStore/app.store';
import { Localization } from '../_framework/component/helpers/localization';
import { take } from 'rxjs';
import { Router } from '@angular/router';

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

    this.hubConnection.on('Test', (test2) => {
      this.toastr.info(test2 + ' !!!!!!!!!!');
    });

    this.hubConnection.on(
      'AdvertisementValidated',
      (advertisementId: number) => {
        this.appStore.advertisementValidatedSignalR(advertisementId);

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
        this.appStore.advertisementRejectedSignalR(advertisementId);

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
  }
}
