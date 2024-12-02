export class DateHelper {
  static getLocalTime(dateString: Date | undefined): string {
    if (!dateString) {
      return '';
    }
    const dateStr = dateString.toString();
    const utcDateString = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
    const utcDate = new Date(utcDateString);

    if (isNaN(utcDate.getTime())) {
      return 'Incorrect date';
    }

    return utcDate.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static getUTCTime(): Date {
    let date = new Date();
    date.setDate(date.getUTCDate());
    date.setHours(date.getUTCHours());
    return date;
  }
}
