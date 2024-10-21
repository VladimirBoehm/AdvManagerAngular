import { Component, EventEmitter, inject, Output } from '@angular/core';
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
import { MatAdvListFilterComponent } from '../mat-adv-list-filter/mat-adv-list-filter.component';

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
  templateUrl: './adv-list-filter.component.html',
  providers: [provideNativeDateAdapter()],
  styleUrl: './adv-list-filter.component.scss',
})
export class AdvListFilterComponent {
  dialog = inject(MatDialog);
  @Output() onChanged = new EventEmitter<SortOption>();
  advertisementService = inject(AdvertisementService);

  onFilterClick() {
    this.dialog
      .open(MatAdvListFilterComponent, {
        position: { top: '10px' },
        panelClass: 'custom-dialog-container',
      })
      .afterClosed()
      .subscribe((result: SortOption | null) => {
        if (result) {
          this.onChanged.emit(result);
          console.log('Диалог вернул данные:', result);
        }
      });
  }

  getLabelText() {
    let fieldTranslation = '';

    switch (this.advertisementService.getCurrentSortOptions()?.field) {
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
}
