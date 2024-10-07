import { Component, inject, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfirmModalComponent } from '../../_framework/component/confirm-modal/confirm-modal.component';
import { TelegramBackButtonService } from '../../_framework/telegramBackButtonService';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvListStates } from '../../_framework/constants/advListStates';
import { Advertisement } from '../../_models/advertisement';
import { AdvertisementService } from '../../_services/advertisement.service';
import { AccountService } from '../../_services/account.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormErrorMessageComponent } from '../../_framework/component/errors/form-error-message/form-error-message.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ImageService } from '../../_services/image.service';
import { AdImage } from '../../_models/adImage';
import { ImagePreviewModalComponent } from '../../_framework/component/image-preview-modal/image-preview-modal.component';
import {
  AddAdvertisementButtonModalComponent,
  ButtonLink,
} from './add-advertisement-button-modal/add-advertisement-button-modal.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-advertisement-edit',
  standalone: true,
  imports: [
    ConfirmModalComponent,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    FormErrorMessageComponent,
    NgClass,
    ImagePreviewModalComponent,
    AddAdvertisementButtonModalComponent,
    MatCardModule,
  ],
  templateUrl: './advertisement-edit.component.html',
  styleUrl: './advertisement-edit.component.scss',
})
export class AdvertisementEditComponent implements OnInit {
  editForm: FormGroup = new FormGroup({});
  @ViewChild('imageSelectorDialog') imageSelectorDialog?: any;
  @ViewChild('modalAddAdvertisementButtonDialog')
  modalAddAdvertisementButtonDialog?: any;
  @ViewChild('imageShowTemplate') imageShowTemplate?: any;

  private backButtonService = inject(TelegramBackButtonService);
  private advertisementService = inject(AdvertisementService);
  private imageService = inject(ImageService);
  private accountService = inject(AccountService);
  private modalService = inject(BsModalService);
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  modalRef?: BsModalRef;

  titleCounter: number = 0;
  maxTitleLength: number = 30;
  messageCounter: number = 0;
  maxMessageLength: number = 650;

  advertisementId: number = 0;
  advertisement?: Advertisement;
  userImages: AdImage[] = [];
  selectedImage: AdImage | null | undefined = null;

  ngOnInit(): void {
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigate([
        '/adv-list',
        AdvListStates.MyAdvertisements,
        false,
      ]);
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id && Number(id) > 0) {
        this.advertisementService.getById(Number(id)).subscribe({
          next: (advertisement: Advertisement) => {
            this.advertisement = advertisement;
            this.selectedImage = advertisement.adImage;
          },
          error: (err) => {
            console.error('Error when loading ads:', err);
          },
        });
      } else {
        this.advertisement = {
          id: 0,
          userId: this.accountService.currentUser()?.userId ?? 0,
          title: '',
          message: '',
          statusId: 0,
          adImage: undefined,
        };
      }
    });
    this.initializeForm();
    this.updateTitleCounter();
    this.updateMessageCounter();
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
  }

  updateTitleCounter() {
    const titleValue = this.editForm.controls['title']?.value || '';
    this.titleCounter = titleValue.length;
  }

  updateMessageCounter() {
    const messageValue = this.editForm.controls['message']?.value || '';
    this.messageCounter = messageValue.length;
  }

  save() {
    if (this.advertisement) {
      this.advertisement.title = this.editForm.controls['title']?.value;
      this.advertisement.message = this.editForm.controls['message']?.value;
      this.advertisementService.save(this.advertisement).subscribe({
        next: (result: Advertisement) => {
          this.router.navigate(['app-advertisement-preview', result.id]);
        },
        error: (err) => {
          console.error('Error when saving ads:', err);
        },
      });
    }
  }

  showImageSelector() {
    this.imageService.getUserImages().subscribe({
      next: (result: AdImage[]) => {
        this.userImages = result;
        console.log(this.userImages);
      },
      error: (err) => {
        console.error('Error when getUserImages :', err);
      },
    });
    this.modalRef = this.modalService.show(this.imageSelectorDialog);
  }

  showAddAdvertisementButtonDialog() {
    this.modalRef = this.modalService.show(
      this.modalAddAdvertisementButtonDialog
    );
  }

  deleteImage() {
    this.selectedImage = null;
    if (this.advertisement) {
      this.advertisement.adImage = undefined;
    }
  }

  selectImage(): void {
    if (this.selectedImage) {
      if (this.advertisement) {
        this.advertisement.adImage = this.selectedImage;
      }
      this.modalRef?.hide();
    }
  }

  selectImageHandler(image: any): void {
    this.selectedImage = image;
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
}
