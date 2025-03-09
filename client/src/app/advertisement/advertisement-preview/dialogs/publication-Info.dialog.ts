import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Localization } from '../../../_framework/component/helpers/localization';
import { ThreeDotsLoadingComponent } from '../../../_framework/component/loaders/custom-loading-bar/three-dots-loading.component';
import { SharedModule } from '../../../_framework/modules/sharedModule';
import { AppStore } from '../../../appStore/app.store';
import { PublishService } from '../../../_services/api.services/publish.service';
import { ResponseWrapper } from '../../../_entities/responseWrapper';

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
          *ngIf="isLoading(); else nextPublishDateTemplate"
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
          (click)="confirm()(nextPublishDate()!)"
          [disabled]="isLoading()"
        >
          <div>{{ Localization.getWord('confirm') }}</div>
        </button>
        <button class="btn empty-button" (click)="close()()">
          <div>{{ Localization.getWord('back') }}</div>
        </button>
      </div>
    </div>
  `,
  imports: [ThreeDotsLoadingComponent, SharedModule],
  standalone: true,
})
export class PublicationInfoDialog implements OnInit {
  Localization = Localization;
  isLoading = signal<boolean>(true);
  nextPublishDate = signal<Date | undefined>(undefined);
  confirm = input.required<(nextPublishDate: Date) => void>();
  close = input.required<() => void>();
  readonly appStore = inject(AppStore);
  publishService = inject(PublishService);

  ngOnInit(): void {
    this.publishService
      .getRegularPublishNextDate(this.appStore.selectedAdvertisement()?.id ?? 0)
      .subscribe({
        next: (result: ResponseWrapper<Date>) => {
          this.nextPublishDate.set(result.data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error by getting regularPublishNextDate:', err);
        },
      });
  }
}
