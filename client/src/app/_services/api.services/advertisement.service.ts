import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Advertisement } from '../../_models/advertisement';
import { environment } from '../../../environments/environment';
import { catchError, Observable, retry } from 'rxjs';
import { PaginationParams } from '../../_entities/paginationParams';
import { getPaginationHeaders } from '../../_framework/component/helpers/paginationHelper';
import { ManagePublish } from '../../_entities/managePublish';
import { FileService } from '../../appStore/file.service';
import { ErrorLogClientService } from './errorLogClient.service';
import { ToastrService } from 'ngx-toastr';
import { Localization } from '../../_framework/component/helpers/localization';
import { ResponseWrapper } from '../../_entities/responseWrapper';
import { RejectValidationAdminRequest } from '../../_models/rejectValidationAdminRequest';
import { ConfirmValidationAdminRequest } from '../../_models/confirmValidationAdminRequest';
@Injectable({
  providedIn: 'root',
})
export class AdvertisementService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private fileService = inject(FileService);
  private toastr = inject(ToastrService);
  private errorLogService = inject(ErrorLogClientService);
  Localization = Localization;

  async save(
    advertisement: Advertisement
  ): Promise<Observable<ResponseWrapper<Advertisement>>> {
    const formData = new FormData();
    try {
      formData.append(
        'advertisementJson',
        decodeURIComponent(encodeURIComponent(JSON.stringify(advertisement)))
      );

      const image: { data: BlobPart; type: string; name: string } | undefined =
        await this.fileService.getFirst();
      if (image) {
        const blob: Blob = new Blob([image.data], { type: image.type });
        formData.append('image', blob, image.name);
        this.fileService.deleteAll();
      }
    } catch (error: any) {
      console.error('Error saving advertisement(request):', error);
      this.toastr.error(Localization.getWord('error_occurred_contact_admin'));
      this.errorLogService.send({
        errorMessage: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        additionalInfo: 'advertisementService.ts(request): save()',
      });
      throw error;
    }

    return this.http
      .post<ResponseWrapper<Advertisement>>(
        this.baseUrl + 'advertisement/save',
        formData
      )
      .pipe(
        retry(3),
        catchError((error: any) => {
          console.error('Error saving advertisement(response):', error);
          this.toastr.error(
            Localization.getWord('error_occurred_contact_admin')
          );

          this.errorLogService.send({
            errorMessage: JSON.stringify(
              error,
              Object.getOwnPropertyNames(error)
            ),
            additionalInfo: 'advertisementService.ts(response): save()',
          });
          throw error;
        })
      );
  }

  async update(advertisement: Advertisement) {
    const formData = new FormData();
    formData.append(
      'advertisementJson',
      decodeURIComponent(encodeURIComponent(JSON.stringify(advertisement)))
    );

    const image = await this.fileService.getFirst();
    if (image) {
      const blob = new Blob([image.data], { type: image.type });
      formData.append('image', blob, image.name);
      this.fileService.deleteAll();
    }
    return this.http
      .put<ResponseWrapper<Advertisement>>(
        this.baseUrl + 'advertisement',
        formData
      )
      .pipe(
        retry(3),
        catchError((error) => {
          console.error('Error updating advertisement:', error);
          throw error;
        })
      );
  }

  sendToValidation(id: number) {
    return this.http.post(
      this.baseUrl + `advertisement/sendToValidation/${id}`,
      null
    );
  }

  delete(id: number) {
    return this.http.delete(this.baseUrl + `advertisement/${id}`);
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
    return this.http.get<ResponseWrapper<Advertisement[]>>(
      this.baseUrl + 'advertisement/getPendingPublicationAdvertisements',
      {
        observe: 'response',
        params,
      }
    );
  }

  // MY ADVERTISEMENTS
  getMyAdvertisements(
    paginationParams: PaginationParams
  ): Observable<HttpResponse<ResponseWrapper<Advertisement[]>>> {
    const params = getPaginationHeaders(paginationParams);
    return this.http.get<ResponseWrapper<Advertisement[]>>(
      this.baseUrl + 'advertisement',
      {
        observe: 'response',
        params,
      }
    );
  }

  // ALL_HISTORY
  getAdvertisementAllHistory(paginationParams: PaginationParams) {
    const params = getPaginationHeaders(paginationParams);
    return this.http.get<ResponseWrapper<Advertisement[]>>(
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
    return this.http.get<ResponseWrapper<Advertisement[]>>(
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
    return this.http.get<ResponseWrapper<Advertisement[]>>(
      this.baseUrl + 'advertisementAdmin/getPendingValidations',
      {
        observe: 'response',
        params,
      }
    );
  }

  getPendingValidationAdvertisementsCount(): Observable<number> {
    return this.http.get<number>(
      this.baseUrl + 'advertisementAdmin/getPendingValidationsCount'
    );
  }

  confirmValidationAdmin(advertisement: Advertisement) {
    const updateAdvertisementAdminRequest: ConfirmValidationAdminRequest = {
      advertisementId: advertisement.id,
      publishFrequency: advertisement.publishFrequency ?? 0,
      adminMessage: advertisement.adminMessage,
    };

    return this.http.post(
      this.baseUrl + 'advertisementAdmin/confirmValidation',
      updateAdvertisementAdminRequest
    );
  }

  rejectValidationAdmin(advertisement: Advertisement) {
    const rejectValidationAdminRequest: RejectValidationAdminRequest = {
      advertisementId: advertisement.id,
      adminMessage: advertisement.adminMessage,
    };

    return this.http.post(
      this.baseUrl + 'advertisementAdmin/rejectValidation',
      rejectValidationAdminRequest
    );
  }
}
