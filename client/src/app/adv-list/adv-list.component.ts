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
  state: AdvListStates | undefined;

  //Paging
  length = 0; // items count
  pageSize = 5;
  pageIndex = 0;

  ngOnInit(): void {
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigate(['']);
    });

    this.route.paramMap.subscribe((params) => {
      this.state = params.get('state') as AdvListStates;
    });
    this.initialize();
  }

  handlePageEvent(e: PageEvent) {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;

    this.initialize();
  }

  private initialize() {
    const paginationQueryObject = {
      pageNumber: this.pageIndex,
      pageSize: this.pageSize,
    } as PaginationParams;

    switch (this.state) {
      case AdvListStates.Validate: {
        paginationQueryObject.searchType = SearchType.PendingValidation;
        this.advertisementService
          .getPendingValidationAdvertisements(paginationQueryObject)
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
        paginationQueryObject.searchType = SearchType.AllHistory;
        this.advertisementService
          .getAllAdvertisementHistory(paginationQueryObject)
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
        break;
      }
      case AdvListStates.MyAdvertisements: {
        this.advertisementService.getMyAdvertisements().subscribe({
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
        break;
      }
      default: {
        break;
      }
    }
  }

  private setPaginatedResult(advertisements: PaginatedResult<Advertisement[]>) {
    this.paginatedAdvertisements = advertisements;
    this.length = advertisements.pagination?.totalItems ?? 0;
    this.pageSize = advertisements.pagination?.itemsPerPage ?? 1;
    this.pageIndex = advertisements.pagination?.currentPage ?? 0;
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

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
  }
}
