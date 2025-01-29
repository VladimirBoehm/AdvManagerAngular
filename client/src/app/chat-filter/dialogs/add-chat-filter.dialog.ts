import { Component, input, inject, OnInit } from '@angular/core';
import { Localization } from '../../_framework/component/helpers/localization';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { BusyService } from '../../_services/busy.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatErrorService } from '../../_framework/component/errors/mat-error-service';

@Component({
  selector: 'modal-dialog-add-chat-filter',
  template: `
    <div class="modal-body">
      <div class="container d-flex flex-column align-items-start">
        <h6 class="text-muted mt-1 mb-1">
          {{ Localization.getWord('create') }}
        </h6>
        <div class="text-muted my-info-text">
          {{ Localization.getWord('message_delete_info') }}
        </div>
      </div>
      <hr class="mt-1 mb-3" />
      <mat-form-field class="w-100">
        <mat-label>{{ Localization.getWord('value') }}</mat-label>
        <input matInput [formControl]="$any(editForm.controls['item'])" />
        @if (matErrorService.getHasError(editForm.controls['item'])){
        <mat-error>{{
          matErrorService.getErrorMessage(editForm.controls['item'], 'item')
        }}</mat-error>
        }
        <mat-hint [align]="'end'">
          {{ itemLengthCounter }}/{{ maxItemLength }}</mat-hint
        >
      </mat-form-field>

      <div class="d-flex justify-content-end">
        <button
          class="btn empty-button"
          (click)="confirm()(editForm.controls['item'].value)"
          [disabled]="editForm.invalid"
        >
          <div>{{ Localization.getWord('save') }}</div></button
        ><button class="btn empty-button" (click)="close()()">
          <div>{{ Localization.getWord('back') }}</div>
        </button>
      </div>
    </div>
  `,
  imports: [SharedModule],
  standalone: true,
})
export class AddChatFilterDialog implements OnInit {
  close = input.required<() => void>();

  confirm = input.required<(value: string) => void>();

  busyService = inject(BusyService);
  maxItemLength: number = 50;
  minItemLength: number = 3;
  itemLengthCounter: number = 0;
  adminComment: string | undefined;
  editForm: FormGroup = new FormGroup({});
  private formBuilder = inject(FormBuilder);
  matErrorService = inject(MatErrorService);
  Localization = Localization;

  ngOnInit(): void {
    this.editForm = this.formBuilder.group({
      item: [
        undefined,
        [
          Validators.required,
          Validators.maxLength(this.maxItemLength),
          Validators.minLength(this.minItemLength),
        ],
      ],
    });

    this.editForm.controls['item'].valueChanges.subscribe(() => {
      this.updateChatFilterCounter();
    });

    this.matErrorService.addErrorsInfo('item', {
      maxLength: this.maxItemLength,
      minLength: this.minItemLength,
    });
    this.updateChatFilterCounter();
  }

  updateChatFilterCounter() {
    const itemValue = this.editForm.controls['item']?.value || '';
    this.itemLengthCounter = itemValue.length;
  }
}
