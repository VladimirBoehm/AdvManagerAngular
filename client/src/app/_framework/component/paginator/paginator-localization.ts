import {
  Component,
  Injectable,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { Subject } from 'rxjs';

@Injectable()
export class MyPaginatorLocalization implements MatPaginatorIntl {
  changes = new Subject<void>();

  nextPageLabel = 'Следующая страница';
  previousPageLabel = 'Предыдущая страница';

  firstPageLabel = 'Первая страница';
  itemsPerPageLabel = 'Элементов на странице:';
  lastPageLabel = 'Последняя страница';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) return 'Страница 1 из 1';

    const amountPages = Math.ceil(length / pageSize);
    return `Страница ${page + 1} из ${amountPages}`;
  }
}

@Component({
  selector: 'paginator-localization',
  templateUrl: 'paginator-localization.html',
  standalone: true,
  imports: [MatPaginatorModule],
  providers: [{ provide: MatPaginatorIntl, useClass: MyPaginatorLocalization }],
})
export class PaginatorLocalization {
  @Input() disabled = false;
  @Input() length: number = 0;
  @Input() pageSize: number = 5;
  @Input() pageIndex: number = 0;
  @Output() page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  handlePageEvent(event: PageEvent): void {
    this.page.emit(event);
  }
}
