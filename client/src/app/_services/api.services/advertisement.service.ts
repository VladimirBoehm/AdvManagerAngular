import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Advertisement } from '../../_models/advertisement';
import { environment } from '../../../environments/environment';
import { catchError, Observable, retry } from 'rxjs';
import { UpdateAdvertisementAdminRequest } from '../../_models/updateAdvertisementAdminRequest';
import { UpdateAdvertisementStatusRequest } from '../../_models/updateAdvertisementStatusRequest';
import { PaginationParams } from '../../_entities/paginationParams';
import { getPaginationHeaders } from '../../_framework/component/helpers/paginationHelper';
import { ManagePublish } from '../../_entities/managePublish';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root',
})
export class AdvertisementService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  private baseUrl = environment.apiUrl;

  async save(
    advertisement: Advertisement,
    image?: File
  ): Promise<Observable<Advertisement>> {
    const formData = new FormData();
    formData.append('advertisementJson', JSON.stringify(advertisement));
    if (image) {
      try {
        formData.append('file', image);
      } catch (error) {
        console.error('Error fetching or reconstructing file:', error);
      }
    }

    return this.http
      .post<Advertisement>(this.baseUrl + 'advertisement/save', formData)
      .pipe(
        retry(3),
        catchError((error) => {
          if (error instanceof Error) {
            this.toastr.error(error.message);
          } else {
            this.toastr.error('An unknown error occurred.');
          }
          console.error('Error saving advertisement:', error);
          throw error;
        })
      );
  }

  async update(advertisement: Advertisement, image?: File) {
    const formData = new FormData();
    formData.append('advertisementJson', JSON.stringify(advertisement));
    if (image) {
      try {
        formData.append('file', image);
      } catch (error) {
        if (error instanceof Error) {
          this.toastr.error(error.message);
        } else {
          this.toastr.error('An unknown error occurred.');
        }
        console.error('Error fetching or reconstructing file:', error);
      }
    }
    return this.http
      .put<Advertisement>(this.baseUrl + 'advertisement', formData)
      .pipe(
        retry(3),
        catchError((error) => {
          console.error('Error updating advertisement:', error);
          throw error;
        })
      );
  }

  sendToValidation(id: number) {
    return this.http.post<UpdateAdvertisementStatusRequest>(
      this.baseUrl + `advertisement/sendToValidation/${id}`,
      null
    );
  }

  delete(id: number) {
    return this.http.delete<Advertisement>(
      this.baseUrl + `advertisement/${id}`
    );
  }

  cancelPublication(id: number) {
    return this.http.put(
      this.baseUrl + `advertisement/cancelPublication/${id}`,
      null
    );
  }

  // PUBLICATION
  getPendingPublicationAdvertisements(paginationParams: PaginationParams) {
    const params = getPaginationHeaders(paginationParams);
    return this.http.get<Advertisement[]>(
      this.baseUrl + 'advertisement/getPendingPublicationAdvertisements',
      {
        observe: 'response',
        params,
      }
    );
  }

  // MY ADVERTISEMENTS
  getMyAdvertisements(paginationParams: PaginationParams) {
    const params = getPaginationHeaders(paginationParams);
    return this.http.get<Advertisement[]>(this.baseUrl + 'advertisement', {
      observe: 'response',
      params,
    });
  }

  // ALL_HISTORY
  getAdvertisementAllHistory(paginationParams: PaginationParams) {
    const params = getPaginationHeaders(paginationParams);
    return this.http.get<Advertisement[]>(
      this.baseUrl + 'advertisementHistory',
      {
        observe: 'response',
        params,
      }
    );
  }

  // PRIVATE_HISTORY
  getAdvertisementPrivateHistory(paginationParams: PaginationParams) {
    const params = getPaginationHeaders(paginationParams);
    return this.http.get<Advertisement[]>(
      this.baseUrl + 'advertisementHistory/getAdvertisementPrivateHistory',
      {
        observe: 'response',
        params,
      }
    );
  }

  // ADMIN
  cancelPublicationAdmin(managePublish: ManagePublish) {
    return this.http.put(
      this.baseUrl + 'advertisementAdmin/cancelPublication',
      managePublish
    );
  }

  forcePublicationAdmin(managePublish: ManagePublish) {
    return this.http.put(
      this.baseUrl + 'advertisementAdmin/forcePublication',
      managePublish
    );
  }

  // VALIDATION
  getPendingValidationAdvertisements(paginationParams: PaginationParams) {
    const params = getPaginationHeaders(paginationParams);
    return this.http.get<Advertisement[]>(
      this.baseUrl + 'advertisementAdmin/getPendingAdvertisements',
      {
        observe: 'response',
        params,
      }
    );
  }

  getPendingValidationAdvertisementsCount(): Observable<number> {
    return this.http.get<number>(
      this.baseUrl + 'advertisementAdmin/getPendingAdvertisementsCount'
    );
  }

  validateAdvertisementAdmin(advertisement: Advertisement) {
    const updateAdvertisementAdminRequest: UpdateAdvertisementAdminRequest = {
      advertisementId: advertisement.id,
      advertisementStatus: advertisement.statusId,
      publishFrequency: advertisement.publishFrequency,
      adminMessage: advertisement.adminMessage,
    };

    return this.http.post(
      this.baseUrl + 'advertisementAdmin',
      updateAdvertisementAdminRequest
    );
  }
}
