import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdvertisementService } from '../../_services/advertisement.service';
import { Advertisement } from '../../_models/advertisement';
import { MatCardModule } from '@angular/material/card';
import { Location } from '@angular/common';

@Component({
  selector: 'app-advertisement-preview',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './advertisement-preview.component.html',
  styleUrl: './advertisement-preview.component.scss',
})
export class AdvertisementPreviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  advertisementId: number = 0;
  private advertisementService = inject(AdvertisementService);
  advertisement?: Advertisement;

  ngOnInit(): void {
    if (window.Telegram?.WebApp) {
      window.Telegram?.WebApp?.BackButton?.show();
      window.Telegram?.WebApp?.BackButton?.onClick(() => {
        //window.history.back();
        this.location.back();
        //this.router.(['../']);
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
  }
}
