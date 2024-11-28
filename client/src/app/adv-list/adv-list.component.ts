import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { AdvertisementService } from '../_services/advertisement.service';
import { Advertisement } from '../_models/advertisement';
import { TelegramBackButtonService } from '../_framework/telegramBackButtonService';
import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';
import { SortOption } from '../_models/sortOption';
import { DateHelper } from '../_framework/component/helpers/dateHelper';
import { AdvListType } from '../_framework/constants/advListType';
import { Subscription } from 'rxjs';
import { BusyService } from '../_services/busy.service';
import { SharedModule } from '../_framework/modules/sharedModule';
import { PageEvent } from '@angular/material/paginator';
import { ListFilterComponent } from '../_framework/component/adv-list-filter/list-filter.component';
import { EmptyListPlaceholderComponent } from '../_framework/component/empty-list-placeholder/empty-list-placeholder.component';
import { DatePipe } from '@angular/common';
import { SkeletonFullScreenComponent } from '../_framework/component/skeleton-full-screen/skeleton-full-screen.component';
import { Localization } from '../_framework/component/helpers/localization';

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
  private routerSubscription!: Subscription;
  private paramMapSubscription!: Subscription;

  advertisementService = inject(AdvertisementService);
  advListType = AdvListType;
  dateHelper = DateHelper;
  selectedListType = signal<AdvListType>(AdvListType.MyAdvertisements);
  busyService = inject(BusyService);
  datePipe = inject(DatePipe);
  Localization = Localization;

  ngOnInit(): void {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (event.navigationTrigger === 'popstate') {
          this.advertisementService.resetPaginationParams();
        }
      }
    });

    this.paramMapSubscription = this.route.paramMap.subscribe((params) => {
      this.selectedListType.set(params.get('state') as AdvListType);

      this.initialize();
    });

    this.backButtonService.setBackButtonHandler(() => {
      this.advertisementService.resetPaginationParams();

      if (this.selectedListType() === AdvListType.PrivateHistory) {
        this.router.navigate(['/adv-list', this.advListType.MyAdvertisements]);
        this.initialize();
      } else this.router.navigate(['']);
    });
  }

  onItemClick(advertisementId: number) {
    this.router.navigate(['/app-advertisement-preview', advertisementId]);
  }

  onItemClickValidate(advertisementId: number) {
    this.router.navigate(['/app-advertisement-validate', advertisementId]);
  }

  handlePageEvent(e: PageEvent) {
    this.advertisementService.updatePaginationParams(
      this.selectedListType(),
      e.pageSize,
      e.pageIndex
    );
    this.initialize();
  }

  private initialize() {
    switch (this.selectedListType()) {
      case AdvListType.PendingValidation: {
        this.advertisementService.getPendingValidationAdvertisements();
        break;
      }
      case AdvListType.AllHistory: {
        this.advertisementService.getAllAdvertisementHistory();
        break;
      }
      case AdvListType.PrivateHistory: {
        this.advertisementService.getPrivateAdvertisementHistory();
        break;
      }
      case AdvListType.MyAdvertisements: {
        this.advertisementService.getMyAdvertisements();
        break;
      }
      case AdvListType.PendingPublication: {
        this.advertisementService.getPendingPublicationAdvertisements();
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
    this.router.navigate(['/app-advertisement-edit', 0]);
  }

  sortChanged($event: SortOption) {
    //reset page number
    this.advertisementService.updatePaginationParams(
      this.selectedListType(),
      undefined,
      0,
      $event
    );
    this.initialize();
  }

  getListName(): string {
    switch (this.selectedListType()) {
      case AdvListType.PendingValidation:
        return this.Localization.getWord('validate_title');
      case AdvListType.MyAdvertisements:
        return this.Localization.getWord('my_ads_title');
      case AdvListType.AllHistory:
        return this.Localization.getWord('history');
      case AdvListType.PrivateHistory:
        return this.Localization.getWord('my_history');
      case AdvListType.PendingPublication:
        return this.Localization.getWord('publishing_title');
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
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.paramMapSubscription.unsubscribe();
  }
}
