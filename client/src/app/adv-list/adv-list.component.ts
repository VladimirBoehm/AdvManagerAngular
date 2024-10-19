import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdvListStates } from '../_framework/constants/advListStates';
import { AdvertisementService } from '../_services/advertisement.service';
import { Advertisement } from '../_models/advertisement';
import { DatePipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { TelegramBackButtonService } from '../_framework/telegramBackButtonService';
import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PaginatorLocalization } from '../_framework/component/paginator/paginator-localization';
import { AdvListFilterComponent } from '../_framework/component/adv-list-filter/adv-list-filter.component';
import { SortOption } from '../_models/sortOption';
import { DateHelper } from '../_framework/component/helpers/dateHelper';

@Component({
  selector: 'app-adv-list',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    RouterLink,
    NgTemplateOutlet,
    DatePipe,
    MatPaginatorModule,
    PaginatorLocalization,
    AdvListFilterComponent,
  ],
  templateUrl: './adv-list.component.html',
  styleUrl: './adv-list.component.scss',
})
export class AdvListComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private backButtonService = inject(TelegramBackButtonService);
  private router = inject(Router);
  advertisementService = inject(AdvertisementService);
  advListStates = AdvListStates;
  dateHelper = DateHelper;
  state?: AdvListStates;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.state = params.get('state') as AdvListStates;
    });

    this.backButtonService.setBackButtonHandler(() => {
      if (this.state === AdvListStates.PrivateHistory) {
        this.state = AdvListStates.MyAdvertisements;
        this.initialize();
      } else this.router.navigate(['']);
    });

    this.initialize();
  }

  handlePageEvent(e: PageEvent) {
    this.advertisementService.updatePaginationParams(e.pageSize, e.pageIndex);
    this.initialize();
  }

  private initialize() {
    switch (this.state) {
      case AdvListStates.Validate: {
        this.advertisementService.getPendingValidationAdvertisements();
        break;
      }
      case AdvListStates.AllHistory: {
        this.advertisementService.getAllAdvertisementHistory();
        break;
      }
      case AdvListStates.PrivateHistory: {
        this.advertisementService.getPrivateAdvertisementHistory();
        break;
      }
      case AdvListStates.MyAdvertisements: {
        this.advertisementService.getMyAdvertisements();
        break;
      }
      case AdvListStates.Publishing: {
        this.advertisementService.getPendingPublicationAdvertisements();
        break;
      }
      default: {
        break;
      }
    }
  }

  openPrivateHistory() {
    this.state = AdvListStates.PrivateHistory;
    this.initialize();
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
    this.advertisementService.updatePaginationParams(
      undefined,
      0,
      undefined,
      undefined,
      $event
    );
    this.initialize();
  }

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
  }
}
