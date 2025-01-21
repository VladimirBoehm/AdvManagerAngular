import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AdvertisementService } from '../../_services/advertisement.service';
import { TelegramBackButtonService } from '../../_framework/telegramBackButtonService';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AdvertisementStatus } from '../../_framework/constants/advertisementStatus';
import { AccountService } from '../../_services/account.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PublishService } from '../../_services/publish.service';
import { AdvertisementHelper } from '../../_framework/component/helpers/advertisementHelper';
import { AppListType } from '../../_framework/constants/advListType';
import { ManagePublish } from '../../_entities/managePublish';
import { DateHelper } from '../../_framework/component/helpers/dateHelper';
import { ConfirmationMatDialogService } from '../../_services/confirmation-mat-dialog.service';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { AdvertisementMainDataComponent } from '../advertisement-main-data/advertisement-main-data.component';
import { BusyService } from '../../_services/busy.service';
import { Localization } from '../../_framework/component/helpers/localization';
import { AppStore } from '../../appStore/app.store';

@Component({
  selector: 'app-advertisement-preview',
  standalone: true,
  imports: [SharedModule, AdvertisementMainDataComponent],
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
  private location = inject(Location);
  readonly appStore = inject(AppStore);

  shouldRejectValidation: boolean = false;
  adminComment?: string;

  accountService = inject(AccountService);
  publishService = inject(PublishService);
  advertisementHelper = inject(AdvertisementHelper);
  confirmationService = inject(ConfirmationMatDialogService);
  advertisementService = inject(AdvertisementService);
  busyService = inject(BusyService);

  advertisementStatus = AdvertisementStatus;
  advListType = AppListType;
  dateHelper = DateHelper;
  modalRef?: BsModalRef;
  nextPublishDate?: Date;
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

  private back() {
    this.location.back();
  }

  edit() {
    this.router.navigate([
      '/app-advertisement-edit',
      this.appStore.selectedAdvertisement()?.id,
    ]);
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
    this.publishService
      .getRegularPublishNextDate(this.appStore.selectedAdvertisement()?.id ?? 0)
      .subscribe({
        next: (result: Date) => {
          this.nextPublishDate = result;
        },
        error: (err) => {
          console.error('Error when getting regularPublishNextDate:', err);
        },
      });

    this.modalRef = this.modalService.show(this.modalDialogPublicationInfo);
  }

  cancelPublicationAdmin() {
    if (!this.appStore.selectedAdvertisement()) return;

    const managePublish = {
      advertisementId: this.appStore.selectedAdvertisement()?.id,
      comment: this.adminComment,
      shouldRejectValidation: this.shouldRejectValidation,
      publishId: this.appStore.selectedAdvertisement()?.nextPublishId,
    } as ManagePublish;

    // this.advertisement.nextPublishDate = undefined;
    // if (this.shouldRejectValidation) {
    //   this.advertisement.statusId = AdvertisementStatus.rejected;
    // } else {
    //   this.advertisement.statusId = AdvertisementStatus.validated;
    // }

    this.advertisementService
      .cancelPublicationAdmin(
        managePublish,
        this.appStore.selectedAdvertisement()
      )
      ?.subscribe({
        next: () => {
          this.modalRef?.hide();
          this.router.navigate(['/adv-list', AppListType.PendingPublication]);
        },
        error: (err) => {
          console.error('Error when cancelPublicationAdmin:', err);
        },
      });
  }

  forcePublication() {
    const managePublish = {
      advertisementId: this.appStore.selectedAdvertisement()?.id,
      comment: this.adminComment,
      publishId: this.appStore.selectedAdvertisement()?.nextPublishId,
      shouldRejectValidation: false,
    } as ManagePublish;

    // this.advertisement.nextPublishDate = undefined;
    // this.advertisement.statusId = AdvertisementStatus.validated;

    this.advertisementService
      .forcePublicationAdmin(
        managePublish,
        this.appStore.selectedAdvertisement()
      )
      ?.subscribe({
        next: () => {
          this.modalRef?.hide();
          this.router.navigate(['/adv-list', AppListType.PendingPublication]);
        },
        error: (err) => {
          console.error('Error when forcePublication:', err);
        },
      });
  }

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
    // this.advertisement.nextPublishDate = undefined;
    // this.advertisement.nextPublishId = 0;
    // this.advertisement.statusId = AdvertisementStatus.validated;
    // this.advertisementService.cancelPublication(this.advertisement).subscribe({
    //   next: () => {
    //     this.modalRef?.hide();
    //     this.getAdvertisementById(this.advertisement?.id ?? 0);
    //   },
    //   error: (err) => {
    //     console.error('Error when canceling Publication ', err);
    //   },
    // });
  }

  cancelPublicationDialogShow() {
    console.log(this.advertisementService.getActualSearchType());
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
      return;
    } else if (
      this.appStore.user()?.isAdmin &&
      this.advertisementService.getActualSearchType() ===
        AppListType.PendingPublication
    )
      this.modalRef = this.modalService.show(
        this.modalDialogCancelPublicationAdmin
      );
  }

  modalDialogValidateConfirm() {
    this.modalRef?.hide();
    if (this.appStore.selectedAdvertisement()) {
      // this.advertisement.statusId = AdvertisementStatus.pendingValidation;
      // this.advertisementService
      //   .sendToValidation(this.advertisement)
      //   ?.subscribe({
      //     next: () => {
      //       this.getAdvertisementById(this.advertisement?.id ?? 0);
      //     },
      //     error: (err) => {
      //       console.error('Error when updating status pendingValidation:', err);
      //     },
      //   });
    }
  }

  modalDialogPublishConfirm() {
    if (!this.appStore.selectedAdvertisement()) return;
    // this.advertisement.statusId = AdvertisementStatus.pendingPublication;
    // this.advertisement.nextPublishDate = this.nextPublishDate;
    // this.modalRef?.hide();

    // this.publishService.publish(this.advertisement).subscribe({
    //   next: () => {
    //     this.getAdvertisementById(this.advertisement?.id ?? 0);
    //   },
    //   error: (err) => {
    //     console.error('Error when updating status pendingValidation:', err);
    //   },
    // });
  }

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

  shouldShowForceButton(): boolean {
    let result =
      this.appStore.user()?.isAdmin &&
      this.advertisementService.getActualSearchType() ===
        this.advListType.PendingPublication;
    if (result) return result;
    return false;
  }

  ngOnDestroy(): void {
    this.backButtonService.removeCloseDialogHandler();
    this.backButtonService.removeBackButtonHandler();
  }
}
