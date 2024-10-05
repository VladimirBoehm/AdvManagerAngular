import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdvListStates } from '../_framework/constants/advListStates';
import { AdvertisementService } from '../_services/advertisement.service';
import { Advertisement } from '../_models/advertisement';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { TelegramBackButtonService } from '../_framework/telegramBackButtonService';
import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';

@Component({
  selector: 'app-adv-list',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, NgTemplateOutlet],
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
      case AdvListStates.History: {
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
        return "Новый"
      }
      case AdvertisementStatus.pendingPublication: {
        return "Ожидает публикации"
      }
      case AdvertisementStatus.pendingValidation: {
        return "На рассмотрении"
      }
      case AdvertisementStatus.rejected: {
       return "Отклонён"
      }
      case AdvertisementStatus.validated: {
        return "Одобрен"
      }
    }
  }

  getUserDisplayName(advertisement: Advertisement): string {
    const userName = advertisement.userName ? `@${advertisement.userName}` : '';
    const firstName = advertisement.firstName ? advertisement.firstName : '';
    const lastName = advertisement.lastName ? advertisement.lastName : '';

    return `${userName} ${firstName || lastName}`.trim();
  }

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
  }
}
