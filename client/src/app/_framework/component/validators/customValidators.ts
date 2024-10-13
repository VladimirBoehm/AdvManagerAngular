import { AbstractControl, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static urlValidator(): ValidatorFn {
    const urlRegex = /^(https:\/\/)/i;
    return (control: AbstractControl) => {
      if (!control.value || urlRegex.test(control.value)) {
        return null;
      }
      return { invalidUrl: true };
    };
  }

  static numeric(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null;
      }

      const numericRegex = /^[0-9]+$/;
      return numericRegex.test(value) ? null : { notNumeric: true };
    };
  }
}
