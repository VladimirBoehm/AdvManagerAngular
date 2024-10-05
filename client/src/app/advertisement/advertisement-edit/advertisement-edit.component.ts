import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ConfirmModalComponent } from '../../_framework/component/confirm-modal/confirm-modal.component';
import { Advertisement } from '../../_models/advertisement';
import { AdvertisementService } from '../../_services/advertisement.service';
import { TelegramBackButtonService } from '../../_framework/telegramBackButtonService';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvListStates } from '../../_framework/constants/advListStates';
import { NgIf } from '@angular/common';
import { AdvertisementStatus } from '../../_framework/constants/advertisementStatus';
import { AccountService } from '../../_services/account.service';
import { AdvertisementMainDataComponent } from '../advertisement-main-data/advertisement-main-data.component';

@Component({
  selector: 'app-advertisement-edit',
  standalone: true,
  imports: [
    AdvertisementMainDataComponent,
    FormsModule,
    ConfirmModalComponent,
    NgIf,
  ],
  templateUrl: './advertisement-edit.component.html',
  styleUrl: './advertisement-edit.component.scss',
})
export class AdvertisementEditComponent implements OnInit {
  advertisement?: Advertisement;
  advertisementStatus = AdvertisementStatus;
  private backButtonService = inject(TelegramBackButtonService);
  private advertisementService = inject(AdvertisementService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  accountService = inject(AccountService);

  ngOnInit(): void {
    this.backButtonService.setBackButtonHandler(() => {
      this.back(false);
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.advertisementService.getById(Number(id)).subscribe({
          next: (advertisement: Advertisement) => {
            console.log(advertisement);
            this.advertisement = advertisement;
          },
          error: (err) => {
            console.error('Error when loading ads:', err);
          },
        });
      }
    });
  }

  private back(forceRefresh: boolean) {
    this.router.navigate([
      '/adv-list',
      AdvListStates.MyAdvertisements,
      forceRefresh,
    ]);
  }

  delete() {
    this.advertisementService.delete(this.advertisement?.id)?.subscribe({
      next: () => {
        this.back(false);
      },
      error: (err) => {
        console.error('Error when deleting ads:', err);
      },
    });
  }

  getDayWord(frequency: number): string {
    const lastDigit = frequency % 10;
    const lastTwoDigits = frequency % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'дней';
    }

    if (lastDigit === 1) {
      return 'день';
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'дня';
    }

    return 'дней';
  }
}
