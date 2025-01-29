import { Component, inject, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { ImagePreviewModalComponent } from '../../_framework/component/image-preview-modal/image-preview-modal.component';
import { DateHelper } from '../../_framework/component/helpers/dateHelper';
import { TelegramBackButtonService } from '../../_services/telegramBackButton.service';
import { Localization } from '../../_framework/component/helpers/localization';
import { AppStore } from '../../appStore/app.store';

@Component({
  selector: 'app-advertisement-main-data',
  standalone: true,
  imports: [SharedModule, ImagePreviewModalComponent],
  templateUrl: './advertisement-main-data.component.html',
  styleUrl: './advertisement-main-data.component.scss',
})
export class AdvertisementMainDataComponent {
  @ViewChild('imageShowTemplate') imageShowTemplate?: any;
  private modalService = inject(BsModalService);
  private backButtonService = inject(TelegramBackButtonService);
  appStore = inject(AppStore);

  modalRef?: BsModalRef;
  dateHelper = DateHelper;
  Localization = Localization;

  showImage() {
    this.backButtonService.setCloseDialogHandler(() => this.modalRef?.hide());
    this.modalRef = this.modalService.show(this.imageShowTemplate);
  }

  closeDialog = () => {
    this.modalRef?.hide();
  };
}
