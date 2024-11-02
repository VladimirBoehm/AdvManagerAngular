import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatFilterService } from '../_services/chat-filter.service';
import { ChatFilter } from '../_models/chatFilter';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatErrorService } from '../_framework/component/errors/mat-error-service';
import { TelegramBackButtonService } from '../_framework/telegramBackButtonService';
import { NavigationStart, Router } from '@angular/router';
import { SharedModule } from '../_framework/modules/sharedModule';
import { EmptyListPlaceholderComponent } from '../_framework/component/empty-list-placeholder/empty-list-placeholder.component';
import { ListFilterComponent } from '../_framework/component/adv-list-filter/list-filter.component';
import { SortOption } from '../_models/sortOption';
import { BusyService } from '../_services/busy.service';
import { DateHelper } from '../_framework/component/helpers/dateHelper';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-filter',
  standalone: true,
  imports: [SharedModule, EmptyListPlaceholderComponent, ListFilterComponent],
  templateUrl: './chat-filter.component.html',
  styleUrl: './chat-filter.component.scss',
  providers: [MatErrorService],
})
export class ChatFilterComponent implements OnInit, OnDestroy {
  @ViewChild('addFilterDialog') addFilterDialog?: any;

  private modalService = inject(BsModalService);
  private backButtonService = inject(TelegramBackButtonService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private routerSubscription!: Subscription;
  busyService = inject(BusyService);
  chatFilterService = inject(ChatFilterService);
  matErrorService = inject(MatErrorService);
  editForm: FormGroup = new FormGroup({});
  dateHelper = DateHelper;
  modalRef?: BsModalRef;
  maxItemLength: number = 50;
  maxItemNumber: number = 30;
  minItemLength: number = 3;
  itemLengthCounter: number = 0;

  ngOnInit(): void {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (event.navigationTrigger === 'popstate') {
          this.chatFilterService.resetPaginationParams();
        }
      }
    });

    this.backButtonService.setCloseDialogHandler(() => this.closeDialog());
    this.backButtonService.setBackButtonHandler(() => {
      this.chatFilterService.resetPaginationParams();
      this.router.navigate(['']);
    });

    this.chatFilterService.getAll();

  }

  initializeForm() {
    this.editForm = this.formBuilder.group({
      item: [
        undefined,
        [
          Validators.required,
          Validators.maxLength(this.maxItemLength),
          Validators.minLength(this.minItemLength),
        ],
      ],
    });

    this.editForm.controls['item'].valueChanges.subscribe(() => {
      this.updateChatFilterCounter();
    });

    this.matErrorService.addErrorsInfo('item', {
      maxLength: this.maxItemLength,
      minLength: this.minItemLength,
    });

    this.updateChatFilterCounter();
  }

  addChatFilterDialogConfirm() {
    const newChatFiler = {
      value: this.editForm.controls['item']?.value,
      created: this.dateHelper.getUTCTime(),
    } as ChatFilter;
    this.chatFilterService.save(newChatFiler);
    this.editForm.reset();
    this.modalRef?.hide();
  }

  closeDialog() {
    this.modalRef?.hide();
    this.editForm.reset();
  }

  updateChatFilterCounter() {
    const itemValue = this.editForm.controls['item']?.value || '';
    this.itemLengthCounter = itemValue.length;
  }

  showAddDialog() {
    this.initializeForm();
    this.modalRef = this.modalService.show(this.addFilterDialog);
  }

  deleteChatFilter(chatFilter: ChatFilter) {
    this.chatFilterService.delete(chatFilter.id);
    this.editForm.reset();
    this.modalRef?.hide();
  }

  sortChanged($event: SortOption) {
    this.chatFilterService.getAll($event);
  }
  trackById(index: number, item: ChatFilter): number {
    return item.id;
  }

  ngOnDestroy(): void {
    this.backButtonService.removeCloseDialogHandler();
    this.backButtonService.removeBackButtonHandler();
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
