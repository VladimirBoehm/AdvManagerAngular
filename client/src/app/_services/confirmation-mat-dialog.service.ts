import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatConfirmModalComponent } from '../_framework/component/mat-confirm-modal/mat-confirm-modal.component';
import { ConfirmDialogData } from '../_entities/confirm-dialog-data';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationMatDialogService {
  dialog = inject(MatDialog);

  confirmDialog(data: ConfirmDialogData): Observable<boolean> {
    return this.dialog
      .open(MatConfirmModalComponent, {
        data,
        position: { top: '10px' },
        panelClass: 'custom-dialog-container',
      })
      .afterClosed();
  }
}
