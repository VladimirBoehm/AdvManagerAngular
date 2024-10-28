import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';

export interface UpdateAdvertisementAdminRequest {
  advertisementId: number;
  advertisementStatus: AdvertisementStatus;
  publishFrequency?: number;
  adminMessage?: string;
}
