import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { EmptyListPlaceholderComponent } from '../../_framework/component/empty-list-placeholder/empty-list-placeholder.component';
import { SkeletonFullScreenComponent } from '../../_framework/component/skeleton-full-screen/skeleton-full-screen.component';
import { Router } from '@angular/router';
import { DateHelper } from '../../_framework/component/helpers/dateHelper';
import { Localization } from '../../_framework/component/helpers/localization';
import { BusyService } from '../../_services/busy.service';
import { TelegramBackButtonService } from '../../_services/telegramBackButton.service';
import { AppStore } from '../../appStore/app.store';
import { SortOption } from '../../_entities/sortOption';
import { PageEvent } from '@angular/material/paginator';
import { ListFilterComponent } from '../../_framework/component/adv-list-filter/list-filter.component';
import { Advertisement } from '../../_models/advertisement';
import { AdvListHelper } from '../adv-list.helper';
import { AppListType } from '../../_framework/constants/advListType';

@Component({
  selector: 'app-adv-list-pending-validation',
  standalone: true,
  imports: [
    SharedModule,
    EmptyListPlaceholderComponent,
    ListFilterComponent,
  ],
  templateUrl: './adv-list-pending-validation.component.html',
  styleUrl: './adv-list-pending-validation.component.scss',
})
export class AdvListPendingValidationComponent implements OnInit, OnDestroy {
  private backButtonService = inject(TelegramBackButtonService);
  readonly appStore = inject(AppStore);
  private router = inject(Router);
  busyService = inject(BusyService);
  advListHelper = inject(AdvListHelper);
  Localization = Localization;
  dateHelper = DateHelper;

  async ngOnInit() {
    this.appStore.setSelectedAppListType(AppListType.PendingValidation);
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigate(['']);
    });
    this.initialize();
  }

  private async initialize(pageNumber?: number, sortOption?: SortOption) {
    await this.appStore.getPendingValidationAdvertisementsAsync(
      pageNumber,
      sortOption
    );
  }

  onItemClickValidate(advertisement: Advertisement) {
    this.appStore.setSelectedAdvertisement(advertisement);
    this.router.navigate(['/app-advertisement-validate']);
  }

  handlePageEvent(e: PageEvent) {
    this.initialize(e.pageIndex);
  }

  sortChanged($event: SortOption) {
    //reset page number
    this.initialize(0, $event);
  }

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
  }
}
