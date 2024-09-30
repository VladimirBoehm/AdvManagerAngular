import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss',
})
export class TestComponent implements OnInit {
  ngOnInit(): void {
    if (window.Telegram?.WebApp) {
      window.Telegram?.WebApp?.BackButton?.show();
      window.Telegram?.WebApp?.BackButton?.onClick(() => {
        window.history.back();
      });
    }
  }
}
