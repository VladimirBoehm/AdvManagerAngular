import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatErrorService } from '../../../../_framework/component/errors/mat-error-service';
import { CustomValidators } from '../../../../_framework/component/validators/customValidators';
import { SharedModule } from '../../../../_framework/modules/sharedModule';
import { Localization } from '../../../../_framework/component/helpers/localization';
export interface ButtonLink {
  buttonName: string;
  link: string;
}

@Component({
  selector: 'app-add-advertisement-button-modal',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './add-advertisement-button-modal.component.html',
  providers: [MatErrorService],
})
export class AddAdvertisementButtonModalComponent implements OnInit {

  close = input.required<() => void>();
  buttonName = input.required<string | undefined>();
  link = input.required<string | undefined>();
  onSave = output<ButtonLink>();

  private formBuilder = inject(FormBuilder);
  matErrorService = inject(MatErrorService);
  editForm: FormGroup = new FormGroup({});
  buttonNameCounter: number = 0;
  maxButtonNameLength: number = 20;
  linkCounter: number = 0;
  maxLinkLength: number = 500;
  Localization = Localization;

  ngOnInit(): void {
    this.initializeForm();
    this.updateButtonNameCounter();
    this.updateLinkCounter();
  }

  initializeForm() {
    this.editForm = this.formBuilder.group({
      buttonName: [
        this.buttonName(),
        [Validators.required, Validators.maxLength(this.maxButtonNameLength)],
      ],
      link: [
        this.link(),
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



  save() {
    this.onSave.emit({
      buttonName: this.editForm.controls['buttonName']?.value,
      link: this.editForm.controls['link']?.value,
    } as ButtonLink);
  }
}
