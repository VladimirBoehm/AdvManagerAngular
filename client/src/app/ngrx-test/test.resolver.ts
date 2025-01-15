import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { TestEntityService } from './services/test-entity.service';

@Injectable()
export class TestResolver implements Resolve<any> {
  testService = inject(TestEntityService);
  loading = false;

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('TestResolver: resolve called');
    return of(true);
    // return this.testService.getAll().pipe(
    //   map((items) => {
    //     console.log('Items in resolver:', items);
    //     return !!items;
    //   })
    // );
  }
}
