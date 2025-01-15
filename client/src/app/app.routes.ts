import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TestComponent } from './ngrx-test/test.component';
import { AdvListComponent } from './adv-list/adv-list.component';
import { AdvertisementMainDataComponent } from './advertisement/advertisement-main-data/advertisement-main-data.component';
import { AdvertisementValidateComponent } from './advertisement/advertisement-validate/advertisement-validate.component';
import { AdvertisementPreviewComponent } from './advertisement/advertisement-preview/advertisement-preview.component';
import { AdvertisementEditComponent } from './advertisement/advertisement-edit/advertisement-edit.component';
import { ChatFilterComponent } from './chat-filter/chat-filter.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { TestResolver } from './ngrx-test/test.resolver';

//TODO Authguard isAdmin
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  { path: 'adv-list/:state', component: AdvListComponent },
  {
    path: 'app-advertisement-main-data',
    component: AdvertisementMainDataComponent,
  },
  {
    path: 'app-advertisement-validate/:id',
    component: AdvertisementValidateComponent,
  },
  {
    path: 'app-advertisement-preview/:id',
    component: AdvertisementPreviewComponent,
  },
  {
    path: 'app-advertisement-edit/:id',
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
    path: 'app-test',
    component: TestComponent,
    // resolve: {
    //   test: TestResolver,
    // },
  },
];
