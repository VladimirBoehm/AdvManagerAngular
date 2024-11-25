import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Advertisement } from '../../_models/advertisement';
import { AdvertisementService } from '../../_services/advertisement.service';
import { TelegramBackButtonService } from '../../_framework/telegramBackButtonService';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvertisementStatus } from '../../_framework/constants/advertisementStatus';
import { AccountService } from '../../_services/account.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PublishService } from '../../_services/publish.service';
import { AdvertisementHelper } from '../../_framework/component/helpers/advertisementHelper';
import { AdvListType } from '../../_framework/constants/advListType';
import { ManagePublish } from '../../_models/managePublish';
import { DateHelper } from '../../_framework/component/helpers/dateHelper';
import { ConfirmationMatDialogService } from '../../_services/confirmation-mat-dialog.service';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { AdvertisementMainDataComponent } from '../advertisement-main-data/advertisement-main-data.component';
import { BusyService } from '../../_services/busy.service';
import { Localization } from '../../_framework/component/helpers/localization';

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
  shouldRejectValidation: boolean = false;
  adminComment?: string;

  private backButtonService = inject(TelegramBackButtonService);
  private modalService = inject(BsModalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  accountService = inject(AccountService);
  publishService = inject(PublishService);
  advertisementHelper = inject(AdvertisementHelper);
  confirmationService = inject(ConfirmationMatDialogService);
  advertisementService = inject(AdvertisementService);
  busyService = inject(BusyService);

  advertisementStatus = AdvertisementStatus;
  advListType = AdvListType;
  dateHelper = DateHelper;
  modalRef?: BsModalRef;
  advertisement?: Advertisement;
  nextPublishDate?: Date;
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  Localization = Localization;

  ngOnInit(): void {
    this.backButtonService.setCloseDialogHandler(() => this.modalRef?.hide());
    this.backButtonService.setBackButtonHandler(() => {
      this.back();
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.getAdvertisementById(Number(id));
      }
    });
  }

  shouldShowCancelButton(): boolean {
    return (
      this.accountService.currentUser()?.isAdmin ||
      this.accountService.currentUser()?.userId === this.advertisement?.userId
    );
  }

  private getAdvertisementById(id: number) {
    this.advertisementService.getById(Number(id))?.subscribe({
      next: (advertisement: Advertisement) => {
        this.advertisement = advertisement;
      },
      error: (err) => {
        console.error('Error when loading ads:', err);
      },
    });
  }

  private back() {
    this.router.navigate([
      '/adv-list',
      this.advertisementService.getActualSearchType(),
    ]);
  }

  edit() {
    this.router.navigate(['/app-advertisement-edit', this.advertisement?.id]);
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
      .getRegularPublishNextDate(this.advertisement?.id ?? 0)
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
    if (!this.advertisement) return;

    const managePublish = {
      advertisementId: this.advertisement?.id,
      comment: this.adminComment,
      shouldRejectValidation: this.shouldRejectValidation,
      publishId: this.advertisement?.nextPublishId,
    } as ManagePublish;

    this.advertisement.nextPublishDate = undefined;
    if (this.shouldRejectValidation) {
      this.advertisement.statusId = AdvertisementStatus.rejected;
    } else {
      this.advertisement.statusId = AdvertisementStatus.validated;
    }

    this.advertisementService
      .cancelPublicationAdmin(managePublish, this.advertisement)
      ?.subscribe({
        next: () => {
          this.modalRef?.hide();
          this.router.navigate(['/adv-list', AdvListType.PendingPublication]);
        },
        error: (err) => {
          console.error('Error when cancelPublicationAdmin:', err);
        },
      });
  }

  forcePublication() {
    if (!this.advertisement) return;

    const managePublish = {
      advertisementId: this.advertisement.id,
      comment: this.adminComment,
      publishId: this.advertisement?.nextPublishId,
      shouldRejectValidation: false,
    } as ManagePublish;

    this.advertisement.nextPublishDate = undefined;
    this.advertisement.statusId = AdvertisementStatus.validated;

    this.advertisementService
      .forcePublicationAdmin(managePublish, this.advertisement)
      ?.subscribe({
        next: () => {
          this.modalRef?.hide();
          this.router.navigate(['/adv-list', AdvListType.PendingPublication]);
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
    this.advertisementService.delete(this.advertisement?.id)?.subscribe({
      next: () => {
        this.back();
      },
      error: (err) => {
        console.error('Error when deleting ads:', err);
      },
    });
  }

  cancelPublication() {
    if (!this.advertisement) return;
    this.advertisement.nextPublishDate = undefined;
    this.advertisement.nextPublishId = 0;
    this.advertisement.statusId = AdvertisementStatus.validated;
    this.advertisementService.cancelPublication(this.advertisement).subscribe({
      next: () => {
        this.modalRef?.hide();
        this.getAdvertisementById(this.advertisement?.id ?? 0);
      },
      error: (err) => {
        console.error('Error when canceling Publication ', err);
      },
    });
  }

  cancelPublicationDialogShow() {
    console.log(this.advertisementService.getActualSearchType());
    if (
      this.accountService.currentUser()?.userId === this.advertisement?.userId
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
      this.accountService.currentUser()?.isAdmin &&
      this.advertisementService.getActualSearchType() ===
        AdvListType.PendingPublication
    )
      this.modalRef = this.modalService.show(
        this.modalDialogCancelPublicationAdmin
      );
  }

  modalDialogValidateConfirm() {
    this.modalRef?.hide();
    if (this.advertisement) {
      this.advertisement.statusId = AdvertisementStatus.pendingValidation;

      this.advertisementService.updateStatus(this.advertisement)?.subscribe({
        next: () => {
          this.getAdvertisementById(this.advertisement?.id ?? 0);
        },
        error: (err) => {
          console.error('Error when updating status pendingValidation:', err);
        },
      });
    }
  }

  modalDialogPublishConfirm() {
    if (!this.advertisement) return;
    this.advertisement.statusId = AdvertisementStatus.pendingPublication;
    this.advertisement.nextPublishDate = this.nextPublishDate;
    this.modalRef?.hide();

    this.publishService.publish(this.advertisement).subscribe({
      next: () => {
        this.getAdvertisementById(this.advertisement?.id ?? 0);
      },
      error: (err) => {
        console.error('Error when updating status pendingValidation:', err);
      },
    });
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
      this.accountService.currentUser()?.isAdmin &&
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
