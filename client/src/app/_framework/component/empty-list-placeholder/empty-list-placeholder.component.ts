import {
  Component,
  Input,
  TemplateRef,
} from '@angular/core';
import { SharedModule } from '../../modules/sharedModule';

@Component({
  selector: 'app-empty-list-placeholder',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './empty-list-placeholder.component.html',
  styleUrl: './empty-list-placeholder.component.scss',
})
export class EmptyListPlaceholderComponent {
  @Input() imageUrl: string =
    'https://chatcontrolstorage.blob.core.windows.net/icons/empty1.png';
  @Input() customContent?: TemplateRef<any>;
}
