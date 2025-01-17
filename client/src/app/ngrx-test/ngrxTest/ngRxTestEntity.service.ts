import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NgRxTestEntity } from '../../_models/ngRxTestEntity';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

export class NgRxTestEntityService {
  private http = inject(HttpClient);

  getAll(): Observable<NgRxTestEntity[]> {
    return this.http.get<NgRxTestEntity[]>(environment.apiUrl + 'Test');
  }
}
