import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdvListStates } from '../_framework/constants/advListStates';
import { AdvertisementService } from '../_services/advertisement.service';
import { Advertisement } from '../_models/advertisement';
import { NgFor, NgIf } from '@angular/common';
import { TelegramBackButtonService } from '../_framework/telegramBackButtonService';
import { Location } from '@angular/common';
@Component({
  selector: 'app-adv-list',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './adv-list.component.html',
  styleUrl: './adv-list.component.scss',
})
export class AdvListComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private advertisementService = inject(AdvertisementService);
  private backButtonService = inject(TelegramBackButtonService);
  advertisements: Advertisement[] = [];

  state: AdvListStates | undefined;

  ngOnInit(): void {
    // this.backButtonService.setBackButtonHandler(() => {
    //   console.log("AdvListStates");
    //   console.log(this.location.getState);
    //   console.log(this.location);
    //   this.location.back();
    // });

    this.route.paramMap.subscribe((params) => {
      this.state = params.get('state') as AdvListStates;
    });
    this.initialize();
  }

  private initialize() {
    switch (this.state) {
      case AdvListStates.Validate: {
        this.advertisementService
          .getPendingValidationAdvertisements()
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

  getUserDisplayName(advertisement: Advertisement): string {
    const userName = advertisement.userName ? `@${advertisement.userName}` : '';
    const firstName = advertisement.firstName ? advertisement.firstName : '';
    const lastName = advertisement.lastName ? advertisement.lastName : '';

    return `${userName} ${firstName || lastName}`.trim();
  }

  ngOnDestroy(): void {
   // this.backButtonService.removeBackButtonHandler();
  }
}
