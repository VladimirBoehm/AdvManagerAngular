import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FeedbackService } from '../_services/feedbackService';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatErrorService } from '../_framework/component/errors/mat-error-service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfirmModalComponent } from '../_framework/component/confirm-modal/confirm-modal.component';
import { TelegramBackButtonService } from '../_framework/telegramBackButtonService';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Feedback } from '../_models/feedback';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ConfirmModalComponent,
    ReactiveFormsModule,
    NgIf,
  ],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss',
  providers: [MatErrorService],
})
export class FeedbackComponent implements OnInit {
  @ViewChild('modalDialog') modalDialog?: any;

  private backButtonService = inject(TelegramBackButtonService);
  private feedbackService = inject(FeedbackService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private modalService = inject(BsModalService);
  matErrorService = inject(MatErrorService);

  isSend: boolean = false;
  editForm: FormGroup = new FormGroup({});
  modalRef?: BsModalRef;
  feedbackCounter: number = 0;
  maxFeedbackLength: number = 500;

  ngOnInit(): void {
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigate(['']);
    });

    this.initializeForm();
  }
  initializeForm() {
    this.editForm = this.formBuilder.group({
      feedback: [
        '',
        [Validators.maxLength(this.maxFeedbackLength), Validators.required],
      ],
    });

    this.editForm.controls['feedback']?.valueChanges.subscribe(() => {
      this.updateFeedbackCounter();
    });

    this.matErrorService.addErrorsInfo('feedback', {
      maxLength: this.maxFeedbackLength,
    });
  }
  updateFeedbackCounter() {
    const feedbackValue = this.editForm.controls['feedback']?.value || '';
    this.feedbackCounter = feedbackValue.length;
  }

  onSendClick() {
    this.modalRef = this.modalService.show(this.modalDialog);
  }

  send() {
    const feedback: Feedback = {
      text: this.editForm.controls['feedback']?.value,
    };
    this.feedbackService.send(feedback);
    this.isSend = true;
    this.modalRef?.hide();
  }
}
