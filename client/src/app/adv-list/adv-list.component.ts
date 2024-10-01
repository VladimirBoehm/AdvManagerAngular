import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdvListStates } from './advListStates';
import { TelegramBaseComponent } from '../_framework/telegramBaseComponent';

@Component({
  selector: 'app-adv-list',
  standalone: true,
  imports: [],
  templateUrl: './adv-list.component.html',
  styleUrl: './adv-list.component.scss',
})
export class AdvListComponent extends TelegramBaseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  state: AdvListStates | undefined;

  override ngOnInit(): void {
    super.ngOnInit();

    this.route.paramMap.subscribe((params) => {
      this.state = params.get('state') as AdvListStates;
    });
  }
}
