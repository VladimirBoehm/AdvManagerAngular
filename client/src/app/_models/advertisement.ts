import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';
import { AdImage } from './adImage';

export interface Advertisement {
  id: number;
  isDirty?: boolean;
  isEditable?: boolean;
  userId: number;
  title: string;
  message: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  adImageId?: number;
  adImage?: AdImage;
  statusId: AdvertisementStatus;
  adminMessage?: string;
  publishFrequency?: number;
  nextPublishDate?: Date;
  nextPublishId?: number;
  linkName?: string;
  linkValue?: string;
}
