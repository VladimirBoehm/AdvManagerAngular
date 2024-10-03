import { Component, inject, ViewChild } from '@angular/core';
import { AdvertisementPreviewComponent } from '../advertisement-preview/advertisement-preview.component';
import { Location } from '@angular/common';
import { AdvertisementService } from '../../_services/advertisement.service';
import { Advertisement } from '../../_models/advertisement';
import { TelegramBackButtonService } from '../../_framework/telegramBackButtonService';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-advertisement-validate',
  standalone: true,
  imports: [AdvertisementPreviewComponent, FormsModule],
  templateUrl: './advertisement-validate.component.html',
  styleUrl: './advertisement-validate.component.scss',
})
export class AdvertisementValidateComponent {
  @ViewChild('editForm') editForm?: NgForm;
  @ViewChild('template') template?: any;
  defaultFrequencyValue: number = 10;

  private location = inject(Location);
  private backButtonService = inject(TelegramBackButtonService);
  private route = inject(ActivatedRoute);
  private modalService = inject(BsModalService)
  advertisementId: number = 0;
  private advertisementService = inject(AdvertisementService);
  advertisement?: Advertisement;
  modalRef?: BsModalRef;



  ngOnInit(): void {
    this.backButtonService.setBackButtonHandler(() => {
      this.location.back();
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
    this.modalRef = this.modalService.show(this.template);
  }

  reject() {
    console.log('reject');
  }

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
  }

  setMaxValue(event: any, max: number) {
    if (event.target.value > max) {
      event.target.value = max;
    }
    this.defaultFrequencyValue = event.target.value; 
  }
}
