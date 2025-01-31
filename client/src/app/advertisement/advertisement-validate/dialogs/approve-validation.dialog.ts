import { Component, inject, input, OnInit } from '@angular/core';
import { Localization } from '../../../_framework/component/helpers/localization';
import { BusyService } from '../../../_services/busy.service';
import { SharedModule } from '../../../_framework/modules/sharedModule';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '../../../_framework/component/validators/customValidators';
import { MatErrorService } from '../../../_framework/component/errors/mat-error-service';
import { AdvertisementStatus } from '../../../_framework/constants/advertisementStatus';

@Component({
  selector: 'modal-dialog-approve-validation-admin',
  template: `
    <div class="modal-body">
      <div class="d-flex flex-column">
        <h6 class="modal-title pull-left mb-0">
          {{ Localization.getWord('approve_advertisement_question') }}
        </h6>
        <hr />
      </div>
      <div>{{ Localization.getWord('set_allowed_posting_frequency') }}</div>
      <mat-form-field floatLabel="always" class="w-100 mt-3">
        <mat-label>{{ Localization.getWord('days') }}</mat-label>
        <input
          matInput
          type="number"
          [placeholder]="Localization.getWord('one_time_posting')"
          step="1"
          min="0"
          name="frequencyValue"
          [formControl]="$any(editFormModalDialog.controls['frequencyValue'])"
        />
        <mat-error>{{
          matErrorService.getErrorMessage(
            editFormModalDialog.controls['frequencyValue'],
            'frequencyValue'
          )
        }}</mat-error>
      </mat-form-field>

      <div class="d-flex justify-content-end">
        <button
          class="btn empty-button"
          (click)="
            confirm()(
              AdvertisementStatus.validated,
              editFormModalDialog.controls['frequencyValue'].value
            )
          "
          [disabled]="editFormModalDialog.invalid"
        >
          <div>{{ Localization.getWord('approve') }}</div></button
        ><button class="btn empty-button" (click)="close()()">
          <div>{{ Localization.getWord('back') }}</div>
        </button>
      </div>
    </div>
  `,
  imports: [SharedModule],
  standalone: true,
  providers: [MatErrorService],
})
export class ApproveValidationDialog implements OnInit {
  close = input.required<() => void>();

  confirm =
    input.required<
      (advertisementStatus: AdvertisementStatus, frequency?: number) => void
    >();

  AdvertisementStatus = AdvertisementStatus;
  Localization = Localization;
  busyService = inject(BusyService);
  matErrorService = inject(MatErrorService);

  adminComment: string | undefined;
  editFormModalDialog: FormGroup = new FormGroup({});
  private formBuilder = inject(FormBuilder);
  private frequencyValue: number = 10;

  ngOnInit(): void {
    this.editFormModalDialog = this.formBuilder.group({
      frequencyValue: [
        this.frequencyValue,
        [Validators.max(100), CustomValidators.numeric()],
      ],
    });
    this.matErrorService.addErrorsInfo('frequencyValue', { max: 100 });
  }
}
