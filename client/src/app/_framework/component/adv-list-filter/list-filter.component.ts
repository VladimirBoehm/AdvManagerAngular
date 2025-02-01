import { Component, inject, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { ReactiveFormsModule } from '@angular/forms';
import { SortOption } from '../../../_entities/sortOption';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatListFilterComponentModal } from './mat-adv-list-filter-modal/mat-list-filter-modal.component';
import { Localization } from '../helpers/localization';
import cloneDeep from 'lodash-es/cloneDeep';
@Component({
  selector: 'app-adv-list-filter',
  standalone: true,
  imports: [
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
  ],
  templateUrl: './list-filter.component.html',
  providers: [provideNativeDateAdapter()],
  styleUrl: './list-filter.component.scss',
})
export class ListFilterComponent {
  sortOption = input.required<SortOption>();
  disabled = input<boolean>(false);
  isExtended = input.required<boolean>();
  onChanged = output<SortOption>();

  dialog = inject(MatDialog);
  Localization = Localization;

  onFilterClick() {
    this.dialog
      .open(MatListFilterComponentModal, {
        position: { top: '10px' },
        panelClass: 'custom-dialog-container',
        data: {
          isExtended: this.isExtended(),
          sortOption: cloneDeep(this.sortOption()),
        },
      })
      .afterClosed()
      .subscribe((result: SortOption | null) => {
        if (result) {
          this.onChanged.emit(result);
        }
      });
  }

  getLabelText() {
    let fieldTranslation = '';
    const field = this.sortOption()?.field;
    switch (field) {
      case 'date':
        fieldTranslation = this.Localization.getWord('date_case');
        break;
      case 'title':
        fieldTranslation = this.Localization.getWord('title_case');
        break;
      case 'username':
        fieldTranslation = 'username';
        break;
      case 'name':
        fieldTranslation = this.Localization.getWord('name_case');
        break;
    }
    return `${this.Localization.getWord('by')} ${fieldTranslation}`;
  }

  getCurrentSortOptionsText() {
    const order = this.sortOption()?.order;

    return order === 'asc'
      ? this.Localization.getWord('ascending_order')
      : this.Localization.getWord('descending_order');
  }
}
