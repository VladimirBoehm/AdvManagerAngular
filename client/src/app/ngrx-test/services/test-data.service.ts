import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DefaultDataService, HttpUrlGenerator } from '@ngrx/data';
import { map, Observable } from 'rxjs';
import { NgRxTestEntity } from '../../_models/ngRxTestEntity';
import { environment } from '../../../environments/environment';
//New
// /api - default
@Injectable()
export class TestDataService extends DefaultDataService<NgRxTestEntity> {
  constructor(http: HttpClient, httpUrlGenerator: HttpUrlGenerator) {
    super('NgRxTestEntity', http, httpUrlGenerator);
    console.log('TestDataService initialized');
  }

  override getAll(): Observable<NgRxTestEntity[]> {
    console.log('TestDataService: getAll() called');
    return this.http.get<NgRxTestEntity[]>(`${environment.apiUrl}/Test`).pipe(
      map((response) => {
        console.log('Response from API:', response);
        return response;
      })
    );
  }
}
