import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdvertisementService } from '../_services/advertisement.service';
import { AdvListType } from '../_framework/constants/advListType';
import { SharedModule } from '../_framework/modules/sharedModule';
import { BusyService } from '../_services/busy.service';
import { Localization } from '../_framework/component/helpers/localization';
import { ImpressumComponent } from './impressum/impressum.component';
import { AppStore } from '../app.store';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SharedModule, RouterLink, ImpressumComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  advListType = AdvListType;
  advertisementService = inject(AdvertisementService);
  busyService = inject(BusyService);
  readonly appStore = inject(AppStore);
  Localization = Localization;

  isImpressumInfoShown = signal<boolean>(false);

  constructor() {
    this.onImpressumClose = this.onImpressumClose.bind(this);
  }

  ngOnInit(): void {
    this.appStore.getPendingValidationAdvertisementsCount();
    if (window.Telegram?.WebApp) {
      window.Telegram?.WebApp?.expand();
      window.Telegram?.WebApp?.BackButton?.hide();
    }
  }

  onImpressumClick() {
    this.isImpressumInfoShown.set(true);
  }

  onImpressumClose() {
    this.isImpressumInfoShown.set(false);
  }
}
