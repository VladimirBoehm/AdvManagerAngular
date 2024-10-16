import {
  Component,
  EventEmitter,
  inject,
  model,
  Output,
  ViewChild,
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { SortOption } from '../../../_models/sortOption';

@Component({
  selector: 'app-adv-list-filter',
  standalone: true,
  imports: [MatCardModule, MatCheckboxModule, MatRadioModule, FormsModule],
  templateUrl: './adv-list-filter.component.html',
  styleUrl: './adv-list-filter.component.scss',
})
export class AdvListFilterComponent {
  @ViewChild('modalDialog') modalDialog?: any;

  @Output() onChanged = new EventEmitter<SortOption>();

  modalRef?: BsModalRef;
  private modalService = inject(BsModalService);

  readonly labelPosition = model<'date' | 'title' | 'username' | 'name'>(
    'date'
  );
  readonly selectedSortDate = model<'asc' | 'desc'>('desc');
  readonly selectedSortTitle = model<'asc' | 'desc'>('desc');
  readonly selectedSortUsername = model<'asc' | 'desc'>('desc');
  readonly selectedSortName = model<'asc' | 'desc'>('desc');

  onFilterClick() {
    this.modalRef = this.modalService.show(this.modalDialog);
  }

  getLabelText() {
    const sortOption = this.getSelectedSortOption();
    let fieldTranslation = '';
    let orderTranslation =
      sortOption.order === 'asc' ? 'по возрастанию' : 'по убыванию';

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
    return `по ${fieldTranslation}, ${orderTranslation}`;
  }

  getSelectedSortOption(): SortOption {
    const field = this.labelPosition();
    let order: 'asc' | 'desc';

    switch (field) {
      case 'date':
        order = this.selectedSortDate();
        break;
      case 'title':
        order = this.selectedSortTitle();
        break;
      case 'username':
        order = this.selectedSortUsername();
        break;
      case 'name':
        order = this.selectedSortName();
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
    this.onChanged.emit(this.getSelectedSortOption());
    this.modalRef?.hide();
  }
}
