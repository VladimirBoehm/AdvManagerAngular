import { inject, Injectable } from '@angular/core';
import { AppStore, chatFilterConfig } from './app.store';
import { patchState } from '@ngrx/signals';
import { addEntities } from '@ngrx/signals/entities';
import { lastValueFrom } from 'rxjs';
import { ChatFilterService } from '../_services/api.services/chat-filter.service';

@Injectable({ providedIn: 'root' })
export class AppStoreChatFilter {
  readonly appStore = inject(AppStore);
  readonly chatFilterService = inject(ChatFilterService);

  async getChatFiltersAsync() {
    if (this.appStore.areChatFiltersLoaded() === false) {
      const chatFilters = await lastValueFrom(this.chatFilterService.getAll());
      const chatFiltersWithDates = chatFilters.map((cf) => ({
        ...cf,
        created: new Date(cf.created),
      }));
      patchState(
        this.appStore as any,
        addEntities(chatFiltersWithDates, chatFilterConfig)
      );
      patchState(this.appStore as any, { areChatFiltersLoaded: true });
      console.log('>>> AppStore: chatFilters loaded');
    }
  }
}
