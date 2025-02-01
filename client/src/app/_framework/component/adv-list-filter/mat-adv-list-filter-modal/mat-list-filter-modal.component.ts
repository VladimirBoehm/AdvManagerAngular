import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { SortOption } from '../../../../_entities/sortOption';
import { TelegramBackButtonService } from '../../../../_services/telegramBackButton.service';
import { SharedModule } from '../../../modules/sharedModule';
import { Localization } from '../../helpers/localization';
import { AppStore } from '../../../../appStore/app.store';

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
  imports: [SharedModule],
  templateUrl: './mat-list-filter-modal.component.html',
  styleUrl: './mat-list-filter-modal.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [provideMomentDateAdapter(MY_DATE_FORMATS)],
})
export class MatListFilterComponentModal implements OnInit, OnDestroy {
  private formBuilder = inject(FormBuilder);
  private backButtonService = inject(TelegramBackButtonService);
  readonly appStore = inject(AppStore);
  sortForm: FormGroup = new FormGroup({});
  currentSortOption = signal<SortOption>({} as SortOption);
  Localization = Localization;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { isExtended: boolean; sortOption: SortOption },
    private dialogRef: MatDialogRef<MatListFilterComponentModal>
  ) {
    this.currentSortOption.set(data.sortOption);
  }

  ngOnInit(): void {
    this.backButtonService.setCloseDialogHandler(() => this.close());
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
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
        start: [this.currentSortOption().dateRange?.start || currentDate],
        end: [this.currentSortOption().dateRange?.end || currentDate],
      }),
    });

    this.setSortOptions();
  }

  setSortOptions() {
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
        start: new Date(dateRange.start),
        end: new Date(dateRange.end),
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
    this.dialogRef.close(this.currentSortOption());
  }

  close(): void {
    this.dialogRef.close(null);
  }

  ngOnDestroy(): void {
    this.backButtonService.removeCloseDialogHandler();
  }
}
