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
          [(ngModel)]="shouldRejectValidationValue"
          [disabled]="busyService.isLoading()"
          id="blockAdv"
        />
        <label class="form-check-label text-muted" for="blockAdv">
          {{ Localization.getWord('block_advertisement_question') }}
        </label>
      </div>
      <div *ngIf="shouldRejectValidationValue" class="text-muted my-info-text">
        {{ Localization.getWord('validation_will_be_revoked') }}
      </div>
      <mat-form-field class="mt-3 w-100">
        <mat-label>{{ Localization.getWord('comment_short') }}</mat-label>
        <textarea
          matInput
          rows="3"
          name="adminMessage"
          maxlength="200"
          [(ngModel)]="adminCommentValue"
          [readonly]="busyService.isLoading()"
        ></textarea>
      </mat-form-field>

      <div class="d-flex justify-content-end">
        <button
          class="btn empty-button me-4"
          (click)="cancelPublicationAdmin()()"
          [disabled]="busyService.isLoading()"
        >
          <div>{{ Localization.getWord('yes') }}</div>
        </button>
        <button
          class="btn empty-button"
          (click)="hideDialog()()"
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
export class ModalDialogCancelPublicationAdmin {
  hideDialog = input.required<() => void>();
  cancelPublicationAdmin = input.required<() => void>();

  shouldRejectValidationOutput = output<boolean>();
  adminCommentOutput = output<string | undefined>();

  Localization = Localization;
  busyService = inject(BusyService);

  private shouldRejectValidation: boolean = false;
  private adminComment: string | undefined;

  get shouldRejectValidationValue() {
    return this.shouldRejectValidation;
  }

  set shouldRejectValidationValue(value: boolean) {
    this.shouldRejectValidation = value;
    this.shouldRejectValidationOutput.emit(value);
  }

  get adminCommentValue() {
    return this.adminComment;
  }
  set adminCommentValue(value: string | undefined) {
    this.adminComment = value;
    this.adminCommentOutput.emit(value);
  }


}
