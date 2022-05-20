import { capitalize } from 'lodash';
import { ElementLoadingState } from '../components/EntityLineage/EntityLineage.interface';
import { EntityType } from '../enums/entity.enum';

export const foreignObjectSize = 40;

export const entityData = [
  {
    type: EntityType.TABLE,
    label: capitalize(EntityType.TABLE),
  },
  { type: EntityType.PIPELINE, label: capitalize(EntityType.PIPELINE) },
  { type: EntityType.DASHBOARD, label: capitalize(EntityType.DASHBOARD) },
];

export const positionX = 150;
export const positionY = 60;

export const nodeWidth = 300;
export const nodeHeight = 40;

export const ELEMENT_DELETE_STATE = {
  loading: false,
  status: 'initial' as ElementLoadingState,
};
