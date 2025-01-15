import { Injectable } from '@angular/core';
import {
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory,
} from '@ngrx/data';
import { NgRxTestEntity } from '../../_models/ngRxTestEntity';
//New
@Injectable()
export class TestEntityService extends EntityCollectionServiceBase<NgRxTestEntity> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('NgRxTestEntity', serviceElementsFactory);
  }
}
