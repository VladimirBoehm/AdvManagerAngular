import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { ListFilterComponent } from '../../_framework/component/adv-list-filter/list-filter.component';
import { EmptyListPlaceholderComponent } from '../../_framework/component/empty-list-placeholder/empty-list-placeholder.component';
import { Localization } from '../../_framework/component/helpers/localization';
import { Router } from '@angular/router';
import { TelegramBackButtonService } from '../../_services/telegramBackButton.service';
import { AppStore } from '../../appStore/app.store';
import { SortOption } from '../../_entities/sortOption';
import { PageEvent } from '@angular/material/paginator';
import { Advertisement } from '../../_models/advertisement';
import { DatePipe } from '@angular/common';
import { AdvListHelper } from '../adv-list.helper';
import { AppListType } from '../../_framework/constants/advListType';
import { patchState } from '@ngrx/signals';
import { RefreshListNotification } from '../refresh-list-notification';

@Component({
  selector: 'app-adv-list-pending-publication',
  standalone: true,
  imports: [
    SharedModule,
    EmptyListPlaceholderComponent,
    ListFilterComponent,
    RefreshListNotification,
  ],
  providers: [DatePipe],
  templateUrl: './adv-list-pending-publication.component.html',
  styleUrl: './adv-list-pending-publication.component.scss',
})
export class AdvListPendingPublicationComponent implements OnInit, OnDestroy {
  private backButtonService = inject(TelegramBackButtonService);
  readonly appStore = inject(AppStore);
  private router = inject(Router);
  private changeDetector = inject(ChangeDetectorRef);

  datePipe = inject(DatePipe);
  advListHelper = inject(AdvListHelper);
  Localization = Localization;
  shouldShowRefreshInfo = signal(false);
  isLoading = signal(false);

  constructor() {
    if (this.appStore.pendingPublicationCacheInfo().size === 0) {
      this.cleanListsToRefresh();
    }
    effect(
      () => {
        if (
          this.appStore
            .listsToRefresh()
            .includes(AppListType.PendingPublication)
        ) {
          this.shouldShowRefreshInfo.set(true);
        }
      },
      { allowSignalWrites: true }
    );
  }

  async ngOnInit() {
    this.appStore.setSelectedAppListType(AppListType.PendingPublication);
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigateByUrl('');
    });
    this.initialize();
  }
  private async initialize(pageNumber?: number, sortOption?: SortOption) {
    this.isLoading.set(true);
    await this.appStore.getPendingPublicationAdvertisementsAsync(
      pageNumber,
      sortOption
    );
    this.isLoading.set(false);
    this.changeDetector.detectChanges();
  }

  refresh = () => {
    this.shouldShowRefreshInfo.set(false);
    this.cleanListsToRefresh();
    this.appStore.clearCacheInfo(AppListType.PendingPublication);
    this.initialize();
  };

  cleanListsToRefresh() {
    patchState(this.appStore as any, {
      listsToRefresh: this.appStore
        .listsToRefresh()
        ?.filter(
          (listType: AppListType) => listType !== AppListType.PendingPublication
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

  getMatListItemInfo(advertisement: Advertisement): string {
    const formattedDate = this.datePipe.transform(
      advertisement.nextPublishDate,
      'dd.MM.yyyy'
    );

    return `${this.Localization.getWord('next_publication')} ${formattedDate}`;
  }

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
  }
}
