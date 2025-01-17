import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgRxTestEntity } from '../_models/ngRxTestEntity';
import { ConfirmationMatDialogService } from '../_services/confirmation-mat-dialog.service';
import { ngRxTestEntityStore } from './ngrxTest/ngRxTestEntity.store';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss',
})
export class TestComponent implements OnInit {
  confirmationService = inject(ConfirmationMatDialogService);
  readonly store = inject(ngRxTestEntityStore);

  firstItem: NgRxTestEntity | undefined;

  async ngOnInit(): Promise<void> {
    await this.store.loadAll();

    console.log(this.store);
    if (window.Telegram?.WebApp) {
      window.Telegram?.WebApp?.BackButton?.show();
      window.Telegram?.WebApp?.BackButton?.onClick(() => {
        window.history.back();
      });
    }
  }

  edit() {
    this.confirmationService
      .confirmDialog({
        title: 'Update item?',
        confirmText: 'yes',
        cancelText: 'no',
      })
      .subscribe((result) => {
        if (result === true) {
          const editedItem = {
            ...this.store.ngRxTestEntities()[0],
            value: 'aaaaaAA!',
          };
          this.store.updateEntity(editedItem);
        }
      });
  }
}
