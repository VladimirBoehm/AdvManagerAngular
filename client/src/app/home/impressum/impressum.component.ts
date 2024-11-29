import { Component, Input } from '@angular/core';
import { Localization } from '../../_framework/component/helpers/localization';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [],
  templateUrl: './impressum.component.html',
  styleUrl: './impressum.component.scss',
})
export class ImpressumComponent {
  @Input() onClose!: () => void; 

  Localization = Localization;
}
