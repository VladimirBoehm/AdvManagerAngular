import { NgModule } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  AsyncPipe,
  DatePipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PaginatorLocalization } from '../component/paginator/paginator-localization';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogActions } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
  imports: [
    NgTemplateOutlet,
    NgIf,
    NgFor,
    NgClass,
    RouterLink,
    DatePipe,
    PaginatorLocalization,
    AsyncPipe,
    MatIconModule,
    MatDialogActions,
  ],
  exports: [
    NgTemplateOutlet,
    NgIf,
    NgFor,
    NgClass,
    NgxSkeletonLoaderModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    RouterLink,
    PaginatorLocalization,
    DatePipe,
    AsyncPipe,
    FormsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatDialogActions,
    MatRadioModule,
    MatDatepickerModule,
  ],
})
export class SharedModule {}
