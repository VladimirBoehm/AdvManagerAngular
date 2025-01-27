import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdvertisementMainDataComponent } from './advertisement/advertisement-main-data/advertisement-main-data.component';
import { AdvertisementValidateComponent } from './advertisement/advertisement-validate/advertisement-validate.component';
import { AdvertisementPreviewComponent } from './advertisement/advertisement-preview/advertisement-preview.component';
import { AdvertisementEditComponent } from './advertisement/advertisement-edit/advertisement-edit.component';
import { ChatFilterComponent } from './chat-filter/chat-filter.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { AdvListMyAdvertisementsComponent } from './adv-list/adv-list-my-advertisements/adv-list-my-advertisements.component';
import { AdvListPendingValidationComponent } from './adv-list/adv-list-pending-validation/adv-list-pending-validation.component';
import { AdvListPendingPublicationComponent } from './adv-list/adv-list-pending-publication/adv-list-pending-publication.component';
import { AdvListPrivateHistoryComponent } from './adv-list/adv-list-private-history/adv-list-private-history.component';
import { AdvListAllHistoryComponent } from './adv-list/adv-list-all-history/adv-list-all-history.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'app-advertisement-main-data',
    component: AdvertisementMainDataComponent,
  },
  {
    path: 'app-advertisement-validate',
    component: AdvertisementValidateComponent,
  },
  {
    path: 'app-advertisement-preview',
    component: AdvertisementPreviewComponent,
  },
  {
    path: 'app-advertisement-edit',
    component: AdvertisementEditComponent,
  },
  {
    path: 'app-chat-filter',
    component: ChatFilterComponent,
  },
  {
    path: 'app-feedback',
    component: FeedbackComponent,
  },
  {
    path: 'app-adv-list-my-advertisements',
    component: AdvListMyAdvertisementsComponent,
  },
  {
    path: 'app-adv-list-pending-validation',
    component: AdvListPendingValidationComponent,
  },
  {
    path: 'app-adv-list-pending-publication',
    component: AdvListPendingPublicationComponent,
  },
  {
    path: 'app-adv-list-private-history',
    component: AdvListPrivateHistoryComponent,
  },
  {
    path: 'app-adv-list-all-history',
    component: AdvListAllHistoryComponent,
  },
];
