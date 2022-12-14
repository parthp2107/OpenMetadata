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

import { Divider, Space } from 'antd';
import { AxiosError } from 'axios';
import { isUndefined } from 'lodash';
import React, { FC, useState } from 'react';
import {
  getAdvancedFieldDefaultOptions,
  getAdvancedFieldOptions,
  getTagSuggestions,
  getUserSuggestions,
} from '../../axiosAPIs/miscAPI';
import { MISC_FIELDS } from '../../constants/AdvancedSearch.constants';
import { getAdvancedField } from '../../utils/AdvancedSearchUtils';
import { showErrorToast } from '../../utils/ToastUtils';
import SearchDropdown from '../SearchDropdown/SearchDropdown';
import { ExploreQuickFiltersProps } from './ExploreQuickFilters.interface';

const ExploreQuickFilters: FC<ExploreQuickFiltersProps> = ({
  fields,
  onAdvanceSearch,
  index,
  onFieldValueSelect,
}) => {
  const [options, setOptions] = useState<string[]>();
  const [isOptionsLoading, setIsOptionsLoading] = useState<boolean>(false);

  const fetchOptions = async (query: string, fieldKey: string) => {
    const advancedField = getAdvancedField(fieldKey);
    if (!MISC_FIELDS.includes(fieldKey)) {
      const res = await getAdvancedFieldOptions(query, index, advancedField);

      const suggestOptions =
        res.data.suggest['metadata-suggest'][0].options ?? [];
      const uniqueOptions = [...new Set(suggestOptions.map((op) => op.text))];
      setOptions(uniqueOptions);
    } else {
      if (fieldKey === 'tags.tagFQN') {
        const res = await getTagSuggestions(query);

        const suggestOptions =
          res.data.suggest['metadata-suggest'][0].options ?? [];
        const uniqueOptions = [
          ...new Set(
            suggestOptions
              .filter((op) => !isUndefined(op._source.fullyQualifiedName))
              .map((op) => op._source.fullyQualifiedName as string)
          ),
        ];
        setOptions(uniqueOptions);
      } else {
        const res = await getUserSuggestions(query);

        const suggestOptions =
          res.data.suggest['metadata-suggest'][0].options ?? [];
        const uniqueOptions = [
          ...new Set(suggestOptions.map((op) => op._source.name)),
        ];
        setOptions(uniqueOptions);
      }
    }
  };

  const getFilterOptions = async (value: string, key: string) => {
    setIsOptionsLoading(true);
    try {
      if (value) {
        await fetchOptions(value, key);
      } else {
        const res = await getAdvancedFieldDefaultOptions(index, key);
        const buckets = res.data.aggregations[`sterms#${key}`].buckets;
        setOptions(buckets.map((option) => option.key));
      }
    } catch (error) {
      showErrorToast(error as AxiosError);
    } finally {
      setIsOptionsLoading(false);
    }
  };

  return (
    <Space wrap className="explore-quick-filters-container" size={[16, 16]}>
      {fields.map((field) => (
        <SearchDropdown
          isSuggestionsLoading={isOptionsLoading}
          key={field.key}
          label={field.label}
          options={options || []}
          searchKey={field.key}
          selectedKeys={field.value || []}
          onChange={(updatedValues) => {
            onFieldValueSelect({ ...field, value: updatedValues });
          }}
          onSearch={getFilterOptions}
        />
      ))}
      <Divider className="m-0" type="vertical" />
      <span
        className="tw-text-primary tw-self-center tw-cursor-pointer"
        data-testid="advance-search-button"
        onClick={onAdvanceSearch}>
        Advance Search
      </span>
    </Space>
  );
};

export default ExploreQuickFilters;
