import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss'
})
export class ConfirmModalComponent {
  @Input() title: string = '';
  @Input() info: string = '';
  @Input() firstButtonLabel: string = '';
  @Input() secondButtonLabel: string = '';

  @Output() firstButtonAction = new EventEmitter<void>();
  @Output() secondButtonAction = new EventEmitter<void>();

  onFirstButtonClick() {
    this.firstButtonAction.emit();
  }

  onSecondButtonClick() {
    this.secondButtonAction.emit();
  }
}
