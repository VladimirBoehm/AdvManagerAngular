import { Component, inject, model, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-adv-list-filter',
  standalone: true,
  imports: [MatCardModule, MatCheckboxModule, MatRadioModule, FormsModule],
  templateUrl: './adv-list-filter.component.html',
  styleUrl: './adv-list-filter.component.scss',
})
export class AdvListFilterComponent {
  @ViewChild('modalDialog') modalDialog?: any;
  private modalService = inject(BsModalService);
  modalRef?: BsModalRef;
  readonly labelPosition = model<'date' | 'title | username | name'>('date');
  readonly selectedSortDate = model<'asc' | 'desc'>('desc');
  readonly selectedSortTitle = model<'asc' | 'desc'>('desc');
  readonly selectedSortUsername = model<'asc' | 'desc'>('desc');
  readonly selectedSortName = model<'asc' | 'desc'>('desc');

  onFilterClick() {
    this.modalRef = this.modalService.show(this.modalDialog);
  }

  save(){
    
  }
}
