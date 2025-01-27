import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { ListFilterComponent } from '../../_framework/component/adv-list-filter/list-filter.component';
import { EmptyListPlaceholderComponent } from '../../_framework/component/empty-list-placeholder/empty-list-placeholder.component';
import { SkeletonFullScreenComponent } from '../../_framework/component/skeleton-full-screen/skeleton-full-screen.component';
import { Localization } from '../../_framework/component/helpers/localization';
import { Router } from '@angular/router';
import { BusyService } from '../../_services/busy.service';
import { TelegramBackButtonService } from '../../_services/telegramBackButton.service';
import { AppStore } from '../../appStore/app.store';
import { SortOption } from '../../_entities/sortOption';
import { PageEvent } from '@angular/material/paginator';
import { Advertisement } from '../../_models/advertisement';
import { DatePipe } from '@angular/common';
import { AdvListHelper } from '../adv-list.helper';

@Component({
  selector: 'app-adv-list-pending-publication',
  standalone: true,
  imports: [
    SharedModule,
    EmptyListPlaceholderComponent,
    SkeletonFullScreenComponent,
    ListFilterComponent,
  ],
  providers: [DatePipe],
  templateUrl: './adv-list-pending-publication.component.html',
  styleUrl: './adv-list-pending-publication.component.scss',
})
export class AdvListPendingPublicationComponent implements OnInit, OnDestroy {
  private backButtonService = inject(TelegramBackButtonService);
  readonly appStore = inject(AppStore);
  private router = inject(Router);
  busyService = inject(BusyService);
  datePipe = inject(DatePipe);
  advListHelper = inject(AdvListHelper);
  Localization = Localization;
  
  async ngOnInit() {
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigate(['']);
    });
    this.initialize();
  }
  private async initialize(pageNumber?: number, sortOption?: SortOption) {
    await this.appStore.getPendingPublicationAdvertisementsAsync(
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
