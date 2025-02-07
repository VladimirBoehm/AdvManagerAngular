import { Component, input } from '@angular/core';
import { Localization } from '../_framework/component/helpers/localization';

@Component({
  selector: 'refresh-list-notification',
  template: `
    <div class="alert d-flex alert-warning mt-2 mb-0" role="alert">
      <div
        class="col-10 d-flex flex-column align-items-center justify-content-center"
      >
        {{ Localization.getWord('new_advertisements') }}
      </div>
      <div
        class="col-2 d-flex flex-column align-items-center justify-content-center"
      >
        <button
          class="btn empty-button slide-in-animation"
          (click)="refresh()()"
        >
          <span class="material-symbols-outlined text-muted"> refresh </span>
          <div class="text-muted">{{ Localization.getWord('refresh') }}</div>
        </button>
      </div>
    </div>
  `,
  standalone: true,
})
export class RefreshListNotification {
  Localization = Localization;

  refresh = input.required<() => void>();
}
