import { Component, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Localization } from '../helpers/localization';

@Component({
  selector: 'app-image-preview-modal',
  standalone: true,
  imports: [],
  templateUrl: './image-preview-modal.component.html',
  styleUrl: './image-preview-modal.component.scss',
})
export class ImagePreviewModalComponent {
  @Input() imageUrl?: string = '';
  @Input() modalRef?: BsModalRef;
  Localization = Localization;

  closeModal() {
    this.modalRef?.hide();
  }
}
