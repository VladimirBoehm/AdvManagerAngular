import { Component, inject, OnInit, ViewChild } from '@angular/core';

import { AdvertisementService } from '../../_services/advertisement.service';
import { Advertisement } from '../../_models/advertisement';
import { TelegramBackButtonService } from '../../_framework/telegramBackButtonService';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UpdateAdvertisementAdminRequest } from '../../_models/updateAdvertisementAdminRequest';
import { AdvertisementStatus } from '../../_framework/constants/advertisementStatus';
import { ConfirmModalComponent } from '../../_framework/component/confirm-modal/confirm-modal.component';
import { AdvertisementMainDataComponent } from '../advertisement-main-data/advertisement-main-data.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatErrorService } from '../../_framework/component/errors/mat-error-service';
import { CustomValidators } from '../../_framework/component/validators/customValidators';
import { AdvListType } from '../../_framework/constants/advListType';
import {
  ConfirmDialogData,
  MatConfirmModalComponent,
} from '../../_framework/component/mat-confirm-modal/mat-confirm-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-advertisement-validate',
  standalone: true,
  imports: [
    AdvertisementMainDataComponent,
    ReactiveFormsModule,
    ConfirmModalComponent,
    MatFormFieldModule,
    MatInputModule,
  ],
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
  private dialog = inject(MatDialog);
  matErrorService = inject(MatErrorService);

  editForm: FormGroup = new FormGroup({});
  editFormModalDialog: FormGroup = new FormGroup({});

  frequencyValue: number = 10;
  advertisementId: number = 0;
  commentCounter: number = 0;
  maxCommentLength: number = 500;
  advertisement?: Advertisement;
  advertisementStatus = AdvertisementStatus;
  modalRef?: BsModalRef;

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

    this.advertisementService
      .updateAdvertisementAdmin(updateAdvertisementAdminRequest)
      .subscribe({
        next: () => {
          this.modalRef?.hide();
          this.router.navigate(['/adv-list', AdvListType.PendingValidation]);
        },
        error: (error: any) => console.log(error),
      });
  }

  openConfirmDialog(): void {}
  reject() {
    //this.modalRef = this.modalService.show(this.modalDialogReject);

    const dialogData: ConfirmDialogData = {
      title: 'Отклонить объявление?',
      firstButtonLabel: 'Да',
      secondButtonLabel: 'Нет',
    };

    const dialogRef = this.dialog.open(MatConfirmModalComponent, {
      data: dialogData,
      position: { top: '0px' },
      width: '95%',
      panelClass: 'custom-dialog-container'

    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'first') {
        this.modalDialogConfirm(AdvertisementStatus.rejected);
      }
    });

  }

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
  }
}
