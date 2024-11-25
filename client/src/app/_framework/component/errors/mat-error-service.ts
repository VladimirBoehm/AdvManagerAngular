import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Localization } from '../helpers/localization';

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
      return Localization.getWord('field_is_required');
    } else if (control.hasError('invalidUrl')) {
      return Localization.getWord('url_must_start_with');
    } else if (control.hasError('maxlength') && errorVariables?.maxLength) {
      return Localization.getFormattedWord('max_length_exceeded', {
        maxLength: errorVariables.maxLength,
      });
    } else if (control.hasError('minlength') && errorVariables?.minLength) {
      return Localization.getFormattedWord('minimum_characters_required', {
        minLength: errorVariables.minLength,
      });
    } else if (control.hasError('max') && errorVariables?.max) {
      return Localization.getFormattedWord('value_must_not_exceed', {
        max: errorVariables.max,
      });
    } else if (control.hasError('notNumeric')) {
      return Localization.getWord('only_positive_numbers_allowed');
    } else {
      return '';
    }
  }

  getHasError(control: AbstractControl): boolean {
    return !!control.errors;
  }
}
