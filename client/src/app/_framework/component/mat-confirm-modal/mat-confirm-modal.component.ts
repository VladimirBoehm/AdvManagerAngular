import { Component, Inject, ViewEncapsulation } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
  MatDialogContent,
  MatDialogTitle,
  MatDialogActions,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-mat-confirm-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogTitle,
    MatDialogActions,
  ],
  templateUrl: './mat-confirm-modal.component.html',
  styleUrl: './mat-confirm-modal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MatConfirmModalComponent {
  constructor(
    public dialogRef: MatDialogRef<MatConfirmModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onFirstButtonClick(): void {
    this.dialogRef.close('first');
  }

  onSecondButtonClick(): void {
    this.dialogRef.close('second');
  }
}

export interface ConfirmDialogData {
  title: string;
  info?: string;
  firstButtonLabel: string;
  secondButtonLabel: string;
}
