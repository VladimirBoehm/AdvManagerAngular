import { Component, Input } from '@angular/core';
import { SharedModule } from '../../modules/sharedModule';

@Component({
  selector: 'app-skeleton-full-screen',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './skeleton-full-screen.component.html',
  styleUrl: './skeleton-full-screen.component.scss',
})
export class SkeletonFullScreenComponent {
  @Input() shouldShowHeaderPanel?: boolean = true;
}
