import { Component, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-image-preview-modal',
  standalone: true,
  imports: [],
  templateUrl: './image-preview-modal.component.html',
  styleUrl: './image-preview-modal.component.scss',
})
export class ImagePreviewModalComponent {
  @Input() imageUrl: string | undefined = '';
  @Input() modalRef?: BsModalRef;

  closeModal() {
    this.modalRef?.hide();
  }
}
