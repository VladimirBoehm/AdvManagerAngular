import { inject, Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AppStore } from '../app.store';

@Injectable({
  providedIn: 'root',
})
export class HomeResolver implements Resolve<any> {
  readonly appStore = inject(AppStore);

  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<Observable<boolean>> {
    await this.appStore.login();
    return of(true);
  }
}
