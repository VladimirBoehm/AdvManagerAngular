import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ConfirmModalComponent } from '../../_framework/component/confirm-modal/confirm-modal.component';
import { TelegramBackButtonService } from '../../_framework/telegramBackButtonService';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvListStates } from '../../_framework/constants/advListStates';
import { Advertisement } from '../../_models/advertisement';
import { AdvertisementService } from '../../_services/advertisement.service';
import { AccountService } from '../../_services/account.service';

@Component({
  selector: 'app-advertisement-edit',
  standalone: true,
  imports: [ConfirmModalComponent, FormsModule],
  templateUrl: './advertisement-edit.component.html',
  styleUrl: './advertisement-edit.component.scss',
})
export class AdvertisementEditComponent implements OnInit {
save() {
throw new Error('Method not implemented.');
}
  @ViewChild('editForm') editForm?: NgForm;

  private backButtonService = inject(TelegramBackButtonService);
  private advertisementService = inject(AdvertisementService);
  private accountService = inject(AccountService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  advertisementId: number = 0;
  advertisement?: Advertisement;

  ngOnInit(): void {
    this.backButtonService.setBackButtonHandler(() => {
      this.router.navigate([
        '/adv-list',
        AdvListStates.MyAdvertisements,
        false,
      ]);
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id && Number(id) > 0) {
        this.advertisementService.getById(Number(id)).subscribe({
          next: (advertisement: Advertisement) => {
            this.advertisement = advertisement;
          },
          error: (err) => {
            console.error('Error when loading ads:', err);
          },
        });
      } else {
        this.advertisement = {
          id: 0,
          userId: this.accountService.currentUser()?.userId ?? 0,
          title: '',
          message: '',
          statusId: 0,
          adImage: undefined,
        };
      }
    });
  }
}
