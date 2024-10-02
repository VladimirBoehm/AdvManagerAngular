import { Component, inject, OnInit } from '@angular/core';
import { TelegramBaseComponent } from '../../_framework/telegramBaseComponent';
import { ActivatedRoute } from '@angular/router';
import { AdvertisementService } from '../../_services/advertisement.service';
import { Advertisement } from '../../_models/advertisement';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-advertisement-preview',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './advertisement-preview.component.html',
  styleUrl: './advertisement-preview.component.scss',
})
export class AdvertisementPreviewComponent
  extends TelegramBaseComponent
  implements OnInit
{
  private route = inject(ActivatedRoute);
  advertisementId: number = 0;
  private advertisementService = inject(AdvertisementService);
  advertisement?: Advertisement;

  override ngOnInit(): void {
    super.ngOnInit();

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
}
