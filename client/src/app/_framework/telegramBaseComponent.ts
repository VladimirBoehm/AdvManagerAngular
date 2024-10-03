import { Injectable, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable()
export abstract class TelegramBaseComponent implements OnInit {
  constructor(private router: ActivatedRoute) {}

  ngOnInit(): void {
    console.log(window.history);
    this.initBackButton();
  }

  private initBackButton(): void {
    if (window.Telegram?.WebApp) {
      window.Telegram?.WebApp?.BackButton?.show();
      window.Telegram?.WebApp?.BackButton?.onClick(() => {
        //window.history.back();
        //this.location.back();
        //this.router.(['../']);
      });
    }
  }
}
