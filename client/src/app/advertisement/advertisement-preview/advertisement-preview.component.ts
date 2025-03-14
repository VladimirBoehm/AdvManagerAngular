import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TelegramBackButtonService } from '../../_services/telegramBackButton.service';
import { Router } from '@angular/router';
import { AdvertisementStatus } from '../../_framework/constants/advertisementStatus';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AdvertisementHelper } from '../../_framework/component/helpers/advertisementHelper';
import { AppListType } from '../../_framework/constants/advListType';
import { DateHelper } from '../../_framework/component/helpers/dateHelper';
import { ConfirmationMatDialogService } from '../../_services/confirmation-mat-dialog.service';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { AdvertisementMainDataComponent } from '../advertisement-main-data/advertisement-main-data.component';
import { BusyService } from '../../_services/busy.service';
import { Localization } from '../../_framework/component/helpers/localization';
import { AppStore } from '../../appStore/app.store';
import { PublicationInfoDialog } from './dialogs/publication-Info.dialog';
import { CancelPublicationAdminDialog } from './dialogs/cancel-publication-admin.dialog';
import { ForcePublicationAdminDialog } from './dialogs/force-publication-admin.dialog';
import { FileService } from '../../appStore/file.service';
import { TextFieldModule } from '@angular/cdk/text-field';
@Component({
  selector: 'app-advertisement-preview',
  standalone: true,
  imports: [
    SharedModule,
    AdvertisementMainDataComponent,
    PublicationInfoDialog,
    CancelPublicationAdminDialog,
    ForcePublicationAdminDialog,
  ],
  templateUrl: './advertisement-preview.component.html',
  styleUrl: './advertisement-preview.component.scss',
})
export class AdvertisementPreviewComponent implements OnInit, OnDestroy {
  @ViewChild('modalDialogPublicationInfo') modalDialogPublicationInfo?: any;
  @ViewChild('modalDialogForcePublicationAdmin')
  modalDialogForcePublicationAdmin?: any;
  @ViewChild('modalDialogCancelPublicationAdmin')
  modalDialogCancelPublicationAdmin?: any;

  private backButtonService = inject(TelegramBackButtonService);
  private modalService = inject(BsModalService);
  private router = inject(Router);
  readonly appStore = inject(AppStore);
  private fileService = inject(FileService);

  advertisementHelper = inject(AdvertisementHelper);
  confirmationService = inject(ConfirmationMatDialogService);
  busyService = inject(BusyService);

  advertisementStatus = AdvertisementStatus;
  advListType = AppListType;
  dateHelper = DateHelper;
  modalRef?: BsModalRef;
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  Localization = Localization;

  ngOnInit(): void {
    this.backButtonService.setCloseDialogHandler(() => this.modalRef?.hide());
    this.backButtonService.setBackButtonHandler(() => {
      this.back();
    });
  }

  shouldShowCancelButton(): boolean {
    return (
      this.appStore.user()?.isAdmin ||
      this.appStore.user()?.userId ===
        this.appStore.selectedAdvertisement()?.userId
    );
  }

  edit() {
    this.fileService.deleteAll();
    this.router.navigateByUrl('/app-advertisement-edit');
  }

  delete() {
    this.confirmationService
      .confirmDialog({
        title: this.Localization.getWord('delete_advertisement_question'),
        confirmText: this.Localization.getWord('yes'),
        cancelText: this.Localization.getWord('no'),
      })
      .subscribe((result) => {
        if (result === true) {
          this.modalDialogDeleteConfirm();
        }
      });
  }

  publishDialogShow() {
    this.modalRef = this.modalService.show(this.modalDialogPublicationInfo);
  }

  cancelPublicationAdmin = (
    shouldRejectValidation: boolean,
    adminComment?: string
  ) => {
    this.appStore.cancelPublicationAdmin(shouldRejectValidation, adminComment);
    this.modalRef?.hide();
    this.back();
  };

  forcePublication = (adminComment?: string) => {
    this.appStore.forcePublicationAdmin(adminComment);
    this.modalRef?.hide();
    this.back();
  };

  forcePublicationDialogShow() {
    this.modalRef = this.modalService.show(
      this.modalDialogForcePublicationAdmin
    );
  }

  sendToValidateDialogShow() {
    this.confirmationService
      .confirmDialog({
        title: this.Localization.getWord('send_for_validation_question'),
        message: this.Localization.getWord(
          'advertisement_will_be_sent_for_confirmation'
        ),
        confirmText: this.Localization.getWord('yes'),
        cancelText: this.Localization.getWord('no'),
      })
      .subscribe((result) => {
        if (result === true) {
          this.modalDialogValidateConfirm();
        }
      });
  }

  modalDialogDeleteConfirm() {
    this.modalRef?.hide();
    this.appStore.deleteAdvertisement(
      this.appStore.selectedAdvertisement()?.id ?? 0
    );
    this.back();
  }

  cancelPublication() {
    this.appStore.cancelPublication();
    this.modalRef?.hide();
  }

  cancelPublicationDialogShow() {
    if (
      this.appStore.user()?.userId ===
      this.appStore.selectedAdvertisement()?.userId
    ) {
      this.confirmationService
        .confirmDialog({
          title: this.Localization.getWord('cancel_publication_question'),
          confirmText: this.Localization.getWord('yes'),
          cancelText: this.Localization.getWord('no'),
        })
        .subscribe((result) => {
          if (result === true) {
            this.cancelPublication();
          }
        });
    } else if (this.shouldShowAdminButtons())
      this.modalRef = this.modalService.show(
        this.modalDialogCancelPublicationAdmin
      );
  }

  modalDialogValidateConfirm() {
    this.modalRef?.hide();
    this.appStore.sendToValidationAsync();
  }

  modalDialogPublishConfirm = (nextPublishDate: Date) => {
    this.appStore.confirmPublication(nextPublishDate);
    this.modalRef?.hide();
  };

  getDayWord(frequency: number): string {
    const lastDigit = frequency % 10;
    const lastTwoDigits = frequency % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return this.Localization.getWord('days_plural');
    }
    if (lastDigit === 1) {
      return this.Localization.getWord('day_singular');
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return this.Localization.getWord('days_few');
    }
    return this.Localization.getWord('days_plural');
  }

  shouldShowAdminButtons(): boolean {
    if (
      this.appStore.selectedAdvertisement()?.statusId ===
        AdvertisementStatus.pendingPublication &&
      this.appStore.user()?.isAdmin &&
      this.appStore.user()?.userId !==
        this.appStore.selectedAdvertisement()?.userId
    ) {
      return true;
    }
    return false;
  }

  back() {
    switch (this.appStore.selectedListType()) {
      case AppListType.MyAdvertisements:
        this.router.navigateByUrl('/app-adv-list-my-advertisements');
        break;
      case AppListType.PendingPublication:
        this.router.navigateByUrl('/app-adv-list-pending-publication');
        break;
      case AppListType.PendingValidation:
        this.router.navigateByUrl('/app-adv-list-pending-validation');
        break;
      case AppListType.AllHistory:
        this.router.navigateByUrl('/app-adv-list-all-history');
        break;
      case AppListType.PrivateHistory:
        this.router.navigateByUrl('/app-adv-list-private-history');
        break;
      default:
        this.router.navigateByUrl('');
        break;
    }
  }

  closeDialog = () => {
    this.modalRef?.hide();
  };

  ngOnDestroy(): void {
    this.backButtonService.removeCloseDialogHandler();
    this.backButtonService.removeBackButtonHandler();
  }
}
