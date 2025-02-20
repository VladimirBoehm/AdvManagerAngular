import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TelegramBackButtonService } from '../../_services/telegramBackButton.service';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AdImage } from '../../_models/adImage';
import {
  AddAdvertisementButtonModalComponent,
  ButtonLink,
} from './dialogs/add-advertisement-button-modal/add-advertisement-button-modal.component';
import { MatErrorService } from '../../_framework/component/errors/mat-error-service';
import { AdvertisementStatus } from '../../_framework/constants/advertisementStatus';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { ImagePreviewModalComponent } from '../../_framework/component/image-preview-modal/image-preview-modal.component';
import { BusyService } from '../../_services/busy.service';
import { Localization } from '../../_framework/component/helpers/localization';
import { ToastrService } from 'ngx-toastr';
import { AppStore } from '../../appStore/app.store';
import { FileService } from '../../appStore/file.service';
import { ErrorLogClientService } from '../../_services/api.services/errorLogClient.service';
import { ErrorLogClient } from '../../_models/errorLogClient';

@Component({
  selector: 'app-advertisement-edit',
  standalone: true,
  imports: [
    SharedModule,
    AddAdvertisementButtonModalComponent,
    ImagePreviewModalComponent,
  ],
  templateUrl: './advertisement-edit.component.html',
  styleUrl: './advertisement-edit.component.scss',
  providers: [MatErrorService],
})
export class AdvertisementEditComponent implements OnInit {
  @ViewChild('modalAddAdvertisementButtonDialog')
  modalAddAdvertisementButtonDialog?: any;
  @ViewChild('imageShowTemplate') imageShowTemplate?: any;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private maxImageSizeMb = 5;
  private backButtonService = inject(TelegramBackButtonService);
  private modalService = inject(BsModalService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private fileService = inject(FileService);
  readonly appStore = inject(AppStore);
  matErrorService = inject(MatErrorService);
  busyService = inject(BusyService);
  private errorLogService = inject(ErrorLogClientService);

  modalRef?: BsModalRef;
  editForm: FormGroup = new FormGroup({});

  titleCounter: number = 0;
  maxTitleLength: number = 30;
  messageCounter: number = 0;
  maxMessageLength: number = 650;
  advertisementId: number = 0;
  userImages: AdImage[] = [];
  Localization = Localization;

  ngOnInit(): void {
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigateByUrl('app-adv-list-my-advertisements');
    });

    this.initializeForm();
  }

  initializeForm() {
    this.editForm = this.formBuilder.group({
      title: [
        this.appStore.selectedAdvertisement()?.title,
        [Validators.required, Validators.maxLength(this.maxTitleLength)],
      ],
      message: [
        this.appStore.selectedAdvertisement()?.message,
        [Validators.required, Validators.maxLength(this.maxMessageLength)],
      ],
    });

    this.editForm.controls['title'].valueChanges.subscribe(() => {
      this.updateTitleCounter();
    });

    this.editForm.controls['message'].valueChanges.subscribe(() => {
      this.updateMessageCounter();
    });

    this.matErrorService.addErrorsInfo('title', {
      maxLength: this.maxTitleLength,
    });
    this.matErrorService.addErrorsInfo('message', {
      maxLength: this.maxMessageLength,
    });

    this.updateTitleCounter();
    this.updateMessageCounter();
  }

  updateTitleCounter() {
    const titleValue = this.editForm.controls['title']?.value || '';
    this.titleCounter = titleValue.length;
  }

  updateMessageCounter() {
    const messageValue = this.editForm.controls['message']?.value || '';
    this.messageCounter = messageValue.length;
  }

  async save() {
    try {
      this.appStore.updateSelectedAdvertisement({
        title: this.editForm.controls['title']?.value,
        message: this.editForm.controls['message']?.value,
        statusId: AdvertisementStatus.new,
      });

      if (this.appStore.selectedAdvertisement()?.id === 0) {
        await this.appStore.createAdvertisementAsync(
          this.appStore.selectedAdvertisement()!
        );
        this.router.navigateByUrl('app-advertisement-preview');
      } else {
        await this.appStore.updateAdvertisementAsync(
          this.appStore.selectedAdvertisement()!
        );
        this.router.navigateByUrl('app-advertisement-preview');
      }
    } catch (error) {
      this.toastr.error(Localization.getWord('error_occurred_contact_admin'));
      const errorLogClient = {
        errorMessage: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        additionalInfo: 'advertisement-edit.component.ts: save()',
      } as ErrorLogClient;
      this.errorLogService.send(errorLogClient);
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const allowedExtensions = ['jpg', 'jpeg', 'png'];
      const fileExtension = input.files[0].name.split('.').pop()?.toLowerCase();
      if (fileExtension && !allowedExtensions.includes(fileExtension)) {
        this.toastr.error(Localization.getWord('invalid_file_type'));
        return;
      }

      const maxSizeInBytes = this.maxImageSizeMb * 1024 * 1024;
      if (input.files[0].size > maxSizeInBytes) {
        this.toastr.error(
          Localization.getFormattedWord('file_too_large', {
            size: this.maxImageSizeMb,
          })
        );
        return;
      }

      console.log('>>> file input', input.files[0]);
      this.appStore.updateSelectedAdvertisement({
        adImage: {
          id: 0,
          userId: this.appStore.user()?.userId ?? 0,
          url: URL.createObjectURL(input.files[0]),
        },
      });

      await this.fileService.saveFile(input.files[0]);
    }
  }

  showAddAdvertisementButtonDialog() {
    this.modalRef = this.modalService.show(
      this.modalAddAdvertisementButtonDialog
    );
  }

  deleteImage() {
    this.appStore.updateSelectedAdvertisement({
      adImageId: undefined,
      adImage: undefined,
    });
  }

  showImage() {
    this.modalRef = this.modalService.show(this.imageShowTemplate);
  }

  removeAdvertisementButton() {
    this.appStore.updateSelectedAdvertisement({
      linkName: undefined,
      linkValue: undefined,
    });
  }

  receiveButtonLink(event: ButtonLink) {
    this.appStore.updateSelectedAdvertisement({
      linkName: event.buttonName,
      linkValue: event.link,
    });
    this.closeDialog();
  }

  closeDialog = () => {
    this.modalRef?.hide();
  };

  get altText(): string {
    return Localization.getWord('image');
  }
}
