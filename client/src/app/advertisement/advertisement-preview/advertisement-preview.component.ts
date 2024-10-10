import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmModalComponent } from '../../_framework/component/confirm-modal/confirm-modal.component';
import { Advertisement } from '../../_models/advertisement';
import { AdvertisementService } from '../../_services/advertisement.service';
import { TelegramBackButtonService } from '../../_framework/telegramBackButtonService';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvListStates } from '../../_framework/constants/advListStates';
import { DatePipe, NgIf } from '@angular/common';
import { AdvertisementStatus } from '../../_framework/constants/advertisementStatus';
import { AccountService } from '../../_services/account.service';
import { AdvertisementMainDataComponent } from '../advertisement-main-data/advertisement-main-data.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PublishService } from '../../_services/publish.service';
import { AdvertisementHelper } from '../../_framework/component/helpers/advertisementHelper';

@Component({
  selector: 'app-advertisement-preview',
  standalone: true,
  imports: [
    AdvertisementMainDataComponent,
    FormsModule,
    ConfirmModalComponent,
    NgIf,
    DatePipe,
  ],
  templateUrl: './advertisement-preview.component.html',
  styleUrl: './advertisement-preview.component.scss',
})
export class AdvertisementPreviewComponent implements OnInit {
  @ViewChild('modalDialogDelete') modalDialogDelete?: any;
  @ViewChild('modalDialogValidate') modalDialogValidate?: any;
  @ViewChild('modalDialogPublicationInfo') modalDialogPublicationInfo?: any;
  @ViewChild('modalDialogCancelPublication') modalDialogCancelPublication?: any;

  private backButtonService = inject(TelegramBackButtonService);
  private advertisementService = inject(AdvertisementService);
  private modalService = inject(BsModalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  accountService = inject(AccountService);
  publishService = inject(PublishService);
  advertisementHelper = inject(AdvertisementHelper); 


  modalRef?: BsModalRef;
  advertisement?: Advertisement;
  advertisementStatus = AdvertisementStatus;
  nextPublishDate?: Date;

  ngOnInit(): void {
    this.backButtonService.setBackButtonHandler(() => {
      this.back(false);
    });

    this.route.paramMap.subscribe((params) => {
      const status = params.get('status');
      const id = params.get('id');
      if (status && id) {
        if (Number(status) === AdvertisementStatus.published) {
          console.log(status);
          this.getAdvertisementHistoryById(Number(id));
        } else {
          this.getAdvertisementById(Number(id));
        }
      }
    });
  }

  private getAdvertisementHistoryById(id: number) {
    this.advertisementService.getByIdHistory(id)?.subscribe({
      next: (advertisement: Advertisement) => {
        this.advertisement = advertisement;
        console.log(advertisement);
      },
      error: (err) => {
        console.error('Error when loading ads:', err);
      },
    });
  }

  private getAdvertisementById(id: number) {
    this.advertisementService.getById(Number(id)).subscribe({
      next: (advertisement: Advertisement) => {
        this.advertisement = advertisement;
        console.log(advertisement);
      },
      error: (err) => {
        console.error('Error when loading ads:', err);
      },
    });
  }

  private back(forceRefresh: boolean) {
    if (this.advertisement) {
      if (this.advertisement.statusId === AdvertisementStatus.published) {
        this.router.navigate([
          '/adv-list',
          AdvListStates.AllHistory,
          forceRefresh,
        ]);
      } else {
        this.router.navigate([
          '/adv-list',
          AdvListStates.MyAdvertisements,
          forceRefresh,
        ]);
      }
    }
  }

  edit() {
    this.router.navigate(['/app-advertisement-edit', this.advertisement?.id]);
  }

  delete() {
    this.modalRef = this.modalService.show(this.modalDialogDelete);
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

  sendToValidate() {
    this.modalRef = this.modalService.show(this.modalDialogValidate);
  }

  modalDialogDeleteConfirm() {
    this.modalRef?.hide();
    this.advertisementService.delete(this.advertisement?.id)?.subscribe({
      next: () => {
        this.back(false);
      },
      error: (err) => {
        console.error('Error when deleting ads:', err);
      },
    });
  }

  cancelPublication() {
    this.advertisementService
      .сancelPublication(this.advertisement?.id ?? 0)
      .subscribe({
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
    this.modalRef = this.modalService.show(this.modalDialogCancelPublication);
  }

  modalDialogValidateConfirm() {
    this.modalRef?.hide();
    if (this.advertisement) {
      this.advertisement.statusId = AdvertisementStatus.pendingValidation;

      this.advertisementService.updateStatus(this.advertisement)?.subscribe({
        next: () => {
          this.back(false);
        },
        error: (err) => {
          console.error('Error when updating status pendingValidation:', err);
        },
      });
    }
  }

  modalDialogPublishConfirm() {
    this.publishService
      .saveRegularPublishDate(this.advertisement?.id ?? 0)
      .subscribe({
        next: () => {
          if (this.advertisement) {
            this.advertisement.statusId =
              AdvertisementStatus.pendingPublication;
            this.advertisement.nextPublishDate = this.nextPublishDate;

            this.advertisementService
              .updateStatus(this.advertisement)
              ?.subscribe({
                next: () => {
                  this.modalRef?.hide();
                  this.getAdvertisementById(this.advertisement?.id ?? 0);
                  if (this.advertisement)
                    this.advertisement.nextPublishDate = this.nextPublishDate;
                },
                error: (err) => {
                  console.error(
                    'Error when updating status pendingValidation:',
                    err
                  );
                },
              });
          }
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
      return 'дней';
    }
    if (lastDigit === 1) {
      return 'день';
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'дня';
    }
    return 'дней';
  }
}
