import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

export interface ErrorVariables {
  maxLength?: number;
  minLength?: number;
  max?: number;
}

@Injectable({
  providedIn: null,
})
export class MatErrorService {
  private controlErrors: { [controlName: string]: ErrorVariables } = {};

  addErrorsInfo(controlName: string, errorVariables: ErrorVariables) {
    this.controlErrors[controlName] = errorVariables;
  }

  getErrorMessage(control: AbstractControl, controlName: string): string {
    if (!control) return '';

    const errorVariables: ErrorVariables = this.controlErrors[controlName];

    if (control.hasError('required')) {
      return 'Поле обязательно для заполнения';
    } else if (control.hasError('invalidUrl')) {
      return "Ссылка должна начинаться с 'https://'";
    } else if (control.hasError('maxlength') && errorVariables?.maxLength) {
      return `Превышено допустимое количество символов: ${errorVariables.maxLength}`;
    } else if (control.hasError('minlength') && errorVariables?.minLength) {
      return `Минимум ${errorVariables.minLength} символа`;
    } else if (control.hasError('max') && errorVariables?.max) {
      return `Значение не должно превышать: ${errorVariables.max}`;
    } else if (control.hasError('notNumeric')) {
      return `Разрешены только положительные числа`;
    } else {
      return '';
    }
  }

  getHasError(control: AbstractControl): boolean {
    return !!control.errors;
  }
}
