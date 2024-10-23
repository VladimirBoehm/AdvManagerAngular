import {
  Directive,
  Input,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { SkeletonComponent } from './skeleton.component';

@Directive({ selector: '[skeleton]'})
export class SkeletonDirective {
  @Input('skeleton') isLoading = false;
  @Input('skeletonRepeat') size = 1;
  @Input('skeletonWidth') width?: string;
  @Input('skeletonHeight') height?: string;
  @Input('skeletonClassName') className?: string;

  constructor(private template: TemplateRef<any>, private viewContainer: ViewContainerRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isLoading']) {
      this.viewContainer.clear();

      if (changes['isLoading'].currentValue) {
        Array.from({ length: this.size }).forEach(() => {
          const ref = this.viewContainer.createComponent(SkeletonComponent);

          Object.assign(ref.instance, {
            width:
              this.width === 'rand'
                ? '100%'
                : this.width,
            height: this.height,
            className: this.className,
          });
        });
      } else {
        this.viewContainer.createEmbeddedView(this.template);
      }
    }
  }
}
