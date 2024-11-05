import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-adv-list',
  standalone: true,
  imports: [SharedModule, ListFilterComponent, EmptyListPlaceholderComponent],
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
  selectedListType!: AdvListType;
  busyService = inject(BusyService);

  ngOnInit(): void {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (event.navigationTrigger === 'popstate') {
          this.advertisementService.resetPaginationParams();
        }
      }
    });

    this.paramMapSubscription = this.route.paramMap.subscribe((params) => {
      this.selectedListType = params.get('state') as AdvListType;

      this.initialize();
    });

    this.backButtonService.setBackButtonHandler(() => {
      this.advertisementService.resetPaginationParams();

      if (this.selectedListType === AdvListType.PrivateHistory) {
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
      this.selectedListType,
      e.pageSize,
      e.pageIndex
    );
    this.initialize();
  }

  private initialize() {
    switch (this.selectedListType) {
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
        return 'Новый';
      }
      case AdvertisementStatus.pendingPublication: {
        return 'Ожидает размещения';
      }
      case AdvertisementStatus.pendingValidation: {
        return 'На рассмотрении';
      }
      case AdvertisementStatus.rejected: {
        return 'Отклонён';
      }
      case AdvertisementStatus.validated: {
        return 'Подтверждён';
      }
      case AdvertisementStatus.published: {
        return 'Размещён';
      }
    }
  }

  getCreationDate(advertisement: Advertisement) {
    return `Создан: ${this.dateHelper.getLocalTime(advertisement.created)}`;
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
      this.selectedListType,
      undefined,
      0,
      $event
    );
    this.initialize();
  }

  getListName(): string {
    switch (this.selectedListType) {
      case AdvListType.PendingValidation:
        return 'Валидировать';
      case AdvListType.MyAdvertisements:
        return 'Мои объявления';
      case AdvListType.AllHistory:
        return 'История';
      case AdvListType.PrivateHistory:
        return 'Моя история';
      case AdvListType.PendingPublication:
        return 'Размещается';
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

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.paramMapSubscription.unsubscribe();
  }
}
