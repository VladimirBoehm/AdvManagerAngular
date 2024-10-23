import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'skeleton-rect',
  template: ``,
  styles: [`
    :host {
      display: block;
      width: var(--skeleton-rect-width, 100px);
      height: var(--skeleton-rect-height, 20px);
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: wave 4.5s linear infinite;
    }

    @keyframes wave {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `]
})
export class SkeletonComponent {
  width?: string;
  height?: string;
  className?: string;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnInit() {
    const host = this.host.nativeElement;

    if (this.className) {
      host.classList.add(this.className);
    }

    host.style.setProperty('--skeleton-rect-width', this.width ?? '100%');
    host.style.setProperty('--skeleton-rect-height', this.height ?? '20px');
  }
}
