import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection?: HubConnection;

  private toastr = inject(ToastrService);

  createHubConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.hubUrl + 'advertisementsHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch((error) => console.error(error));

    this.hubConnection.on('Test', (test2) => {
      this.toastr.info(test2 + ' !!!!!!!!!!');
    });

    // this.hubConnection.on('NewMessageReceived', ({username, knownAs}) => {
    //   this.toastr.info(knownAs + ' has sent you a new message!  Click me to see it')
    //     .onTap
    //     .pipe(take(1))
    //     .subscribe(() => this.router.navigateByUrl('/members/' + username + '?tab=Messages'))
    // })
  }
}


