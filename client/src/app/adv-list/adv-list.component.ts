import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdvListStates } from '../_framework/constants/advListStates';
import { TelegramBaseComponent } from '../_framework/telegramBaseComponent';
import { AdvertisementService } from '../_services/advertisement.service';
import { Advertisement } from '../_models/advertisement';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-adv-list',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './adv-list.component.html',
  styleUrl: './adv-list.component.scss',
})
export class AdvListComponent extends TelegramBaseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private advertisementService = inject(AdvertisementService);
  advertisements: Advertisement[] = [];

  state: AdvListStates | undefined;

  override ngOnInit(): void {
    super.ngOnInit();
    
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
}
