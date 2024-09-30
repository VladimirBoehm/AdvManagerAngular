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
    if (window.Telegram?.WebApp?.BackButton) {
      // Показать кнопку "Назад"
      window.Telegram?.WebApp?.BackButton.show();

      // Обработка клика по кнопке "Назад"
      window.Telegram?.WebApp?.BackButton.onClick(() => {
        // Логика для возврата на предыдущий экран
        window.history.back();
      });
    }
  }
}
