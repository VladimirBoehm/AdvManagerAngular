import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { AdvertisementService } from '../../_services/advertisement.service';
import { Advertisement } from '../../_models/advertisement';
import { TelegramBackButtonService } from '../../_framework/telegramBackButtonService';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UpdateAdvertisementAdminRequest } from '../../_models/updateAdvertisementAdminRequest';
import { AdvertisementStatus } from '../../_framework/constants/advertisementStatus';
import { MatErrorService } from '../../_framework/component/errors/mat-error-service';
import { CustomValidators } from '../../_framework/component/validators/customValidators';
import { AdvListType } from '../../_framework/constants/advListType';
import { ConfirmationMatDialogService } from '../../_services/confirmation-mat-dialog.service';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { AdvertisementMainDataComponent } from '../advertisement-main-data/advertisement-main-data.component';
import { Localization } from '../../_framework/component/helpers/localization';

@Component({
  selector: 'app-advertisement-validate',
  standalone: true,
  imports: [SharedModule, AdvertisementMainDataComponent],
  templateUrl: './advertisement-validate.component.html',
  styleUrl: './advertisement-validate.component.scss',
  providers: [MatErrorService],
})
export class AdvertisementValidateComponent implements OnInit {
  @ViewChild('modalDialog') modalDialog?: any;
  @ViewChild('modalDialogReject') modalDialogReject?: any;

  private backButtonService = inject(TelegramBackButtonService);
  private route = inject(ActivatedRoute);
  private modalService = inject(BsModalService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private advertisementService = inject(AdvertisementService);
  matErrorService = inject(MatErrorService);
  confirmationService = inject(ConfirmationMatDialogService);

  editForm: FormGroup = new FormGroup({});
  editFormModalDialog: FormGroup = new FormGroup({});

  frequencyValue: number = 10;
  advertisementId: number = 0;
  commentCounter: number = 0;
  maxCommentLength: number = 500;
  advertisement?: Advertisement;
  advertisementStatus = AdvertisementStatus;
  modalRef?: BsModalRef;
  Localization = Localization;

  ngOnInit(): void {
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigate(['/adv-list', AdvListType.PendingValidation]);
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.advertisementService.getById(Number(id))?.subscribe({
          next: (advertisement: Advertisement) => {
            this.advertisement = advertisement;
            this.initializeForm();
            this.updateAdminMessageCounter();
          },
          error: (err) => {
            console.error('Error when loading ads:', err);
          },
        });
      }
    });
  }

  confirm() {
    this.modalRef = this.modalService.show(this.modalDialog);
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
        this.advertisement?.adminMessage,
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

  modalDialogConfirm(advertisementStatus: AdvertisementStatus) {
    const updateAdvertisementAdminRequest: UpdateAdvertisementAdminRequest = {
      advertisementId: this.advertisement?.id ?? 0,
      advertisementStatus: advertisementStatus,
      publishFrequency:
        this.editFormModalDialog.controls['frequencyValue']?.value,
      adminMessage: this.editForm.controls['adminMessage']?.value,
    };
    this.modalRef?.hide();

    this.advertisementService
      .validateAdvertisementAdmin(updateAdvertisementAdminRequest)
      .subscribe({
        error: (error: any) => console.log(error),
      });
    this.router.navigate(['/adv-list', AdvListType.PendingValidation]);
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
