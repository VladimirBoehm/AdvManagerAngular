import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TelegramBackButtonService {
  private backButtonClickHandler: (() => void) | undefined | null;
  private closeDialogHandler: (() => void) | null = null;

  setBackButtonHandler(handler: () => void): void {
    const tg = window.Telegram?.WebApp;
    if (tg?.BackButton) {
      this.removeBackButtonHandler();
      this.backButtonClickHandler = handler;
      tg.BackButton.onClick(() => this.executeHandlers());
      tg.BackButton.show();
    }
  }

  private executeHandlers(): void {
    if (this.closeDialogHandler) {
      this.closeDialogHandler();
    }

    if (this.backButtonClickHandler) {
      this.backButtonClickHandler();
    }
  }

  setCloseDialogHandler(handler: () => void): void {
    this.closeDialogHandler = handler;
  }

  removeBackButtonHandler(): void {
    const tg = window.Telegram?.WebApp;
    if (tg?.BackButton && this.backButtonClickHandler) {
      tg.BackButton.offClick(this.backButtonClickHandler);
      tg.BackButton.hide();
      this.backButtonClickHandler = null;
    }
  }

  removeCloseDialogHandler(): void {
    this.closeDialogHandler = null;
  }
}
