import { Component, inject } from '@angular/core';
import { AdvertisementPreviewComponent } from '../advertisement-preview/advertisement-preview.component';
import { Location } from '@angular/common';
import { AdvertisementService } from '../../_services/advertisement.service';
import { Advertisement } from '../../_models/advertisement';
import { TelegramBackButtonService } from '../../_framework/telegramBackButtonService';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-advertisement-validate',
  standalone: true,
  imports: [AdvertisementPreviewComponent],
  templateUrl: './advertisement-validate.component.html',
  styleUrl: './advertisement-validate.component.scss'
})
export class AdvertisementValidateComponent {
  private location = inject(Location);
  private backButtonService = inject(TelegramBackButtonService);
  private route = inject(ActivatedRoute);
  advertisementId: number = 0;
  private advertisementService = inject(AdvertisementService);
  advertisement?: Advertisement;

  ngOnInit(): void {
    this.backButtonService.setBackButtonHandler(() => {
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
