import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AdImage } from '../_models/adImage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getUserImages(): Observable<AdImage[]> {
    return this.http.get<AdImage[]>(this.baseUrl + `adImage`);
  }
}
