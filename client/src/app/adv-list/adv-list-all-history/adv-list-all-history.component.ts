import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { SortOption } from '../../_entities/sortOption';
import { ListFilterComponent } from '../../_framework/component/adv-list-filter/list-filter.component';
import { EmptyListPlaceholderComponent } from '../../_framework/component/empty-list-placeholder/empty-list-placeholder.component';
import { Localization } from '../../_framework/component/helpers/localization';
import { SkeletonFullScreenComponent } from '../../_framework/component/skeleton-full-screen/skeleton-full-screen.component';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { BusyService } from '../../_services/busy.service';
import { TelegramBackButtonService } from '../../_services/telegramBackButton.service';
import { AppStore } from '../../appStore/app.store';
import { AdvListHelper } from '../adv-list.helper';
import { AppListType } from '../../_framework/constants/advListType';

@Component({
  selector: 'app-adv-list-all-history',
  standalone: true,
  imports: [
    SharedModule,
    EmptyListPlaceholderComponent,
    SkeletonFullScreenComponent,
    ListFilterComponent,
  ],
  templateUrl: './adv-list-all-history.component.html',
  styleUrl: './adv-list-all-history.component.scss',
})
export class AdvListAllHistoryComponent implements OnInit, OnDestroy {
  private backButtonService = inject(TelegramBackButtonService);
  readonly appStore = inject(AppStore);
  private router = inject(Router);
  busyService = inject(BusyService);
  advListHelper = inject(AdvListHelper);
  Localization = Localization;


  async ngOnInit() {
    this.appStore.setSelectedAppListType(AppListType.AllHistory);
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigate(['']);
    });
    this.initialize();
  }

  private async initialize(pageNumber?: number, sortOption?: SortOption) {
    await this.appStore.getAdvertisementAllHistoryAsync(pageNumber, sortOption);
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
