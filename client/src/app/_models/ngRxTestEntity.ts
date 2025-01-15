export interface NgRxTestEntity {
  id: number;
  advertisementId: number;
  value: string;
}

export function compareTestEntityDesc(c1: NgRxTestEntity, c2: NgRxTestEntity) {
  const compare = c1.id - c2.id;
  if (compare > 0) {
    return -1;
  } else if (compare < 0) return 1;
  else return 0;
}
