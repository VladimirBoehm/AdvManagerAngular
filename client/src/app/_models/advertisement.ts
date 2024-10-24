import { AdvertisementStatus } from '../_framework/constants/advertisementStatus';
import { AdImage } from './adImage';
import { PaginatedItem } from './paginatedItem';

export interface Advertisement extends PaginatedItem {
  
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
  created?: Date;
  updated?: Date;
}
