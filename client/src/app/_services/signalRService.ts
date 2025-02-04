import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppStore } from '../appStore/app.store';
import { Localization } from '../_framework/component/helpers/localization';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection?: HubConnection;
  readonly appStore = inject(AppStore);
  private toastr = inject(ToastrService);
  Localization = Localization;

  createHubConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.hubUrl + 'advertisementsHub')
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

        this.toastr.success(Localization.getWord('advertisement_validated'));
      }
    );
  }
}

// this.hubConnection.on('NewMessageReceived', ({username, knownAs}) => {
//   this.toastr.info(knownAs + ' has sent you a new message!  Click me to see it')
//     .onTap
//     .pipe(take(1))
//     .subscribe(() => this.router.navigateByUrl('/members/' + username + '?tab=Messages'))
// })
