import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TelegramBackButtonService } from '../../_services/telegramBackButton.service';
import { AppStore } from '../../appStore/app.store';
import { Router } from '@angular/router';
import { Advertisement } from '../../_models/advertisement';
import { AdvertisementStatus } from '../../_framework/constants/advertisementStatus';
import { Localization } from '../../_framework/component/helpers/localization';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { EmptyListPlaceholderComponent } from '../../_framework/component/empty-list-placeholder/empty-list-placeholder.component';
import { DateHelper } from '../../_framework/component/helpers/dateHelper';
import { AdvListHelper } from '../adv-list.helper';
import { AppListType } from '../../_framework/constants/advListType';

@Component({
  selector: 'app-adv-list-my-advertisements',
  standalone: true,
  imports: [SharedModule, EmptyListPlaceholderComponent],
  templateUrl: './adv-list-my-advertisements.component.html',
  styleUrl: './adv-list-my-advertisements.component.scss',
})
export class AdvListMyAdvertisementsComponent implements OnInit, OnDestroy {
  private backButtonService = inject(TelegramBackButtonService);
  readonly appStore = inject(AppStore);
  private router = inject(Router);

  advListHelper = inject(AdvListHelper);
  Localization = Localization;
  dateHelper = DateHelper;
  isLoading = signal(false);

  async ngOnInit() {
    this.appStore.setSelectedAppListType(AppListType.MyAdvertisements);
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigateByUrl('');
    });
    this.isLoading.set(true);
    await this.appStore.getMyAdvertisementsAsync();
    this.isLoading.set(false);
  }

  getStatus(advertisement: Advertisement): string {
    switch (advertisement.statusId) {
      case AdvertisementStatus.new: {
        return this.Localization.getWord('new_status');
      }
      case AdvertisementStatus.pendingPublication: {
        return this.Localization.getWord('awaiting_publication');
      }
      case AdvertisementStatus.pendingValidation: {
        return this.Localization.getWord('under_review');
      }
      case AdvertisementStatus.rejected: {
        return this.Localization.getWord('rejected_status');
      }
      case AdvertisementStatus.validated: {
        return this.Localization.getWord('confirmed_status');
      }
      case AdvertisementStatus.published: {
        return this.Localization.getWord('published_status');
      }
    }
  }

  openPrivateHistory() {
    this.router.navigateByUrl('app-adv-list-private-history');
  }

  create() {
    const advertisement = {
      id: 0,
      userId: this.appStore.user()?.userId ?? 0,
      title: '',
      message: '',
      statusId: 0,
      adImage: undefined,
    };
    this.appStore.setSelectedAdvertisement(advertisement);
    this.router.navigateByUrl('/app-advertisement-edit');
  }

  getCreationDate(advertisement: Advertisement): string {
    return `${this.Localization.getWord(
      'created_label'
    )} ${this.dateHelper.getLocalTime(advertisement.created)}`;
  }

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
  }
}
