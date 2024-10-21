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
import { MAT_DATE_LOCALE, provideNativeDateAdapter} from '@angular/material/core';
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
    NgIf
  ],
  templateUrl: './mat-adv-list-filter.component.html',
  styleUrl: './mat-adv-list-filter.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'ru-RU'},],
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
    this.currentSortOption().searchValue =
      this.sortForm.get('searchValue')?.value;
  }

  save() {
    this.updateCurrentSortOption();
    this.dialogRef.close(this.currentSortOption());
  }
}
