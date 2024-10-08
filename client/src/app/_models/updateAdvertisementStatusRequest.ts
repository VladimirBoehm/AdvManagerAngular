import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';

export interface UpdateAdvertisementStatusRequest {
  advertisementId: number;
  advertisementStatus: AdvertisementStatus;
}
