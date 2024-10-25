import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-list-placeholder',
  standalone: true,
  imports: [],
  templateUrl: './empty-list-placeholder.component.html',
  styleUrl: './empty-list-placeholder.component.scss',
})
export class EmptyListPlaceholderComponent {
  @Input() message: string = 'Список пуст';
  @Input() imageUrl: string =
    'https://chatcontrolstorage.blob.core.windows.net/icons/empty1.png';
}
