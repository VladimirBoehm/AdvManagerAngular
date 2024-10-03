import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TestComponent } from './test/test.component';
import { AdvListComponent } from './adv-list/adv-list.component';
import { AdvertisementPreviewComponent } from './advertisement/advertisement-preview/advertisement-preview.component';
import { AdvertisementValidateComponent } from './advertisement/advertisement-validate/advertisement-validate.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'test', component: TestComponent },
  { path: 'adv-list/:state', component: AdvListComponent },
  {
    path: 'app-advertisement-preview',
    component: AdvertisementPreviewComponent,
  },
  {
    path: 'app-advertisement-validate/:id',
    component: AdvertisementValidateComponent,
  },
];
