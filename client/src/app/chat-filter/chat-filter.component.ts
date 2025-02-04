import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatFilter } from '../_models/chatFilter';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MatErrorService } from '../_framework/component/errors/mat-error-service';
import { TelegramBackButtonService } from '../_services/telegramBackButton.service';
import { Router } from '@angular/router';
import { SharedModule } from '../_framework/modules/sharedModule';
import { EmptyListPlaceholderComponent } from '../_framework/component/empty-list-placeholder/empty-list-placeholder.component';
import { ListFilterComponent } from '../_framework/component/adv-list-filter/list-filter.component';
import { SortOption } from '../_entities/sortOption';
import { BusyService } from '../_services/busy.service';
import { DateHelper } from '../_framework/component/helpers/dateHelper';
import { Localization } from '../_framework/component/helpers/localization';
import { AppStore } from '../appStore/app.store';
import { Subscription } from 'rxjs';
import { AddChatFilterDialog } from './dialogs/add-chat-filter.dialog';

@Component({
  selector: 'app-chat-filter',
  standalone: true,
  imports: [
    SharedModule,
    EmptyListPlaceholderComponent,
    ListFilterComponent,
    AddChatFilterDialog,
  ],
  templateUrl: './chat-filter.component.html',
  styleUrl: './chat-filter.component.scss',
  providers: [MatErrorService],
})
export class ChatFilterComponent implements OnInit, OnDestroy {
  @ViewChild('addFilterDialog') addFilterDialog?: any;

  private modalService = inject(BsModalService);
  private backButtonService = inject(TelegramBackButtonService);
  private router = inject(Router);
  readonly appStore = inject(AppStore);
  private routerSubscription!: Subscription;
  busyService = inject(BusyService);

  dateHelper = DateHelper;
  modalRef?: BsModalRef;

  maxItemNumber: number = 30;

  Localization = Localization;

  ngOnInit(): void {
    this.appStore.getChatFiltersAsync();
    this.backButtonService.setCloseDialogHandler(() => this.closeDialog());
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigate(['']);
    });
  }

  addChatFilterDialogConfirm = (value: string) => {
    const newChatFiler = {
      value: value,
      created: this.dateHelper.getUTCTime(),
    } as ChatFilter;
    this.appStore.createChatFilterAsync(newChatFiler);

    this.modalRef?.hide();
  };

  closeDialog = () => {
    this.modalRef?.hide();
  };

  showAddDialog() {
    this.modalRef = this.modalService.show(this.addFilterDialog);
  }

  deleteChatFilter(chatFilter: ChatFilter) {
    this.appStore.deleteChatFilterAsync(chatFilter);
    this.modalRef?.hide();
  }

  sortChanged($event: SortOption) {
    this.appStore.updateChatFilterPaginationParamsAsync({
      pageNumber: 0,
      totalItems: 0,
      pageSize: this.maxItemNumber,
      sortOption: $event,
    });
  }

  ngOnDestroy(): void {
    this.backButtonService.removeCloseDialogHandler();
    this.backButtonService.removeBackButtonHandler();
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
