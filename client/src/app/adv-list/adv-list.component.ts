import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdvListStates } from '../_framework/constants/advListStates';
import { AdvertisementService } from '../_services/advertisement.service';
import { Advertisement } from '../_models/advertisement';
import { DatePipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { TelegramBackButtonService } from '../_framework/telegramBackButtonService';
import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';
import { PaginationParams } from '../_models/paginationParams';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PaginatedResult } from '../_models/pagination';
import { SearchType } from '../_framework/constants/searchType';
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
    AdvListFilterComponent
  ],
  templateUrl: './adv-list.component.html',
  styleUrl: './adv-list.component.scss',
})
export class AdvListComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private advertisementService = inject(AdvertisementService);
  private backButtonService = inject(TelegramBackButtonService);
  private router = inject(Router);

  paginatedAdvertisements?: PaginatedResult<Advertisement[]>;
  advListStates = AdvListStates;
  dateHelper = DateHelper;

  state?: AdvListStates;
  paginationQueryObject: PaginationParams;
  length = 0; // items count

  constructor() {
    this.paginationQueryObject = {
      pageNumber: 0,
      pageSize: 5,
      sortOption: { field: 'date', order: 'desc' },
    } as PaginationParams;
  }

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
    this.paginationQueryObject.pageSize = e.pageSize;
    this.paginationQueryObject.pageNumber = e.pageIndex;
    this.initialize();
  }

  private initialize() {
    switch (this.state) {
      case AdvListStates.Validate: {
        this.paginationQueryObject.searchType = SearchType.PendingValidation;
        this.advertisementService
          .getPendingValidationAdvertisements(this.paginationQueryObject)
          .subscribe({
            next: (advertisements: PaginatedResult<Advertisement[]>) => {
              this.setPaginatedResult(advertisements);
            },
            error: (err) => {
              console.error('Error when loading ads:', err);
            },
          });
        break;
      }
      case AdvListStates.AllHistory: {
        this.paginationQueryObject.searchType = SearchType.AllHistory;
        this.advertisementService
          .getAllAdvertisementHistory(this.paginationQueryObject)
          .subscribe({
            next: (advertisements: PaginatedResult<Advertisement[]>) => {
              this.setPaginatedResult(advertisements);
            },
            error: (err) => {
              console.error('Error when loading ads:', err);
            },
          });

        break;
      }
      case AdvListStates.PrivateHistory: {
        this.paginationQueryObject.searchType = SearchType.PrivateHistory;
        this.advertisementService
          .getPrivateAdvertisementHistory(this.paginationQueryObject)
          .subscribe({
            next: (advertisements: PaginatedResult<Advertisement[]>) => {
              this.setPaginatedResult(advertisements);
            },
            error: (err) => {
              console.error('Error when loading ads:', err);
            },
          });

        break;
      }
      case AdvListStates.MyAdvertisements: {
        this.paginationQueryObject.searchType = SearchType.MyAdvertisements;
        this.advertisementService
          .getMyAdvertisements(this.paginationQueryObject)
          .subscribe({
            next: (advertisements: PaginatedResult<Advertisement[]>) => {
              this.setPaginatedResult(advertisements);
            },
            error: (err) => {
              console.error('Error when loading ads:', err);
            },
          });
        break;
      }
      case AdvListStates.Publishing: {
        this.paginationQueryObject.searchType = SearchType.PendingPublication;
        this.advertisementService
          .getPendingPublicationAdvertisements(this.paginationQueryObject)
          .subscribe({
            next: (advertisements: PaginatedResult<Advertisement[]>) => {
              this.setPaginatedResult(advertisements);
            },
            error: (err) => {
              console.error('Error when loading ads:', err);
            },
          });
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

  private setPaginatedResult(
    paginatedResult: PaginatedResult<Advertisement[]>
  ) {
    this.paginatedAdvertisements = paginatedResult;
    this.length = paginatedResult.pagination?.totalItems ?? 0;
    this.paginationQueryObject.pageSize =
      paginatedResult.pagination?.itemsPerPage ?? 1;
    this.paginationQueryObject.pageNumber =
      paginatedResult.pagination?.currentPage ?? 0;
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
    this.paginationQueryObject.sortOption = $event;
    this.initialize();
  }

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
  }
}
