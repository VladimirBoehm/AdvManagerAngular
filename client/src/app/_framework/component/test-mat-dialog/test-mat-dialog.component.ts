import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DATE_FORMATS,
  MAT_NATIVE_DATE_FORMATS,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
@Component({
  selector: 'app-test-mat-dialog',
  standalone: true,
  imports: [    MatDatepickerModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,],
    providers: [
      provideNativeDateAdapter(),
      { provide: MatDialogRef, useValue: {} },
      { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
      { provide: MAT_DIALOG_DATA, useValue: {} },
    ],
  templateUrl: './test-mat-dialog.component.html',
  styleUrl: './test-mat-dialog.component.scss'
})
export class TestMatDialogComponent {
  data = inject(MAT_DIALOG_DATA);
  readonly date = new FormControl(new Date());
  constructor() {
    const data = this.data;

    this.date.setValue(data.selectedDate);
  }
}
