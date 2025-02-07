import { Component, inject, input, output, signal } from '@angular/core';
import { Localization } from '../../../_framework/component/helpers/localization';
import { BusyService } from '../../../_services/busy.service';
import { SharedModule } from '../../../_framework/modules/sharedModule';

@Component({
  selector: 'modal-dialog-cancel-publication-admin',
  template: `
    <div class="modal-body">
      <div class="d-flex flex-column">
        <h6 class="modal-title pull-left text-muted">
          {{ Localization.getWord('cancel_publication_question') }}
        </h6>
        <hr class="m-1" />
      </div>
      <div class="form-check mt-2">
        <input
          class="form-check-input"
          type="checkbox"
          [(ngModel)]="shouldRejectValidation"
          [disabled]="busyService.isLoading()"
          id="blockAdv"
        />
        <label class="form-check-label text-muted" for="blockAdv">
          {{ Localization.getWord('block_advertisement_question') }}
        </label>
      </div>
      @if(shouldRejectValidation) {
      <div class="text-muted my-info-text">
        {{ Localization.getWord('validation_will_be_revoked') }}
      </div>
      }
      <mat-form-field class="mt-3 w-100">
        <mat-label>{{ Localization.getWord('comment_short') }}</mat-label>
        <textarea
          matInput
          rows="3"
          name="adminMessage"
          maxlength="200"
          [(ngModel)]="adminComment"
          [readonly]="busyService.isLoading()"
        ></textarea>
      </mat-form-field>

      <div class="d-flex justify-content-end">
        <button
          class="btn empty-button me-4"
          (click)="confirm()(shouldRejectValidation, adminComment)"
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

    @if(busyService.isLoading()) {
    <div class="d-flex justify-content-center">
      <mat-progress-bar mode="buffer" style="width: 90%"></mat-progress-bar>
    </div>
    }
  `,
  imports: [SharedModule],
  standalone: true,
})
export class CancelPublicationAdminDialog {
  close = input.required<() => void>();
  confirm =
    input.required<
      (
        shouldRejectValidation: boolean,
        adminComment: string | undefined
      ) => void
    >();

  Localization = Localization;
  busyService = inject(BusyService);

  shouldRejectValidation: boolean = false;
  adminComment: string | undefined;
}
