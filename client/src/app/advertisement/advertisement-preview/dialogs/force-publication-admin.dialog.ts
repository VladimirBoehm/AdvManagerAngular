import { Component, inject, input } from '@angular/core';
import { Localization } from '../../../_framework/component/helpers/localization';
import { BusyService } from '../../../_services/busy.service';
import { SharedModule } from '../../../_framework/modules/sharedModule';

@Component({
  selector: 'modal-dialog-force-publication-admin',
  template: `
    <div class="modal-body">
      <div class="d-flex flex-column">
        <h6 class="modal-title pull-left text-muted">
          {{ Localization.getWord('publish_ad_immediately_question') }}
        </h6>
        <hr class="m-1" />
      </div>
      <mat-form-field class="mt-2 w-100">
        <mat-label>{{ Localization.getWord('comment_short') }}</mat-label>
        <textarea
          matInput
          rows="3"
          name="adminMessage"
          maxlength="200"
          [readonly]="busyService.isLoading()"
          [(ngModel)]="adminComment"
        ></textarea>
      </mat-form-field>

      <div class="d-flex justify-content-end">
        <button
          class="btn empty-button me-4"
          (click)="confirm()(adminComment)"
          [disabled]="busyService.isLoading()"
        >
          <div>{{ Localization.getWord('yes') }}</div>
        </button>
        <button
          class="btn empty-button"
          (click)="close()()"
          [disabled]="busyService.isLoading()"
        >
          <div>{{ Localization.getWord('no') }}</div>
        </button>
      </div>
    </div>

    <div class="d-flex justify-content-center">
      <mat-progress-bar
        *ngIf="busyService.isLoading()"
        mode="buffer"
        style="width: 90%"
      ></mat-progress-bar>
    </div>
  `,
  imports: [SharedModule],
  standalone: true,
})
export class ForcePublicationAdminDialog {
  close = input.required<() => void>();
  confirm =
    input.required<(adminComment: string | undefined) => void>();

  Localization = Localization;
  busyService = inject(BusyService);

  adminComment: string | undefined;
}
