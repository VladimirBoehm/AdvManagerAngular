import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { SortOption } from '../../_entities/sortOption';
import { ListFilterComponent } from '../../_framework/component/adv-list-filter/list-filter.component';
import { EmptyListPlaceholderComponent } from '../../_framework/component/empty-list-placeholder/empty-list-placeholder.component';
import { Localization } from '../../_framework/component/helpers/localization';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { TelegramBackButtonService } from '../../_services/telegramBackButton.service';
import { AppStore } from '../../appStore/app.store';
import { AdvListHelper } from '../adv-list.helper';
import { AppListType } from '../../_framework/constants/advListType';
import { patchState } from '@ngrx/signals';
import { RefreshListNotification } from '../refresh-list-notification';

@Component({
  selector: 'app-adv-list-all-history',
  standalone: true,
  imports: [
    SharedModule,
    EmptyListPlaceholderComponent,
    ListFilterComponent,
    RefreshListNotification,
  ],
  templateUrl: './adv-list-all-history.component.html',
  styleUrl: './adv-list-all-history.component.scss',
})
export class AdvListAllHistoryComponent implements OnInit, OnDestroy {
  private backButtonService = inject(TelegramBackButtonService);
  private changeDetector = inject(ChangeDetectorRef);
  readonly appStore = inject(AppStore);
  private router = inject(Router);
  advListHelper = inject(AdvListHelper);
  Localization = Localization;
  shouldShowRefreshInfo = signal(false);
  isLoading = signal(false);

  constructor() {
    if (this.appStore.allHistoryCacheInfo().size === 0) {
      this.cleanListsToRefresh();
    }
    effect(
      () => {
        if (this.appStore.listsToRefresh().includes(AppListType.AllHistory)) {
          this.shouldShowRefreshInfo.set(true);
        }
      },
      { allowSignalWrites: true }
    );
  }

  async ngOnInit() {
    this.appStore.setSelectedAppListType(AppListType.AllHistory);
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigateByUrl('');
    });
    this.initialize();
  }

  private async initialize(pageNumber?: number, sortOption?: SortOption) {
    this.isLoading.set(true);
    await this.appStore.getAdvertisementAllHistoryAsync(pageNumber, sortOption);
    this.isLoading.set(false);
    this.changeDetector.detectChanges();
  }

  refresh = () => {
    this.shouldShowRefreshInfo.set(false);
    this.cleanListsToRefresh();
    this.appStore.clearCacheInfo(AppListType.AllHistory);
    this.initialize();
  };

  cleanListsToRefresh() {
    patchState(this.appStore as any, {
      listsToRefresh: this.appStore
        .listsToRefresh()
        ?.filter(
          (listType: AppListType) => listType !== AppListType.AllHistory
        ),
    });
  }

  sortChanged($event: SortOption) {
    //reset page number
    this.initialize(0, $event);
  }

  handlePageEvent(e: PageEvent) {
    this.initialize(e.pageIndex);
  }

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
  }
}
