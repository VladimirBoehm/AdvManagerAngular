import { Component, input, Input } from '@angular/core';
import { Localization } from '../../_framework/component/helpers/localization';

@Component({
  selector: 'app-impressum',
  standalone: true,
  templateUrl: './impressum.component.html',
  styleUrl: './impressum.component.scss',
})
export class ImpressumComponent {
  close = input.required<() => void>();
  Localization = Localization;
}
