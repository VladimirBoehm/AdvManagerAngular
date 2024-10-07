import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class MatErrorService {
  getErrorMessage(control: AbstractControl): string {
    if (control.hasError('required')) return 'Поле обязательно для заполнения';
    else if (control.hasError('invalidUrl'))
      return "Ссылка должна начинаться или с 'https://' или с '@'";
    else return '';
  }

  getHasError(control: AbstractControl): boolean {
    return !!control.errors;
  }
}
