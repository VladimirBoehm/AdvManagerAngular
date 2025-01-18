import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-three-dots-loading',
  templateUrl: './three-dots-loading.component.html',
  styleUrls: ['./three-dots-loading.component.scss'],
  standalone: true,
})
export class ThreeDotsLoadingComponent {
  @Input() color = '#fa00e5';
}
