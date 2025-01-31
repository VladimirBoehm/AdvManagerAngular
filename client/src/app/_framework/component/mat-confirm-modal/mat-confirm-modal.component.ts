import {
  Component,
  inject,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialogData } from '../../../_entities/confirm-dialog-data';
import { TelegramBackButtonService } from '../../../_services/telegramBackButton.service';

@Component({
  selector: 'app-mat-confirm-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
  ],
  templateUrl: './mat-confirm-modal.component.html',
  styleUrl: './mat-confirm-modal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MatConfirmModalComponent implements OnInit, OnDestroy {
  private backButtonService = inject(TelegramBackButtonService);
  constructor(
    public dialogRef: MatDialogRef<MatConfirmModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  ngOnInit(): void {
    this.backButtonService.setCloseDialogHandler(() => this.close());
  }

  close(): void {
    this.dialogRef.close();
  }
  ngOnDestroy(): void {
    this.backButtonService.removeCloseDialogHandler();
  }
}
