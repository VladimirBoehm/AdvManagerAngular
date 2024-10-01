import { Injectable, OnInit } from '@angular/core';

@Injectable()
export abstract class TelegramBaseComponent implements OnInit {

  ngOnInit(): void {
    this.initBackButton();
  }

  private initBackButton(): void {
    if (window.Telegram?.WebApp) {
      window.Telegram?.WebApp?.BackButton?.show();
      window.Telegram?.WebApp?.BackButton?.onClick(() => {
        window.history.back();
      });
    }
  }
}