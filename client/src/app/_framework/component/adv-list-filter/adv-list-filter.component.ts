import {
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
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
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-adv-list-filter',
  standalone: true,
  imports: [
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    ReactiveFormsModule,
    NgIf,
    BsDatepickerModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule
  ],
  templateUrl: './adv-list-filter.component.html',
  providers: [provideNativeDateAdapter()],
  styleUrl: './adv-list-filter.component.scss',
})
export class AdvListFilterComponent implements OnInit {
  @ViewChild('modalDialog') modalDialog?: any;
  @Output() onChanged = new EventEmitter<SortOption>();

  modalRef?: BsModalRef;
  private modalService = inject(BsModalService);
  private formBuilder = inject(FormBuilder);
  private advertisementService = inject(AdvertisementService);

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

    this.modalRef = this.modalService.show(this.modalDialog);
  }

  getLabelText() {
    let fieldTranslation = '';

    switch (this.currentSortOption().field) {
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
    this.onChanged.emit(this.currentSortOption());
    this.modalRef?.hide();
  }
  clearSearch() {
    this.sortForm.get('searchValue')?.setValue('');
    this.currentSortOption().searchValue = '';
  }
}
