/*
 *  Copyright 2022 Collate
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

import {
  Button,
  Card,
  Divider,
  Dropdown,
  Input,
  MenuItemProps,
  MenuProps,
  Row,
  Space,
  Typography,
} from 'antd';
import classNames from 'classnames';
import React, { ChangeEvent, FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as DropDown } from '../../assets/svg/DropDown.svg';
import {
  getSearchDropdownLabels,
  getSelectedOptionLabelString,
} from '../../utils/AdvancedSearchUtils';
import Loader from '../Loader/Loader';
import { SearchDropdownProps } from './SearchDropdown.interface';
import './SearchDropdown.less';

const SearchDropdown: FC<SearchDropdownProps> = ({
  isSuggestionsLoading,
  label,
  options,
  searchKey,
  selectedKeys,
  onChange,
  onSearch,
}) => {
  const { t } = useTranslation();

  const [isDropDownOpen, setIsDropDownOpen] = useState<boolean>(false);
  const [selectedOptions, setSelectedOptions] =
    useState<string[]>(selectedKeys);

  // derive menu props from options and selected keys
  const menuOptions: MenuProps['items'] = useMemo(() => {
    // Separating selected options to show on top
    const selectedOptionKeys =
      getSearchDropdownLabels(selectedOptions, true) || [];

    // Filtering out unselected options
    const unselectedOptions = options.filter(
      (option) => !selectedOptions.includes(option)
    );

    // Labels for unselected options
    const otherOptions =
      getSearchDropdownLabels(unselectedOptions, false) || [];

    return [...selectedOptionKeys, ...otherOptions];
  }, [options, selectedOptions]);

  // handle menu item click
  const handleMenuItemClick: MenuItemProps['onClick'] = (info) => {
    const currentKey = info.key;
    const isSelected = selectedOptions.includes(currentKey);

    const updatedValues = isSelected
      ? selectedOptions.filter((v) => v !== currentKey)
      : [...selectedOptions, currentKey];

    setSelectedOptions(updatedValues);
  };

  // handle clear all
  const handleClear = () => {
    setSelectedOptions([]);
  };

  // handle search
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    onSearch(value, searchKey);
  };

  // Handle dropdown close
  const handleDropdownClose = () => {
    setIsDropDownOpen(false);
  };

  // Handle update button click
  const handleUpdate = () => {
    // call on change with updated value
    onChange(selectedOptions, searchKey);
    handleDropdownClose();
  };

  const showClearAllBtn = useMemo(
    () => selectedOptions.length > 1,
    [selectedOptions]
  );

  return (
    <Dropdown
      destroyPopupOnHide
      data-testid={searchKey}
      dropdownRender={(menuNode) => (
        <Card
          bodyStyle={{ padding: 0 }}
          className="custom-dropdown-render"
          data-testid="drop-down-menu">
          <Space direction="vertical" size={0}>
            <div className="p-t-sm p-x-sm">
              <Input
                data-testid="search-input"
                placeholder={`${t('label.search-entity', {
                  entity: label,
                })}...`}
                onChange={handleSearch}
              />
            </div>
            {showClearAllBtn && (
              <>
                <Divider className="m-t-xs m-b-0" />
                <Button
                  className="p-0 m-l-sm"
                  data-testid="clear-button"
                  type="link"
                  onClick={handleClear}>
                  {t('label.clear-all')}
                </Button>
              </>
            )}
            <Divider
              className={classNames(showClearAllBtn ? 'm-y-0' : 'm-t-xs m-b-0')}
            />
            {isSuggestionsLoading ? (
              <Row align="middle" className="p-y-sm" justify="center">
                <Loader size="small" />
              </Row>
            ) : options.length > 0 || selectedOptions.length > 0 ? (
              menuNode
            ) : (
              <Row className="m-y-sm" justify="center">
                <Typography.Text>
                  {t('label.no-data-available')}
                </Typography.Text>
              </Row>
            )}
            <Space className="p-sm p-t-xss">
              <Button
                className="update-btn"
                data-testid="update-btn"
                size="small"
                onClick={handleUpdate}>
                {t('label.update')}
              </Button>
              <Button
                data-testid="close-btn"
                size="small"
                type="link"
                onClick={handleDropdownClose}>
                {t('label.close')}
              </Button>
            </Space>
          </Space>
        </Card>
      )}
      key={searchKey}
      menu={{ items: menuOptions, onClick: handleMenuItemClick }}
      open={isDropDownOpen}
      trigger={['click']}
      onOpenChange={(visible) => {
        visible && onSearch('', searchKey);
        setIsDropDownOpen(visible);
      }}>
      <Button className="quick-filter-dropdown-trigger-btn">
        <Space data-testid="search-dropdown" size={4}>
          <Space size={0}>
            <Typography.Text>{label}</Typography.Text>
            {selectedKeys.length > 0 && (
              <span>
                {': '}
                <Typography.Text className="text-primary font-medium">
                  {getSelectedOptionLabelString(selectedKeys)}
                </Typography.Text>
              </span>
            )}
          </Space>
          <DropDown className="flex self-center" />
        </Space>
      </Button>
    </Dropdown>
  );
};

export default SearchDropdown;
