export class DateHelper {
  static getLocalTime(dateString: Date | undefined): string {
    const utcDateString = dateString + 'Z';
    const utcDate = new Date(utcDateString);

    if (isNaN(utcDate.getTime())) {
      return 'Incorrect date';
    }

    return utcDate.toLocaleString();
  }
}
