import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdvertisementService } from '../_services/advertisement.service';
import { NgIf } from '@angular/common';
import { AdvListType } from '../_framework/constants/advListType';
import { SharedModule } from '../_framework/modules/sharedModule';
import { BusyService } from '../_services/busy.service';
import { AccountService } from '../_services/account.service';
import { MatRippleModule } from '@angular/material/core';
import { EMPTY, switchMap } from 'rxjs';
import { User } from '../_models/user';
import { SkeletonFullScreenComponent } from '../_framework/component/skeleton-full-screen/skeleton-full-screen.component';
import { Localization } from '../_framework/component/helpers/localization';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SharedModule,
    RouterLink,
    NgIf,
    MatRippleModule,
    SkeletonFullScreenComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  advListType = AdvListType;
  advertisementService = inject(AdvertisementService);
  busyService = inject(BusyService);
  accountService = inject(AccountService);
  advertisementsToValidateCount: number = 0;
  Localization = Localization;
  testUserLanguage?: string;
  
  constructor() {
    this.accountService
      .login()
      .pipe(
        switchMap((user: User) => {
          if (user.isAdmin) {
            return this.advertisementService.getPendingValidationAdvertisementsCount();
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe({
        next: (result: number) => {
          this.advertisementsToValidateCount = result;
        },
        error: (err) => {
          console.error(
            'Error during login or loading PendingValidationAdvertisementsCount:',
            err
          );
        },
      });
  }

  ngOnInit(): void {
    this.testUserLanguage = window.Telegram?.WebApp?.WebAppUser?.language_code;
    if (window.Telegram?.WebApp) {
      window.Telegram?.WebApp?.expand();
      window.Telegram?.WebApp?.BackButton?.hide();
    }
  }
}
