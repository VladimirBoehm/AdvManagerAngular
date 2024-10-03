import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TelegramBackButtonService {
  private backButtonClickHandler: (() => void) | undefined | null;

  setBackButtonHandler(handler: () => void): void {
    const tg = window.Telegram?.WebApp;
    if (tg?.BackButton) {
      this.removeBackButtonHandler();
      this.backButtonClickHandler = handler;
      tg.BackButton.onClick(this.backButtonClickHandler);
      tg.BackButton.show();
    }
  }

  removeBackButtonHandler(): void {
    const tg = window.Telegram?.WebApp;
    if (tg?.BackButton && this.backButtonClickHandler) {
      tg.BackButton.offClick(this.backButtonClickHandler);
      tg.BackButton.hide();
      this.backButtonClickHandler = null;
    }
  }
}
