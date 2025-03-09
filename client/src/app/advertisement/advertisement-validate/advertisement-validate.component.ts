import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { TelegramBackButtonService } from '../../_services/telegramBackButton.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AdvertisementStatus } from '../../_framework/constants/advertisementStatus';
import { MatErrorService } from '../../_framework/component/errors/mat-error-service';
import { ConfirmationMatDialogService } from '../../_services/confirmation-mat-dialog.service';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { AdvertisementMainDataComponent } from '../advertisement-main-data/advertisement-main-data.component';
import { Localization } from '../../_framework/component/helpers/localization';
import { AppStore } from '../../appStore/app.store';
import { ApproveValidationDialog } from './dialogs/approve-validation.dialog';

@Component({
  selector: 'app-advertisement-validate',
  standalone: true,
  imports: [
    SharedModule,
    AdvertisementMainDataComponent,
    ApproveValidationDialog,
  ],
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
  advertisementId: number = 0;
  commentCounter: number = 0;
  maxCommentLength: number = 500;
  advertisementStatus = AdvertisementStatus;
  modalRef?: BsModalRef;
  Localization = Localization;

  ngOnInit(): void {
    this.backButtonService.setBackButtonHandler(() => {
      this.back();
    });
    this.initializeForm();
    this.updateAdminMessageCounter();
  }

  confirm() {
    this.modalRef = this.modalService.show(this.modalDialogApprove);
  }

  initializeForm() {
    this.editForm = this.formBuilder.group({
      adminMessage: [
        this.appStore.selectedAdvertisement()?.adminMessage,
        [Validators.maxLength(this.maxCommentLength)],
      ],
    });

    this.editForm.controls['adminMessage']?.valueChanges.subscribe(() => {
      this.updateAdminMessageCounter();
    });

    this.matErrorService.addErrorsInfo('adminMessage', {
      maxLength: this.maxCommentLength,
    });
  }
  updateAdminMessageCounter() {
    const titleValue = this.editForm.controls['adminMessage']?.value || '';
    this.commentCounter = titleValue.length;
  }

  //TODO delete
  modalDialogConfirm = (
    advertisementStatus: AdvertisementStatus,
    frequency?: number
  ) => {
    const selectedAdvertisement = this.appStore.selectedAdvertisement();
    if (!selectedAdvertisement || selectedAdvertisement.id === undefined) {
      console.error('Selected advertisement is invalid');
      return;
    }
    const updatedAdvertisement = { ...selectedAdvertisement };
    updatedAdvertisement.statusId = advertisementStatus;
    updatedAdvertisement.publishFrequency = frequency;
    updatedAdvertisement.adminMessage =
      this.editForm.controls['adminMessage']?.value;

    this.hideDialog();
    this.appStore.validateAdvertisementAdmin(updatedAdvertisement);
    this.back();
  };

  rejectValidationConfirm = () => {
    const selectedAdvertisement = this.appStore.selectedAdvertisement();
    if (!selectedAdvertisement || selectedAdvertisement.id === undefined) {
      console.error('Selected advertisement is invalid');
      return;
    }
    const updatedAdvertisement = { ...selectedAdvertisement };
    updatedAdvertisement.statusId = AdvertisementStatus.rejected;
    updatedAdvertisement.adminMessage =
      this.editForm.controls['adminMessage']?.value;

    this.hideDialog();
    this.appStore.rejectValidationAdmin(updatedAdvertisement);
    this.back();
  };

  hideDialog = () => {
    this.modalRef?.hide();
  };
  back() {
    this.router.navigateByUrl('/app-adv-list-pending-validation');
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
          this.rejectValidationConfirm();
        }
      });
  }

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
  }
}
