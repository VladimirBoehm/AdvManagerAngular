import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { TelegramBackButtonService } from '../../_framework/telegramBackButtonService';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AdvertisementStatus } from '../../_framework/constants/advertisementStatus';
import { MatErrorService } from '../../_framework/component/errors/mat-error-service';
import { CustomValidators } from '../../_framework/component/validators/customValidators';
import { AppListType } from '../../_framework/constants/advListType';
import { ConfirmationMatDialogService } from '../../_services/confirmation-mat-dialog.service';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { AdvertisementMainDataComponent } from '../advertisement-main-data/advertisement-main-data.component';
import { Localization } from '../../_framework/component/helpers/localization';
import { AppStore } from '../../appStore/app.store';

@Component({
  selector: 'app-advertisement-validate',
  standalone: true,
  imports: [SharedModule, AdvertisementMainDataComponent],
  templateUrl: './advertisement-validate.component.html',
  styleUrl: './advertisement-validate.component.scss',
  providers: [MatErrorService],
})
export class AdvertisementValidateComponent implements OnInit {
  @ViewChild('modalDialogApprove') modalDialogApprove?: any;
  @ViewChild('modalDialogReject') modalDialogReject?: any;

  private backButtonService = inject(TelegramBackButtonService);
  private modalService = inject(BsModalService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  readonly appStore = inject(AppStore);
  matErrorService = inject(MatErrorService);
  confirmationService = inject(ConfirmationMatDialogService);

  editForm: FormGroup = new FormGroup({});
  editFormModalDialog: FormGroup = new FormGroup({});

  frequencyValue: number = 10;
  advertisementId: number = 0;
  commentCounter: number = 0;
  maxCommentLength: number = 500;
  advertisementStatus = AdvertisementStatus;
  modalRef?: BsModalRef;
  Localization = Localization;

  ngOnInit(): void {
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigate(['/adv-list', AppListType.PendingValidation]);
    });
    this.initializeForm();
    this.updateAdminMessageCounter();
  }

  confirm() {
    this.modalRef = this.modalService.show(this.modalDialogApprove);
  }

  initializeForm() {
    this.editFormModalDialog = this.formBuilder.group({
      frequencyValue: [
        this.frequencyValue,
        [Validators.max(100), CustomValidators.numeric()],
      ],
    });

    this.editForm = this.formBuilder.group({
      adminMessage: [
        this.appStore.selectedAdvertisement()?.adminMessage,
        [Validators.maxLength(this.maxCommentLength)],
      ],
      frequencyValue: [this.frequencyValue],
    });

    this.editForm.controls['adminMessage']?.valueChanges.subscribe(() => {
      this.updateAdminMessageCounter();
    });

    this.matErrorService.addErrorsInfo('adminMessage', {
      maxLength: this.maxCommentLength,
    });
    this.matErrorService.addErrorsInfo('frequencyValue', { max: 100 });
  }
  updateAdminMessageCounter() {
    const titleValue = this.editForm.controls['adminMessage']?.value || '';
    this.commentCounter = titleValue.length;
  }

  async modalDialogConfirm(advertisementStatus: AdvertisementStatus) {
    const selectedAdvertisement = this.appStore.selectedAdvertisement();
    if (!selectedAdvertisement || selectedAdvertisement.id === undefined) {
      console.error('Selected advertisement is invalid');
      return;
    }
    const updatedAdvertisement = { ...selectedAdvertisement };
    updatedAdvertisement.statusId = advertisementStatus;
    updatedAdvertisement.publishFrequency =
      this.editFormModalDialog.controls['frequencyValue']?.value;
    updatedAdvertisement.adminMessage =
      this.editForm.controls['adminMessage']?.value;

    this.modalRef?.hide();
    await this.appStore.validateAdvertisementAdminAsync(updatedAdvertisement);
    this.router.navigate(['/adv-list', AppListType.PendingValidation]);
  }

  reject() {
    this.confirmationService
      .confirmDialog({
        title: this.Localization.getWord('reject_advertisement_question'),
        confirmText: this.Localization.getWord('yes'),
        cancelText: this.Localization.getWord('no'),
      })
      .subscribe((result) => {
        if (result === true) {
          this.modalDialogConfirm(AdvertisementStatus.rejected);
        }
      });
  }

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
  }
}
