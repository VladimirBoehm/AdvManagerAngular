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
  isLoaded = signal<boolean>(false);

  save(chatFilter: ChatFilter) {
    chatFilter.id = 0;
    this.chatFilters.set([...this.chatFilters(), chatFilter]);
    this.http
      .post<ChatFilter>(this.baseUrl + 'chatFilter', chatFilter)
      .subscribe({
        next: (newChatFilter: ChatFilter) => {
          const chatFilters = this.chatFilters();
          const index = chatFilters.findIndex((cf) => cf.id === 0);
          if (index !== -1) {
            const updatedChatFilters = [...chatFilters];
            updatedChatFilters[index] = {
              ...updatedChatFilters[index],
              id: newChatFilter.id,
            };
            this.chatFilters.set(updatedChatFilters);
          }
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
          this.isLoaded.set(true);
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
    const updatedCache = this.chatFilters().filter((x) => x.id !== id);
    this.chatFilters.set(updatedCache);

    return this.http.delete(this.baseUrl + `chatFilter/${id}`).subscribe({
      error: (err) => {
        console.error('Error when saving chatFilters:', err);
      },
    });
  }
}
