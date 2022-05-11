/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 *  Copyright 2021 Collate
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/**
 * This schema defines the Tag Category entity. A Tag Category contains tags called Primary
 * Tags. Primary Tags can further have children Tags called Secondary Tags. Only two levels
 * of tags are supported currently.
 */
export interface TagCategory {
  categoryType: TagCategoryType;
  /**
   * Change that lead to this version of the entity.
   */
  changeDescription?: ChangeDescription;
  /**
   * Tags under this category.
   */
  children?: Array<
    any[] | boolean | TagClass | number | number | null | string
  >;
  /**
   * When `true` indicates the entity has been soft deleted.
   */
  deleted?: boolean;
  /**
   * Description of the tag category.
   */
  description: string;
  /**
   * Display Name that identifies this tag category.
   */
  displayName?: string;
  /**
   * Link to the resource corresponding to the tag category.
   */
  href?: string;
  /**
   * Unique identifier of this entity instance.
   */
  id?: string;
  name: string;
  /**
   * Last update time corresponding to the new version of the entity in Unix epoch time
   * milliseconds.
   */
  updatedAt?: number;
  /**
   * User who made the update.
   */
  updatedBy?: string;
  /**
   * Count of how many times the tags from this tag category are used.
   */
  usageCount?: number;
  /**
   * Metadata version of the entity.
   */
  version?: number;
}

/**
 * Type of tag category.
 */
export enum TagCategoryType {
  Classification = 'Classification',
  Descriptive = 'Descriptive',
}

/**
 * Change that lead to this version of the entity.
 *
 * Description of the change.
 */
export interface ChangeDescription {
  /**
   * Names of fields added during the version changes.
   */
  fieldsAdded?: FieldChange[];
  /**
   * Fields deleted during the version changes with old value before deleted.
   */
  fieldsDeleted?: FieldChange[];
  /**
   * Fields modified during the version changes with old and new values.
   */
  fieldsUpdated?: FieldChange[];
  /**
   * When a change did not result in change, this could be same as the current version.
   */
  previousVersion?: number;
}

export interface FieldChange {
  /**
   * Name of the entity field that changed.
   */
  name?: string;
  /**
   * New value of the field. Note that this is a JSON string and use the corresponding field
   * type to deserialize it.
   */
  newValue?: any;
  /**
   * Previous value of the field. Note that this is a JSON string and use the corresponding
   * field type to deserialize it.
   */
  oldValue?: any;
}

export interface TagClass {
  /**
   * Tags under this tag group or empty for tags at the leaf level.
   */
  children?: Array<
    any[] | boolean | TagClass | number | number | null | string
  >;
  /**
   * When `true` indicates the entity has been soft deleted.
   */
  deleted?: boolean;
  /**
   * If the tag is deprecated.
   */
  deprecated?: boolean;
  /**
   * Unique name of the tag category.
   */
  description: string;
  /**
   * Unique name of the tag of format Category.PrimaryTag.SecondaryTag.
   */
  fullyQualifiedName?: string;
  /**
   * Link to the resource corresponding to the tag.
   */
  href?: string;
  /**
   * Unique identifier of this entity instance.
   */
  id?: string;
  /**
   * Name of the tag.
   */
  name: string;
  /**
   * Last update time corresponding to the new version of the entity in Unix epoch time
   * milliseconds.
   */
  updatedAt?: number;
  /**
   * User who made the update.
   */
  updatedBy?: string;
  /**
   * Count of how many times this tag and children tags are used.
   */
  usageCount?: number;
  /**
   * Metadata version of the entity.
   */
  version?: number;
}
