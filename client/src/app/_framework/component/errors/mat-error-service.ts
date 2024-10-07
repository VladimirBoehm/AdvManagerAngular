import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class MatErrorService {
  getErrorMessage(control: AbstractControl, maxlength?: number): string {
    if (control.hasError('required')) return 'Поле обязательно для заполнения';
    else if (control.hasError('invalidUrl'))
      return "Ссылка должна начинаться или с 'https://' или с '@'";
    else if (control.hasError('maxlength')) {
      if (maxlength)
        return `Превышено допустимое количество символов: ${maxlength}`;
      return `Превышено допустимое количество символов`;
    } else return '';
  }

  getHasError(control: AbstractControl): boolean {
    return !!control.errors;
  }
}
