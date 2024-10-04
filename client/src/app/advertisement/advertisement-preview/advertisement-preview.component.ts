import { NgIf } from '@angular/common';
import { Component, inject, input, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-advertisement-preview',
  standalone: true,
  imports: [MatCardModule, NgIf],
  templateUrl: './advertisement-preview.component.html',
  styleUrl: './advertisement-preview.component.scss',
})
export class AdvertisementPreviewComponent {
  @ViewChild('imageShowTemplate') imageShowTemplate?: any;
  private modalService = inject(BsModalService);
  title = input.required<string | undefined >();
  message = input.required<string | undefined >();
  url = input.required<string | undefined >();
  linkName = input.required<string | undefined >();
  linkValue = input.required<string | undefined>();
  modalRef?: BsModalRef;


  showImage() {
    this.modalRef = this.modalService.show(this.imageShowTemplate);
  }
}
