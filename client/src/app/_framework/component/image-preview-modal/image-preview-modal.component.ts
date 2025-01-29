import { Component, input } from '@angular/core';
import { Localization } from '../helpers/localization';

@Component({
  selector: 'app-image-preview-modal',
  standalone: true,
  imports: [],
  templateUrl: './image-preview-modal.component.html',
  styleUrl: './image-preview-modal.component.scss',
})
export class ImagePreviewModalComponent {
  imageUrl = input<string | undefined>('');
  close = input.required<() => void>();
  Localization = Localization;
}
