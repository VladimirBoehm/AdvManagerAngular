import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListFilterComponent } from '../../_framework/component/adv-list-filter/list-filter.component';
import { EmptyListPlaceholderComponent } from '../../_framework/component/empty-list-placeholder/empty-list-placeholder.component';
import { DateHelper } from '../../_framework/component/helpers/dateHelper';
import { Localization } from '../../_framework/component/helpers/localization';
import { SkeletonFullScreenComponent } from '../../_framework/component/skeleton-full-screen/skeleton-full-screen.component';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { BusyService } from '../../_services/busy.service';
import { TelegramBackButtonService } from '../../_services/telegramBackButton.service';
import { AppStore } from '../../appStore/app.store';
import { SortOption } from '../../_entities/sortOption';
import { PageEvent } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';
import { AdvListHelper } from '../adv-list.helper';
import { AppListType } from '../../_framework/constants/advListType';

@Component({
  selector: 'app-adv-list-private-history',
  standalone: true,
  imports: [
    SharedModule,
    EmptyListPlaceholderComponent,
    ListFilterComponent,
  ],
  providers: [DatePipe],
  templateUrl: './adv-list-private-history.component.html',
  styleUrl: './adv-list-private-history.component.scss',
})
export class AdvListPrivateHistoryComponent implements OnInit, OnDestroy {
  private backButtonService = inject(TelegramBackButtonService);
  readonly appStore = inject(AppStore);
  private router = inject(Router);
  busyService = inject(BusyService);
  advListHelper = inject(AdvListHelper);
  Localization = Localization;
  dateHelper = DateHelper;

  async ngOnInit() {
    this.appStore.setSelectedAppListType(AppListType.PrivateHistory);
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigate(['/app-adv-list-my-advertisements']);
    });
    this.initialize();
  }

  private async initialize(pageNumber?: number, sortOption?: SortOption) {
    await this.appStore.getAdvertisementPrivateHistoryAsync(
      pageNumber,
      sortOption
    );
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
