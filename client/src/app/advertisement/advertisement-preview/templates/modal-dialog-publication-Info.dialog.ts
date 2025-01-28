import { Component, inject, input, Input } from '@angular/core';
import { Localization } from '../../../_framework/component/helpers/localization';
import { ThreeDotsLoadingComponent } from '../../../_framework/component/custom-loading-bar/three-dots-loading.component';
import { BusyService } from '../../../_services/busy.service';
import { SharedModule } from '../../../_framework/modules/sharedModule';

@Component({
  selector: 'modal-dialog-publication-info',
  template: `
    <div class="modal-body">
      <div class="text-center mb-1">
        {{ Localization.getWord('ad_will_be_queued') }}
      </div>
      <div class="d-flex justify-content-center align-items-center mb-2">
        <div class="text-center me-2">
          {{ Localization.getWord('starting_from') }}
        </div>
        <app-three-dots-loading
          class="ms-2"
          *ngIf="
            busyService.isLoading() && !nextPublishDate;
            else nextPublishDateTemplate
          "
        ></app-three-dots-loading>
        <ng-template #nextPublishDateTemplate>
          <div class="text-center ">
            {{ nextPublishDate() | date : 'dd.MM.yyyy' }}
          </div>
        </ng-template>
      </div>

      <div class="text-center text-muted mb-2 my-info-text lh-sm mt-1">
        {{ Localization.getWord('placement_depends_on_activity') }}
      </div>
      <div class="d-flex justify-content-end">
        <button
          class="btn empty-button me-4"
          (click)="modalDialogPublishConfirm()()"
          [disabled]="busyService.isLoading()"
        >
          <div>{{ Localization.getWord('confirm') }}</div>
        </button>
        <button class="btn empty-button" (click)="hideDialog()()">
          <div>{{ Localization.getWord('back') }}</div>
        </button>
      </div>
    </div>
  `,
  imports: [ThreeDotsLoadingComponent, SharedModule],
  standalone: true,
})
export class ModalDialogPublicationInfo {
  Localization = Localization;
  busyService = inject(BusyService);

  nextPublishDate = input.required<Date | undefined>();
  modalDialogPublishConfirm = input.required<() => void>();
  hideDialog = input.required<() => void>();
}
