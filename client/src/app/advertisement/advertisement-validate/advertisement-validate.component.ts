import { Component, inject, ViewChild } from '@angular/core';
import { AdvertisementPreviewComponent } from '../advertisement-preview/advertisement-preview.component';
import { AdvertisementService } from '../../_services/advertisement.service';
import { Advertisement } from '../../_models/advertisement';
import { TelegramBackButtonService } from '../../_framework/telegramBackButtonService';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UpdateAdvertisementAdminRequest } from '../../_models/updateAdvertisementAdminRequest';
import { AdvertisementStatus } from '../../_framework/constants/advertisementStatus';
import { AdvListStates } from '../../_framework/constants/advListStates';

@Component({
  selector: 'app-advertisement-validate',
  standalone: true,
  imports: [AdvertisementPreviewComponent, FormsModule],
  templateUrl: './advertisement-validate.component.html',
  styleUrl: './advertisement-validate.component.scss',
})
export class AdvertisementValidateComponent {
  @ViewChild('editForm') editForm?: NgForm;
  @ViewChild('modalDialog') modalDialog?: any;
  @ViewChild('modalDialogReject') modalDialogReject?: any;
  frequencyValue: number = 10;

  private backButtonService = inject(TelegramBackButtonService);
  private route = inject(ActivatedRoute);
  private modalService = inject(BsModalService);
  private router = inject(Router);
  private advertisementService = inject(AdvertisementService);

  advertisementId: number = 0;
  advertisement?: Advertisement;
  advertisementStatus = AdvertisementStatus;
  modalRef?: BsModalRef;

  ngOnInit(): void {
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigate(['/adv-list', AdvListStates.Validate, false]);
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.advertisementService.getById(Number(id)).subscribe({
          next: (advertisement: Advertisement) => {
            this.advertisement = advertisement;
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

  modalDialogConfirm(advertisementStatus: AdvertisementStatus) {
      const updateAdvertisementAdminRequest: UpdateAdvertisementAdminRequest = {
      advertisementId: this.advertisement?.id ?? 0,
      advertisementStatus: advertisementStatus,
      publishFrequency: this.frequencyValue || 0,
      adminMessage: this.editForm?.form.value.adminMessage,
    };

    this.advertisementService
      .updateAdvertisementAdmin(updateAdvertisementAdminRequest)
      .subscribe({
        next: () => {
          this.modalRef?.hide();
          this.router.navigate(['/adv-list', AdvListStates.Validate, true]);
        },
        error: (error: any) => console.log(error),
      });
  }

  reject() {
    this.modalRef = this.modalService.show(this.modalDialogReject);
  }

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
  }

  setMaxValue(event: any, max: number) {
    if (event.target.value > max) {
      event.target.value = max;
    }
    this.frequencyValue = event.target.value;
  }
}
