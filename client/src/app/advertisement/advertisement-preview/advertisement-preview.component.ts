import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdvertisementService } from '../../_services/advertisement.service';
import { Advertisement } from '../../_models/advertisement';
import { MatCardModule } from '@angular/material/card';
import { Location } from '@angular/common';
import { TelegramBackButtonService } from '../../_framework/telegramBackButtonService';

@Component({
  selector: 'app-advertisement-preview',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './advertisement-preview.component.html',
  styleUrl: './advertisement-preview.component.scss',
})
export class AdvertisementPreviewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private backButtonService = inject(TelegramBackButtonService);
  advertisementId: number = 0;
  private advertisementService = inject(AdvertisementService);
  advertisement?: Advertisement;

  ngOnInit(): void {
    this.backButtonService.setBackButtonHandler(() => {
      console.log('AdvertisementPreviewComponent');
      console.log(this.location.getState);
      console.log(this.location);
      this.location.back();
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.advertisementService.getById(Number(id)).subscribe({
          next: (advertisement: Advertisement) => {
            this.advertisement = advertisement;
            console.log(advertisement);
          },
          error: (err) => {
            console.error('Error when loading ads:', err);
          },
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
  }
}
