import { NgIf } from '@angular/common';
import { Component, inject, input, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ImagePreviewModalComponent } from '../../_framework/component/image-preview-modal/image-preview-modal.component';

@Component({
  selector: 'app-advertisement-main-data',
  standalone: true,
  imports: [MatCardModule, NgIf, ImagePreviewModalComponent],
  templateUrl: './advertisement-main-data.component.html',
  styleUrl: './advertisement-main-data.component.scss',
})
export class AdvertisementMainDataComponent {
  @ViewChild('imageShowTemplate') imageShowTemplate?: any;
  private modalService = inject(BsModalService);
  title = input.required<string | undefined>();
  message = input.required<string | undefined>();
  url = input<string | undefined>();
  linkName = input<string | undefined>();
  linkValue = input<string | undefined>();
  modalRef?: BsModalRef;

  showImage() {
    this.modalRef = this.modalService.show(this.imageShowTemplate);
  }
}
