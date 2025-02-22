import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Advertisement } from '../_models/advertisement';
import { AppStore } from '../appStore/app.store';
import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';
import { Localization } from '../_framework/component/helpers/localization';
import { DateHelper } from '../_framework/component/helpers/dateHelper';
import { DatePipe } from '@angular/common';

export class AdvListHelper {
  readonly appStore = inject(AppStore);
  private router = inject(Router);
  Localization = Localization;
  dateHelper = DateHelper;
  private datePipe = inject(DatePipe);

  onItemClick(advertisement: Advertisement): void {
    this.appStore.setSelectedAdvertisement(advertisement);
    this.router.navigateByUrl('/app-advertisement-preview');
  }

  getUserDisplayName(advertisement: Advertisement): string {
    const userName = advertisement.userName ? `@${advertisement.userName}` : '';
    const firstName = advertisement.firstName ? advertisement.firstName : '';
    const lastName = advertisement.lastName ? advertisement.lastName : '';

    return `${userName} ${firstName || lastName}`.trim();
  }

  getAdvStatusIcon(advertisement: Advertisement): string {
    switch (advertisement.statusId) {
      case AdvertisementStatus.pendingPublication:
        return '/icons/adv-pending-publication.svg';
      case AdvertisementStatus.pendingValidation:
        return '/icons/adv-pending-validation.svg';
      case AdvertisementStatus.rejected:
        return '/icons/adv-rejected.svg';
      case AdvertisementStatus.validated:
        return '/icons/adv-validated.svg';

      default:
        return '/icons/adv-new.svg';
    }
  }

  getMatListItemHistoryInfo(advertisement: Advertisement): string {
    const formattedDate = this.datePipe.transform(
      advertisement.nextPublishDate,
      'dd.MM.yyyy'
    );

    return `${this.Localization.getWord('posted_label')} ${formattedDate}`;
  }
}
