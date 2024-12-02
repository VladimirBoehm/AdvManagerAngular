import { Injectable } from '@angular/core';
import { Advertisement } from '../../../_models/advertisement';

@Injectable({
  providedIn: 'root',
})
export class AdvertisementHelper {
  getUserDisplayName(advertisement: Advertisement): string {
    const userName = advertisement.userName ? `@${advertisement.userName}` : '';
    const firstName = advertisement.firstName ? advertisement.firstName : '';
    const lastName = advertisement.lastName ? advertisement.lastName : '';

    return `${userName} ${firstName || lastName}`.trim();
  }

 async getFileFromUrl(url: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], 'reconstructedFile');
  }
}
