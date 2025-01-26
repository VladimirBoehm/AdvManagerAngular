import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ChatFilter } from '../../_models/chatFilter';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatFilterService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private chatFiltersSubject = new BehaviorSubject<ChatFilter[]>([]);
  readonly chatFilters$ = this.chatFiltersSubject.asObservable();

  save(chatFilter: ChatFilter) {
    return this.http.post<ChatFilter>(this.baseUrl + 'chatFilter', chatFilter);
  }

  getAll() {
    return this.http.get<ChatFilter[]>(this.baseUrl + 'chatFilter', {});
  }

  delete(id: number) {
    return this.http.delete(this.baseUrl + `chatFilter/${id}`);
  }
}
