import { NgModule } from '@angular/core';
import { SkeletonDirective } from '../directives/skeleton/skeletonDirective';
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
@NgModule({
  declarations: [SkeletonDirective],
  imports: [
    NgTemplateOutlet,
    NgIf,
    NgFor,
    NgClass,
    RouterLink,
    DatePipe,
    PaginatorLocalization,
    AsyncPipe,
  ],
  exports: [
    NgTemplateOutlet,
    NgIf,
    NgFor,
    NgClass,
    SkeletonDirective,
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
  ],
})
export class SharedModule {}
