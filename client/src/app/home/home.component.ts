import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AdvListStates } from '../adv-list/advListStates';
import { TelegramBaseComponent } from '../_framework/telegramBaseComponent';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent extends TelegramBaseComponent {
  advListStates = AdvListStates;
}
