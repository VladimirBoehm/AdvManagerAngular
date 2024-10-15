import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { ChatFilter } from '../_models/chatFilter';

@Injectable({
  providedIn: 'root',
})
export class ChatFilterService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private isRequested: boolean = false;

  chatFilters = signal<ChatFilter[]>([]);

  save(chatFilter: ChatFilter) {
    this.http
      .post<ChatFilter>(this.baseUrl + 'chatFilter', chatFilter)
      .subscribe({
        next: (newChatFilter: ChatFilter) => {
          this.chatFilters.set([...this.chatFilters(), newChatFilter]);
        },
        error: (err) => {
          console.error('Error when saving chatFilters:', err);
        },
      });
  }

  getAll() {
    if (!this.isRequested) {
      this.http.get<ChatFilter[]>(this.baseUrl + 'chatFilter').subscribe({
        next: (result: ChatFilter[]) => {
          this.chatFilters.set(result);
          this.isRequested = true;
          console.log('Loaded from db:' + JSON.stringify(this.chatFilters()));
        },
        error: (err) => {
          console.error('Error when loading chatFilters:', err);
        },
      });
    } else {
      console.log('Cache taken: ' + JSON.stringify(this.chatFilters()));
    }
  }

  delete(id: number) {
    console.log(id);
    return this.http.delete(this.baseUrl + `chatFilter/${id}`).subscribe({
      next: () => {
        const updatedCache = this.chatFilters().filter((x) => x.id !== id);
        this.chatFilters.set(updatedCache);
      },
      error: (err) => {
        console.error('Error when saving chatFilters:', err);
      },
    });
  }
}
