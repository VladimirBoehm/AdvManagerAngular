import {
  Component,
  Injectable,
  input,
  output,
} from '@angular/core';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { Localization } from '../helpers/localization';

@Injectable()
export class MyPaginatorLocalization implements MatPaginatorIntl {
  changes = new Subject<void>(); // TODO Signal

  nextPageLabel = Localization.getWord('next_page_label');
  previousPageLabel = Localization.getWord('previous_page_label');
  firstPageLabel = Localization.getWord('first_page_label');
  itemsPerPageLabel = Localization.getWord('items_per_page_label');
  lastPageLabel = Localization.getWord('last_page_label');

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return Localization.getWord('page_range_label_single');
    }

    const amountPages = Math.ceil(length / pageSize);
    const currentPage = page + 1;

    return Localization.getWord('page_range_label')
      .replace('{current}', currentPage.toString())
      .replace('{total}', amountPages.toString());
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
  disabled = input<boolean>();
  length = input.required<number>();
  pageSize = input.required<number>();
  pageIndex = input.required<number>();

  page = output<PageEvent>();

  handlePageEvent(event: PageEvent): void {
    this.page.emit(event);
  }
}
