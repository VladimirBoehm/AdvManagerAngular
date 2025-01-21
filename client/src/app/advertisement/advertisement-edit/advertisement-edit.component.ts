import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TelegramBackButtonService } from '../../_framework/telegramBackButtonService';
import { ActivatedRoute, Router } from '@angular/router';
import { Advertisement } from '../../_models/advertisement';
import { AdvertisementService } from '../../_services/advertisement.service';
import { AccountService } from '../../_services/account.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AdImage } from '../../_models/adImage';
import {
  AddAdvertisementButtonModalComponent,
  ButtonLink,
} from './add-advertisement-button-modal/add-advertisement-button-modal.component';
import { MatErrorService } from '../../_framework/component/errors/mat-error-service';
import { AdvertisementStatus } from '../../_framework/constants/advertisementStatus';
import { AppListType } from '../../_framework/constants/advListType';
import { SharedModule } from '../../_framework/modules/sharedModule';
import { ImagePreviewModalComponent } from '../../_framework/component/image-preview-modal/image-preview-modal.component';
import { BusyService } from '../../_services/busy.service';
import { Localization } from '../../_framework/component/helpers/localization';
import _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { AppStore } from '../../appStore/app.store';

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
  private advertisementService = inject(AdvertisementService);
  private accountService = inject(AccountService);
  private modalService = inject(BsModalService);
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  readonly appStore = inject(AppStore);
  matErrorService = inject(MatErrorService);
  busyService = inject(BusyService);

  modalRef?: BsModalRef;
  editForm: FormGroup = new FormGroup({});

  titleCounter: number = 0;
  maxTitleLength: number = 30;
  messageCounter: number = 0;
  maxMessageLength: number = 650;
  advertisementId: number = 0;
  advertisement?: Advertisement;
  userImages: AdImage[] = [];

  Localization = Localization;

  ngOnInit(): void {
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigate(['/adv-list', AppListType.MyAdvertisements]);
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id && Number(id) > 0) {
        // this.advertisementService.getById(Number(id))?.subscribe({
        //   next: (advertisement: Advertisement) => {
        //     this.advertisement = advertisement;
        //     this.initializeForm();
        //   },
        //   error: (err) => {
        //     console.error('Error when loading ads:', err);
        //   },
        // });
      } else {
        this.advertisement = {
          id: 0,
          userId: this.appStore.user()?.userId ?? 0,
          title: '',
          message: '',
          statusId: 0,
          adImage: undefined,
        };
        this.initializeForm();
      }
    });
  }

  initializeForm() {
    this.editForm = this.formBuilder.group({
      title: [
        this.advertisement?.title,
        [Validators.required, Validators.maxLength(this.maxTitleLength)],
      ],
      message: [
        this.advertisement?.message,
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
    if (this.advertisement) {
      this.advertisement.title = this.editForm.controls['title']?.value;
      this.advertisement.message = this.editForm.controls['message']?.value;
      this.advertisement.statusId = AdvertisementStatus.new;
      if (this.advertisement?.id === 0) {
        (await this.advertisementService.save(this.advertisement)).subscribe({
          next: (result: Advertisement) => {
            this.router.navigate(['app-advertisement-preview', result.id]);
          },
          error: (err) => {
            console.error('Error when saving ads:', err);
          },
        });
      } else {
        (await this.advertisementService.update(this.advertisement)).subscribe({
          next: () => {
            this.router.navigate([
              'app-advertisement-preview',
              this.advertisement?.id,
            ]);
          },
          error: (err) => {
            console.error('Error when updating ads:', err);
          },
        });
      }
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
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

      const adImage = {
        id: 0,
        userId: this.appStore.user()?.userId ?? 0,
        file: input.files[0],
        url: URL.createObjectURL(input.files[0]),
      } as AdImage;

      const clonedAdvertisement = _.cloneDeep(this.advertisement);
      if (clonedAdvertisement) {
        clonedAdvertisement.adImage = adImage;
        this.advertisement = clonedAdvertisement;
      }
    }
  }

  showAddAdvertisementButtonDialog() {
    this.modalRef = this.modalService.show(
      this.modalAddAdvertisementButtonDialog
    );
  }

  deleteImage() {
    const clonedAdvertisement = _.cloneDeep(this.advertisement);
    if (clonedAdvertisement) {
      clonedAdvertisement.adImageId = undefined;
      clonedAdvertisement.adImage = undefined;
      this.advertisement = clonedAdvertisement;
    }
  }

  showImage() {
    this.modalRef = this.modalService.show(this.imageShowTemplate);
  }

  removeAdvertisementButton() {
    if (this.advertisement) {
      this.advertisement.linkName = undefined;
      this.advertisement.linkValue = undefined;
    }
  }

  receiveButtonLink(event: ButtonLink) {
    if (this.advertisement) {
      this.advertisement.linkName = event.buttonName;
      this.advertisement.linkValue = event.link;
    }
    this.modalRef?.hide();
  }

  get altText(): string {
    return Localization.getWord('image');
  }
}
