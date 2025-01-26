import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Advertisement } from '../_models/advertisement';
import { TelegramBackButtonService } from '../_services/telegramBackButton.service';
import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';
import { SortOption } from '../_entities/sortOption';
import { DateHelper } from '../_framework/component/helpers/dateHelper';
import { AppListType } from '../_framework/constants/advListType';
import { Subscription } from 'rxjs';
import { BusyService } from '../_services/busy.service';
import { SharedModule } from '../_framework/modules/sharedModule';
import { PageEvent } from '@angular/material/paginator';
import { ListFilterComponent } from '../_framework/component/adv-list-filter/list-filter.component';
import { EmptyListPlaceholderComponent } from '../_framework/component/empty-list-placeholder/empty-list-placeholder.component';
import { DatePipe } from '@angular/common';
import { SkeletonFullScreenComponent } from '../_framework/component/skeleton-full-screen/skeleton-full-screen.component';
import { Localization } from '../_framework/component/helpers/localization';
import { AppStore } from '../appStore/app.store';
import { PaginationParams } from '../_entities/paginationParams';

@Component({
  selector: 'app-adv-list',
  standalone: true,
  imports: [
    SharedModule,
    ListFilterComponent,
    EmptyListPlaceholderComponent,
    SkeletonFullScreenComponent,
  ],
  providers: [DatePipe],
  templateUrl: './adv-list.component.html',
  styleUrl: './adv-list.component.scss',
})
export class AdvListComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private backButtonService = inject(TelegramBackButtonService);
  private router = inject(Router);
  readonly appStore = inject(AppStore);
 
  pagination = signal<PaginationParams>({} as PaginationParams);
  readonly advertisementsList = signal<Advertisement[]>([]);

  private paramMapSubscription!: Subscription;

  advListType = AppListType;
  dateHelper = DateHelper;
  selectedListType = signal<AppListType>(AppListType.MyAdvertisements);
  busyService = inject(BusyService);
  datePipe = inject(DatePipe);
  Localization = Localization;

  ngOnInit(): void {
    // TODO refactor subscribe
    this.paramMapSubscription = this.route.paramMap.subscribe((params) => {
      this.selectedListType.set(params.get('state') as AppListType);

      this.initialize();
    });

    this.backButtonService.setBackButtonHandler(() => {
      if (this.selectedListType() === AppListType.PrivateHistory) {
        this.router.navigate(['/adv-list', this.advListType.MyAdvertisements]);
        this.initialize();
      } else this.router.navigate(['']);
    });
  }

  onItemClick(advertisement: Advertisement) {
    this.appStore.setSelectedAdvertisement(advertisement);
    this.router.navigate(['/app-advertisement-preview']);
  }

  onItemClickValidate(advertisement: Advertisement) {
    this.appStore.setSelectedAdvertisement(advertisement);
    this.router.navigate(['/app-advertisement-validate']);
  }

  handlePageEvent(e: PageEvent) {
    this.initialize(e.pageIndex);
  }

  private async initialize(pageNumber?: number, sortOption?: SortOption) {
    switch (this.selectedListType()) {
      case AppListType.PendingValidation: {
        await this.appStore.getPendingValidationAdvertisementsAsync(
          pageNumber,
          sortOption
        );
        this.advertisementsList.set(
          this.appStore.sortedPendingValidationAdvertisements()
        );
        this.pagination.set({
          ...this.appStore.pendingValidationPaginationParams(),
        });
        break;
      }
      case AppListType.AllHistory: {
        await this.appStore.getAdvertisementAllHistoryAsync(
          pageNumber,
          sortOption
        );
        this.advertisementsList.set(this.appStore.sortedAllHistory());
        this.pagination.set({ ...this.appStore.allHistoryPaginationParams() });
        break;
      }
      case AppListType.PrivateHistory: {
        await this.appStore.getAdvertisementPrivateHistoryAsync(
          pageNumber,
          sortOption
        );
        this.advertisementsList.set(this.appStore.sortedPrivateHistory());
        this.pagination.set({
          ...this.appStore.privateHistoryPaginationParams(),
        });
        break;
      }
      case AppListType.MyAdvertisements: {
        await this.appStore.getMyAdvertisementsAsync();
        this.advertisementsList.set(this.appStore.sortedMyAdvertisements());
        this.pagination.set({
          ...this.appStore.myAdvertisementsPaginationParams(),
        });
        break;
      }
      case AppListType.PendingPublication: {
        await this.appStore.getPendingPublicationAdvertisementsAsync(
          pageNumber,
          sortOption
        );
        this.advertisementsList.set(
          this.appStore.sortedPendingPublicationAdvertisements()
        );
        this.pagination.set({
          ...this.appStore.pendingPublicationPaginationParams(),
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  openPrivateHistory() {
    this.router.navigate(['/adv-list', this.advListType.PrivateHistory]);
  }

  getStatus(advertisement: Advertisement): string {
    switch (advertisement.statusId) {
      case AdvertisementStatus.new: {
        return this.Localization.getWord('new_status');
      }
      case AdvertisementStatus.pendingPublication: {
        return this.Localization.getWord('awaiting_publication');
      }
      case AdvertisementStatus.pendingValidation: {
        return this.Localization.getWord('under_review');
      }
      case AdvertisementStatus.rejected: {
        return this.Localization.getWord('rejected_status');
      }
      case AdvertisementStatus.validated: {
        return this.Localization.getWord('confirmed_status');
      }
      case AdvertisementStatus.published: {
        return this.Localization.getWord('published_status');
      }
    }
  }

  getCreationDate(advertisement: Advertisement): string {
    return `${this.Localization.getWord(
      'created_label'
    )} ${this.dateHelper.getLocalTime(advertisement.created)}`;
  }

  getUserDisplayName(advertisement: Advertisement): string {
    const userName = advertisement.userName ? `@${advertisement.userName}` : '';
    const firstName = advertisement.firstName ? advertisement.firstName : '';
    const lastName = advertisement.lastName ? advertisement.lastName : '';

    return `${userName} ${firstName || lastName}`.trim();
  }

  create() {
    const advertisement = {
      id: 0,
      userId: this.appStore.user()?.userId ?? 0,
      title: '',
      message: '',
      statusId: 0,
      adImage: undefined,
    };
    this.appStore.setSelectedAdvertisement(advertisement);
    this.router.navigate(['/app-advertisement-edit']);
  }

  sortChanged($event: SortOption) {
    //reset page number
    this.initialize(0, $event);
  }

  getListName(): string {
    switch (this.selectedListType()) {
      case AppListType.PendingValidation:
        return this.Localization.getWord('validate_title');
      case AppListType.MyAdvertisements:
        return this.Localization.getWord('my_ads_title');
      case AppListType.AllHistory:
        return this.Localization.getWord('history');
      case AppListType.PrivateHistory:
        return this.Localization.getWord('my_history');
      case AppListType.PendingPublication:
        return this.Localization.getWord('publishing_title');
      default:
        return '';
    }
  }

  trackByAdvertisementId(index: number, advertisement: any): number {
    return advertisement.id;
  }

  getShadowIconClass(advertisement: Advertisement): string {
    switch (advertisement.statusId) {
      case AdvertisementStatus.rejected:
        return 'icon-rejected-shadow';
      case AdvertisementStatus.pendingPublication:
        return 'icon-pending-publication-shadow';
      case AdvertisementStatus.validated:
        return 'icon-validated-shadow';
      default:
        return 'icon-default-shadow';
    }
  }

  getMatListItemHistoryInfo(advertisement: Advertisement): string {
    let result: string;

    if (
      this.selectedListType() === this.advListType.AllHistory ||
      this.selectedListType() === this.advListType.PrivateHistory
    ) {
      result = this.Localization.getWord('posted_label');
    } else {
      result = this.Localization.getWord('next_publication');
    }

    const formattedDate = this.datePipe.transform(
      advertisement.nextPublishDate,
      'dd.MM.yyyy'
    );

    return `${result} ${formattedDate}`;
  }

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
    this.paramMapSubscription.unsubscribe();
  }
}
