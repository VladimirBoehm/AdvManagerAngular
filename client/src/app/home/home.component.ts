import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdvertisementService } from '../_services/advertisement.service';
import { NgIf } from '@angular/common';
import { AdvListType } from '../_framework/constants/advListType';
import { SharedModule } from '../_framework/modules/sharedModule';
import { BusyService } from '../_services/busy.service';
import { AccountService } from '../_services/account.service';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SharedModule, RouterLink, NgIf, MatRippleModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  advListType = AdvListType;
  advertisementService = inject(AdvertisementService);
  busyService = inject(BusyService);
  accountService = inject(AccountService);


  advertisementsToValidateCount: number = 0;

  ngOnInit(): void {
    if (window.Telegram?.WebApp) {
      window.Telegram?.WebApp?.expand();
      window.Telegram?.WebApp?.BackButton?.hide();
    }
    this.advertisementService
      .getPendingValidationAdvertisementsCount()
      .subscribe({
        next: (result: number) => {
          this.advertisementsToValidateCount = result;
        },
        error: (err) => {
          console.error(
            'Error when loading PendingValidationAdvertisementsCount:',
            err
          );
        },
      });
  }
}
