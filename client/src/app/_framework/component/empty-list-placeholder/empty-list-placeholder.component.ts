import { Component, input } from '@angular/core';
import { SharedModule } from '../../modules/sharedModule';
import { Localization } from '../helpers/localization';

@Component({
  selector: 'app-empty-list-placeholder',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './empty-list-placeholder.component.html',
  styleUrl: './empty-list-placeholder.component.scss',
})
export class EmptyListPlaceholderComponent {
  imageUrl = input<string>(
    'https://chatcontrolstorage.blob.core.windows.net/icons/empty.jpg'
  );
  Localization = Localization;
}
