import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers';
import { CommonModule } from '@angular/common';
import { first, Observable } from 'rxjs';
import { NgRxTestEntity } from '../_models/ngRxTestEntity';
import { ConfirmationMatDialogService } from '../_services/confirmation-mat-dialog.service';
import { Update } from '@ngrx/entity';
import { TestEntityService } from './services/test-entity.service';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss',
})
export class TestComponent implements OnInit {
  store = inject(Store<AppState>);
  testService = inject(TestEntityService);
  confirmationService = inject(ConfirmationMatDialogService);
  tests$: Observable<NgRxTestEntity[]> | undefined;
  firstItem: NgRxTestEntity | undefined;

  ngOnInit(): void {
    this.testService.getAll();
    this.tests$ = this.testService.entities$;

    if (window.Telegram?.WebApp) {
      window.Telegram?.WebApp?.BackButton?.show();
      window.Telegram?.WebApp?.BackButton?.onClick(() => {
        window.history.back();
      });
    }
  }

  getFirstItem(tests$: Observable<NgRxTestEntity[]>) {
    tests$?.pipe(first()).subscribe((tests) => {
      if (tests && tests.length > 0) {
        this.firstItem = tests[0];
      } else {
        console.log('No items found.');
      }
    });
  }

  trackById(index: number, item: NgRxTestEntity): number {
    return item.id;
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
          const editedItem = { ...this.firstItem, value: 'aaaaaAA!' };
          const update: Update<NgRxTestEntity> = {
            id: this.firstItem?.id ?? 0,
            changes: editedItem,
          };

          //  this.store.dispatch(testUpdated({ update }));
        }
      });
  }
}
