import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { EmptyListPlaceholderComponent } from '../../_framework/component/empty-list-placeholder/empty-list-placeholder.component';
import { Router } from '@angular/router';
import { DateHelper } from '../../_framework/component/helpers/dateHelper';
import { Localization } from '../../_framework/component/helpers/localization';
import { TelegramBackButtonService } from '../../_services/telegramBackButton.service';
import { AppStore } from '../../appStore/app.store';
import { SortOption } from '../../_entities/sortOption';
import { PageEvent } from '@angular/material/paginator';
import { ListFilterComponent } from '../../_framework/component/adv-list-filter/list-filter.component';
import { Advertisement } from '../../_models/advertisement';
import { AdvListHelper } from '../adv-list.helper';
import { AppListType } from '../../_framework/constants/advListType';
import { RefreshListNotification } from '../refresh-list-notification';
import { patchState } from '@ngrx/signals';

@Component({
  selector: 'app-adv-list-pending-validation',
  standalone: true,
  imports: [
    SharedModule,
    EmptyListPlaceholderComponent,
    ListFilterComponent,
    RefreshListNotification,
  ],
  templateUrl: './adv-list-pending-validation.component.html',
  styleUrl: './adv-list-pending-validation.component.scss',
})
export class AdvListPendingValidationComponent implements OnInit, OnDestroy {
  private backButtonService = inject(TelegramBackButtonService);
  readonly appStore = inject(AppStore);
  private router = inject(Router);
  advListHelper = inject(AdvListHelper);
  Localization = Localization;
  dateHelper = DateHelper;
  shouldShowRefreshInfo = signal(false);
  isLoading = signal(false);

  constructor() {
    if (this.appStore.pendingValidationCacheInfo().size === 0) {
      this.cleanListsToRefresh();
    }
    effect(
      () => {
        if (
          this.appStore.listsToRefresh().includes(AppListType.PendingValidation)
        ) {
          this.shouldShowRefreshInfo.set(true);
        }
      },
      { allowSignalWrites: true }
    );
  }

  async ngOnInit() {
    this.appStore.setSelectedAppListType(AppListType.PendingValidation);
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigate(['']);
    });
    this.initialize();
  }

  private async initialize(pageNumber?: number, sortOption?: SortOption) {
    this.isLoading.set(true);
    await this.appStore.getPendingValidationAdvertisementsAsync(
      pageNumber,
      sortOption
    );
    this.isLoading.set(false);
  }

  refresh = () => {
    this.shouldShowRefreshInfo.set(false);
    this.cleanListsToRefresh();
    this.appStore.clearCacheInfo(AppListType.PendingValidation);
    this.initialize();
  };

  cleanListsToRefresh() {
    patchState(this.appStore as any, {
      listsToRefresh: this.appStore
        .listsToRefresh()
        ?.filter(
          (listType: AppListType) => listType !== AppListType.PendingValidation
        ),
    });
  }

  onItemClickValidate(advertisement: Advertisement) {
    this.appStore.setSelectedAdvertisement(advertisement);
    this.router.navigateByUrl('/app-advertisement-validate');
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
