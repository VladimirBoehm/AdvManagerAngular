import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

import { ReactiveFormsModule } from '@angular/forms';
import { SortOption } from '../../../_models/sortOption';
import { NgIf } from '@angular/common';
import { AdvertisementService } from '../../../_services/advertisement.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatListFilterComponentModal } from './mat-adv-list-filter-modal/mat-list-filter-modal.component';
import { ChatFilterService } from '../../../_services/chat-filter.service';
import { TelegramBackButtonService } from '../../telegramBackButtonService';

@Component({
  selector: 'app-adv-list-filter',
  standalone: true,
  imports: [
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    ReactiveFormsModule,
    NgIf,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
  ],
  templateUrl: './list-filter.component.html',
  providers: [provideNativeDateAdapter()],
  styleUrl: './list-filter.component.scss',
})
export class ListFilterComponent implements OnInit, OnDestroy {
  @Input() isAdvertisementList = false;
  @Input() disabled = false;
  @Output() onChanged = new EventEmitter<SortOption>();

  dialog = inject(MatDialog);
  advertisementService = inject(AdvertisementService);
  chatFilterService = inject(ChatFilterService);
  private dialogRef: any;
  private backButtonService = inject(TelegramBackButtonService);

  onFilterClick() {
    this.dialogRef = this.dialog
      .open(MatListFilterComponentModal, {
        position: { top: '10px' },
        panelClass: 'custom-dialog-container',
        data: { isAdvertisementList: this.isAdvertisementList },
      })
      .afterClosed()
      .subscribe((result: SortOption | null) => {
        if (result) {
          this.onChanged.emit(result);
        }
      });
  }

  ngOnInit(): void {
    this.backButtonService.setBackButtonHandler(() => {
      if (this.dialogRef) {
        this.dialogRef.close();
      }
    });
  }

  getLabelText() {
    let fieldTranslation = '';
    let field;
    if (this.isAdvertisementList)
      field = this.advertisementService.getCurrentSortOptions()?.field;
    else field = this.chatFilterService.getCurrentSortOptions()?.field;

    switch (field) {
      case 'date':
        fieldTranslation = 'дате';
        break;
      case 'title':
        fieldTranslation = 'заголовку';
        break;
      case 'username':
        fieldTranslation = 'username';
        break;
      case 'name':
        fieldTranslation = 'имени';
        break;
    }
    return `по ${fieldTranslation}`;
  }

  getCurrentSortOptionsText() {
    const order = this.isAdvertisementList
      ? this.advertisementService.getCurrentSortOptions()?.order
      : this.chatFilterService.getCurrentSortOptions()?.order;

    return order === 'asc' ? 'по возрастанию' : 'по убыванию';
  }

  ngOnDestroy(): void {
    this.backButtonService.removeBackButtonHandler();
  }
}
