import { Component, inject, model, OnDestroy, OnInit, signal } from '@angular/core';
import {
  ActivatedRoute,
  NavigationStart,
  Router,
  RouterLink,
} from '@angular/router';
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
import { PaginatedResult } from '../_models/pagination';
import { AdvListType } from '../_framework/constants/advListType';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TestMatDialogComponent } from '../_framework/component/test-mat-dialog/test-mat-dialog.component';

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
    MatButtonModule
  ],

  templateUrl: './adv-list.component.html',
  styleUrl: './adv-list.component.scss',
})
export class AdvListComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private backButtonService = inject(TelegramBackButtonService);
  private router = inject(Router);
  advertisementService = inject(AdvertisementService);
  advListType = AdvListType;
  dateHelper = DateHelper;
  selectedListType!: AdvListType;
  private routerSubscription!: Subscription;
  ngOnInit(): void {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (event.navigationTrigger === 'popstate') {
          this.advertisementService.resetPaginationParams(
            this.selectedListType
          );
        }
      }
    });

    this.route.paramMap.subscribe((params) => {
      this.selectedListType = params.get('state') as AdvListType;
    });

    this.backButtonService.setBackButtonHandler(() => {
      this.advertisementService.resetPaginationParams(this.selectedListType);

      if (this.selectedListType === AdvListType.PrivateHistory) {
        this.selectedListType = AdvListType.MyAdvertisements;
        this.initialize();
      } else this.router.navigate(['']);
    });

    this.initialize();
  }


  //////////////////////////////////////////////////////////////////////////

dialog = inject(MatDialog);

selectedDate = model<Date | null>(null);

openDialog() {
  const dialogRef = this.dialog.open(TestMatDialogComponent, {
    data: {selectedDate: this.selectedDate()},
  });

  dialogRef.afterClosed().subscribe(result => {
    this.selectedDate.set(result);
  });
}










//////////////////////////////////////////////////////////////////////////



  handlePageEvent(e: PageEvent) {
    this.advertisementService.updatePaginationParams(
      this.selectedListType,
      e.pageSize,
      e.pageIndex
    );
    this.initialize();
  }

  private initialize() {
    this.advertisementService.advertisements.set(
      new PaginatedResult<Advertisement[]>()
    );
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
    this.selectedListType = AdvListType.PrivateHistory;
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
    //reset page number
    this.advertisementService.updatePaginationParams(
      this.selectedListType,
      undefined,
      0,
      undefined,
      $event
    );
    this.initialize();
  }

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
