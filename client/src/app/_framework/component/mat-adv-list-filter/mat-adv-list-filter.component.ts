import { Component, ViewEncapsulation } from '@angular/core';
import {
  MatDialogModule,
  MatDialogContent,
  MatDialogTitle,
  MatDialogActions,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { SortOption } from '../../../_models/sortOption';
import { NgIf } from '@angular/common';
import { AdvertisementService } from '../../../_services/advertisement.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YY',
  },
  display: {
    dateInput: 'DD.MM.YY',
    monthYearLabel: 'MMM YY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YY',
  },
};
@Component({
  selector: 'app-mat-adv-list-filter',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogTitle,
    MatDialogActions,
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    ReactiveFormsModule,
    NgIf,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    NgIf,
  ],
  templateUrl: './mat-adv-list-filter.component.html',
  styleUrl: './mat-adv-list-filter.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [provideMomentDateAdapter(MY_DATE_FORMATS)],
})
export class MatAdvListFilterComponent {
  private formBuilder = inject(FormBuilder);
  private advertisementService = inject(AdvertisementService);
  public dialogRef: MatDialogRef<MatAdvListFilterComponent> = inject(
    MatDialogRef<MatAdvListFilterComponent>
  );
  sortForm: FormGroup = new FormGroup({});
  currentSortOption = signal<SortOption>({
    field: 'date',
    order: 'desc',
    searchType: 'title',
    searchValue: '',
  } as SortOption);

  ngOnInit(): void {
    const currentSortOptions =
      this.advertisementService.getCurrentSortOptions();
    if (currentSortOptions) this.currentSortOption.set(currentSortOptions);

    this.sortForm = this.formBuilder.group({
      selectedSortType: [this.currentSortOption().field, Validators.required],
      selectedSortDate: ['desc', Validators.required],
      selectedSortTitle: ['desc', Validators.required],
      selectedSortUsername: ['desc', Validators.required],
      selectedSortName: ['desc', Validators.required],
      selectedSearchType: [
        this.currentSortOption().searchType,
        Validators.required,
      ],
      searchValue: [
        this.currentSortOption().searchValue,
        Validators.maxLength(200),
      ],
      dateRange: this.formBuilder.group({
        start: [this.currentSortOption().dateRange?.start || null],
        end: [this.currentSortOption().dateRange?.end || null],
      }),
    });
  }

  onFilterClick() {
    // Reset the form values to currentSortOption
    this.sortForm.patchValue({
      selectedSortType: this.currentSortOption().field,
      selectedSortDate:
        this.currentSortOption().field === 'date'
          ? this.currentSortOption().order
          : 'desc',
      selectedSortTitle:
        this.currentSortOption().field === 'title'
          ? this.currentSortOption().order
          : 'desc',
      selectedSortUsername:
        this.currentSortOption().field === 'username'
          ? this.currentSortOption().order
          : 'desc',
      selectedSortName:
        this.currentSortOption().field === 'name'
          ? this.currentSortOption().order
          : 'desc',
    });
  }

  updateCurrentSortOption(): void {
    const field = this.sortForm.get('selectedSortType')?.value;
    let order: 'asc' | 'desc';

    switch (field) {
      case 'date':
        order = this.sortForm.get('selectedSortDate')?.value;
        break;
      case 'title':
        order = this.sortForm.get('selectedSortTitle')?.value;
        break;
      case 'username':
        order = this.sortForm.get('selectedSortUsername')?.value;
        break;
      case 'name':
        order = this.sortForm.get('selectedSortName')?.value;
        break;
      default:
        order = 'desc';
    }

    this.currentSortOption().field = field;
    this.currentSortOption().order = order;
    this.currentSortOption().searchType =
      this.sortForm.get('selectedSearchType')?.value;

    if (this.currentSortOption().searchType === 'date') {
      const dateRange = this.sortForm.get('dateRange')?.value;
      this.currentSortOption().dateRange = {
        start: dateRange.start,
        end: dateRange.end,
      };
      // Clear searchValue when searchType is 'date'
      this.currentSortOption().searchValue = undefined;
    } else {
      this.currentSortOption().searchValue =
        this.sortForm.get('searchValue')?.value;
      // Clear dateRange when searchType is not 'date'
      this.currentSortOption().dateRange = undefined;
    }
  }

  save() {
    this.updateCurrentSortOption();
    console.log(this.sortForm);
    this.dialogRef.close(this.currentSortOption());
  }
}
