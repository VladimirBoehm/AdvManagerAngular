import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdvListStates } from '../_framework/constants/advListStates';
import { AdvertisementService } from '../_services/advertisement.service';
import { Advertisement } from '../_models/advertisement';
import { DatePipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { TelegramBackButtonService } from '../_framework/telegramBackButtonService';
import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';
import { PaginationQueryObject } from '../_models/paginationQueryObject';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

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
  ],
  templateUrl: './adv-list.component.html',
  styleUrl: './adv-list.component.scss',
})
export class AdvListComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private advertisementService = inject(AdvertisementService);
  private backButtonService = inject(TelegramBackButtonService);
  private forceRefresh: boolean = false;
  private router = inject(Router);
  advertisements: Advertisement[] = [];
  advListStates = AdvListStates;
  state: AdvListStates | undefined;

  //Paging
  length = 50;
  pageSize = 10;
  pageIndex = 0;
  pageEvent?: PageEvent;

  ngOnInit(): void {
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigate(['']);
    });

    this.route.paramMap.subscribe((params) => {
      this.state = params.get('state') as AdvListStates;
      this.forceRefresh = params.get('forceRefresh') === 'true';
    });
    this.initialize();
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
  }

  private initialize() {
    switch (this.state) {
      case AdvListStates.Validate: {
        this.advertisementService
          .getPendingValidationAdvertisements(this.forceRefresh)
          .subscribe({
            next: (advertisements: Advertisement[]) =>
              (this.advertisements = advertisements),
            error: (err) => {
              console.error('Error when loading ads:', err);
            },
          });
        break;
      }
      case AdvListStates.AllHistory: {
        let paginationQueryObject = {
          pageNumber: 1,
          pageSize: 10,
        } as PaginationQueryObject;

        this.advertisementService
          .getAllAdvertisementHistory(paginationQueryObject, this.forceRefresh)
          .subscribe({
            next: (advertisements: Advertisement[]) => {
              this.advertisements = advertisements;
              console.log(advertisements);
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
        this.advertisementService
          .getMyAdvertisements(this.forceRefresh)
          .subscribe({
            next: (advertisements: Advertisement[]) =>
              (this.advertisements = advertisements),
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
