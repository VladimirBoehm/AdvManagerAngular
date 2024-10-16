import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatErrorService } from '../../../_framework/component/errors/mat-error-service';
import { CustomValidators } from '../../../_framework/component/validators/customValidators';
export interface ButtonLink {
  buttonName: string;
  link: string;
}

@Component({
  selector: 'app-add-advertisement-button-modal',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './add-advertisement-button-modal.component.html',
  styleUrl: './add-advertisement-button-modal.component.scss',
  providers: [MatErrorService],
})
export class AddAdvertisementButtonModalComponent implements OnInit {
  @Input() modalRef?: BsModalRef;
  @Input() buttonName?: string;
  @Input() link?: string;
  @Output() onSave = new EventEmitter<ButtonLink>();

  private formBuilder = inject(FormBuilder);
  matErrorService = inject(MatErrorService);
  editForm: FormGroup = new FormGroup({});
  buttonNameCounter: number = 0;
  maxButtonNameLength: number = 20;
  linkCounter: number = 0;
  maxLinkLength: number = 500;

  ngOnInit(): void {
    this.initializeForm();
    this.updateButtonNameCounter();
    this.updateLinkCounter();
  }

  initializeForm() {
    this.editForm = this.formBuilder.group({
      buttonName: [
        this.buttonName,
        [Validators.required, Validators.maxLength(this.maxButtonNameLength)],
      ],
      link: [
        this.link,
        [
          Validators.required,
          Validators.maxLength(this.maxLinkLength),
          CustomValidators.urlValidator(),
        ],
      ],
    });

    this.editForm.controls['buttonName'].valueChanges.subscribe(() => {
      this.updateButtonNameCounter();
    });

    this.editForm.controls['link'].valueChanges.subscribe(() => {
      this.updateLinkCounter();
    });

    this.matErrorService.addErrorsInfo('buttonName', {
      maxLength: this.maxButtonNameLength,
    });
    this.matErrorService.addErrorsInfo('link', {
      maxLength: this.maxLinkLength,
    });
  }

  updateButtonNameCounter() {
    const buttonNameValue = this.editForm.controls['buttonName']?.value || '';
    this.buttonNameCounter = buttonNameValue.length;
  }

  updateLinkCounter() {
    const linkValue = this.editForm.controls['link']?.value || '';
    this.linkCounter = linkValue.length;
  }

  closeModal() {
    this.modalRef?.hide();
  }

  save() {
    this.onSave.emit({
      buttonName: this.editForm.controls['buttonName']?.value,
      link: this.editForm.controls['link']?.value,
    } as ButtonLink);
  }
}
