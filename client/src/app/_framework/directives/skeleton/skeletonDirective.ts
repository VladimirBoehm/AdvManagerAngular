import {
  Directive,
  Input,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { SkeletonAdvertisementListComponent } from './skeleton.component';

@Directive({ selector: '[skeleton]' })
export class SkeletonDirective {
  @Input('skeleton') isLoading = false;

  @Input('skeletonWidth') width?: string;
  @Input('skeletonHeight') height?: string;
  @Input('skeletonClassName') className?: string;

  constructor(
    private template: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isLoading']) {
      this.viewContainer.clear();
      if (changes['isLoading'].currentValue) {
        const ref = this.viewContainer.createComponent(
          SkeletonAdvertisementListComponent
        );

        Object.assign(ref.instance, {
          className: this.className,
        });
      } else {
        this.viewContainer.createEmbeddedView(this.template);
      }
    }
  }
}
