import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AdvListStates } from '../_framework/constants/advListStates';
import { Location } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent  implements OnInit {
  advListStates = AdvListStates;
  private location = inject(Location);

   ngOnInit(): void {
    if (window.Telegram?.WebApp) {
      window.Telegram?.WebApp?.BackButton?.show();
      window.Telegram?.WebApp?.BackButton?.onClick(() => {
        this.location.back();
      });


    if (window.Telegram?.WebApp) {
      window.Telegram?.WebApp?.expand();
      //window.Telegram?.WebApp?.BackButton?.hide();
    }
  }
}
}