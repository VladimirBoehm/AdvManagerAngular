import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdvListComponent } from './adv-list/adv-list.component';
import { AdvertisementMainDataComponent } from './advertisement/advertisement-main-data/advertisement-main-data.component';
import { AdvertisementValidateComponent } from './advertisement/advertisement-validate/advertisement-validate.component';
import { AdvertisementPreviewComponent } from './advertisement/advertisement-preview/advertisement-preview.component';
import { AdvertisementEditComponent } from './advertisement/advertisement-edit/advertisement-edit.component';
import { ChatFilterComponent } from './chat-filter/chat-filter.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { HomeResolver } from './_resolvers/home.resolver';
import { ChatFilterResolver } from './_resolvers/chatFilter.resolver';

//TODO Authguard isAdmin ChatFilterREsolver
export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, resolve: { home: HomeResolver } },
  { path: 'adv-list/:state', component: AdvListComponent },
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
    path: 'app-advertisement-edit/:id',
    component: AdvertisementEditComponent,
  },
  {
    path: 'app-chat-filter',
    component: ChatFilterComponent,
    resolve: { chatFilter: ChatFilterResolver },
  },
  {
    path: 'app-feedback',
    component: FeedbackComponent,
  },
];
