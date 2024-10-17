import {
  Component,
  EventEmitter,
  inject,
  Output,
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
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-adv-list-filter',
  standalone: true,
  imports: [
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    ReactiveFormsModule
  ],
  templateUrl: './adv-list-filter.component.html',
  styleUrl: './adv-list-filter.component.scss',
})
export class AdvListFilterComponent {
  @ViewChild('modalDialog') modalDialog?: any;

  @Output() onChanged = new EventEmitter<SortOption>();

  modalRef?: BsModalRef;
  private modalService = inject(BsModalService);
  private formBuilder = inject(FormBuilder);

  sortForm: FormGroup = new FormGroup({});
  currentSortOption: SortOption = {
    field: 'date',
    order: 'desc',
  };

  constructor() {
    this.sortForm = this.formBuilder.group({
      labelPosition: ['date', Validators.required],
      selectedSortDate: ['desc', Validators.required],
      selectedSortTitle: ['desc', Validators.required],
      selectedSortUsername: ['desc', Validators.required],
      selectedSortName: ['desc', Validators.required],
    });
  }

  onFilterClick() {
    // Reset the form values to currentSortOption
    this.sortForm.patchValue({
      labelPosition: this.currentSortOption.field,
      selectedSortDate:
        this.currentSortOption.field === 'date'
          ? this.currentSortOption.order
          : 'desc',
      selectedSortTitle:
        this.currentSortOption.field === 'title'
          ? this.currentSortOption.order
          : 'desc',
      selectedSortUsername:
        this.currentSortOption.field === 'username'
          ? this.currentSortOption.order
          : 'desc',
      selectedSortName:
        this.currentSortOption.field === 'name'
          ? this.currentSortOption.order
          : 'desc',
    });

    this.modalRef = this.modalService.show(this.modalDialog);
  }

  getLabelText() {
    const sortOption = this.currentSortOption;
    let fieldTranslation = '';

    switch (sortOption.field) {
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

  getSelectedSortOption(): SortOption {
    const field = this.sortForm.get('labelPosition')?.value;
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

    const sortOption: SortOption = {
      field: field,
      order: order,
    };

    return sortOption;
  }

  save() {
    this.currentSortOption = this.getSelectedSortOption();
    this.onChanged.emit(this.currentSortOption);
    this.modalRef?.hide();
  }
}
