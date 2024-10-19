import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AdvertisementService } from '../_services/advertisement.service';
import { NgIf } from '@angular/common';
import { AdvListType } from '../_framework/constants/advListType';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatIconModule, NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  advListType = AdvListType;
  advertisementService = inject(AdvertisementService);
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
