import { Component, inject, OnInit } from '@angular/core';
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
import { NgIf } from '@angular/common';
import { FormErrorMessageComponent } from '../../_framework/component/form-error-message/form-error-message.component';

@Component({
  selector: 'app-advertisement-edit',
  standalone: true,
  imports: [ConfirmModalComponent, ReactiveFormsModule, NgIf, FormErrorMessageComponent],
  templateUrl: './advertisement-edit.component.html',
  styleUrl: './advertisement-edit.component.scss',
})
export class AdvertisementEditComponent implements OnInit {
  editForm: FormGroup = new FormGroup({});

  private backButtonService = inject(TelegramBackButtonService);
  private advertisementService = inject(AdvertisementService);
  private accountService = inject(AccountService);
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  titleCounter: number = 0;
  maxTitleLength: number = 30;
  messageCounter: number = 0;
  maxMessageLength: number = 650;

  advertisementId: number = 0;
  advertisement?: Advertisement;

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
    console.log(this.editForm.invalid);
    console.log(this.editForm);
  }
}
