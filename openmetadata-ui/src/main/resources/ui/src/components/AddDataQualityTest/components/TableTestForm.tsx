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

import { Button, Form, FormProps, Input, Select, Space } from 'antd';
import { AxiosError } from 'axios';
import { isEmpty, isUndefined } from 'lodash';
import { EditorContentRef } from 'Models';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getListTestCase,
  getListTestDefinitions,
} from '../../../axiosAPIs/testAPI';
import { API_RES_MAX_SIZE } from '../../../constants/constants';
import { TestCase } from '../../../generated/tests/testCase';
import {
  EntityType,
  TestDefinition,
} from '../../../generated/tests/testDefinition';
import { generateEntityLink } from '../../../utils/TableUtils';
import { showErrorToast } from '../../../utils/ToastUtils';
import RichTextEditor from '../../common/rich-text-editor/RichTextEditor';
import { TableTestFormProps } from '../AddDataQualityTest.interface';
import ParameterForm from './ParameterForm';

const TableTestForm: React.FC<TableTestFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const { entityTypeFQN } = useParams<Record<string, string>>();
  const markdownRef = useRef<EditorContentRef>();
  const [testDefinitions, setTestDefinitions] = useState<TestDefinition[]>([]);
  const [selectedTestType, setSelectedTestType] = useState<string>();
  const [testCases, setTestCases] = useState<{ [key: string]: TestCase }>({});

  const fetchAllTestDefinitions = async () => {
    try {
      const { data } = await getListTestDefinitions({
        limit: API_RES_MAX_SIZE,
        entityType: EntityType.Table,
      });
      //   data.length && setSelectedTestType(data[0].id);
      setTestDefinitions(data);
    } catch (error) {
      showErrorToast(error as AxiosError);
    }
  };
  const fetchAllTestCases = async () => {
    try {
      const { data } = await getListTestCase({
        fields: 'testDefinition',
        limit: API_RES_MAX_SIZE,
        entityLink: generateEntityLink(entityTypeFQN),
      });
      const modifiedData = data.reduce((acc, curr) => {
        return { ...acc, [curr.testDefinition.fullyQualifiedName || '']: curr };
      }, {});
      setTestCases(modifiedData);
    } catch (error) {
      showErrorToast(error as AxiosError);
    }
  };

  const GenerateParamsField = useCallback(() => {
    const selectedDefinition = testDefinitions.find(
      (definition) => definition.id === selectedTestType
    );

    if (selectedDefinition && selectedDefinition.parameterDefinition) {
      return <ParameterForm definition={selectedDefinition} />;
    }

    return;
  }, [selectedTestType]);

  const handleFormSubmit: FormProps['onFinish'] = (value) => {
    onSubmit({
      ...value,
      description: markdownRef.current?.getEditorContent(),
    });
  };

  useEffect(() => {
    if (testDefinitions.length === 0) {
      fetchAllTestDefinitions();
    }
    if (isEmpty(testCases)) {
      fetchAllTestCases();
    }
  }, []);

  return (
    <Form
      layout="vertical"
      name="tableTestForm"
      onFinish={handleFormSubmit}
      onValuesChange={(value) => {
        if (value.testTypeId) {
          setSelectedTestType(value.testTypeId);
        }
      }}>
      <Form.Item
        label="Name:"
        name="testName"
        rules={[
          {
            required: true,
            message: 'Name is required!',
          },
          {
            validator: (_, value) => {
              if (
                Object.values(testCases).some((suite) => suite.name === value)
              ) {
                return Promise.reject('Name already exist!');
              }

              return Promise.resolve();
            },
          },
        ]}>
        <Input placeholder="Enter test case name" />
      </Form.Item>
      <Form.Item
        label="Test Type:"
        name="testTypeId"
        rules={[{ required: true, message: 'Test type is required' }]}>
        <Select
          options={testDefinitions
            .filter(
              (def) =>
                def.fullyQualifiedName &&
                isUndefined(testCases[def.fullyQualifiedName])
            )
            .map((suite) => ({
              label: suite.name,
              value: suite.id,
            }))}
          placeholder="Select test type"
        />
      </Form.Item>

      {GenerateParamsField()}

      <Form.Item label="Description:" name="description">
        <RichTextEditor
          initialValue=""
          ref={markdownRef}
          style={{
            margin: 0,
          }}
        />
      </Form.Item>

      <Form.Item noStyle>
        <Space className="tw-w-full tw-justify-end" size={16}>
          <Button onClick={onCancel}>Back</Button>
          <Button htmlType="submit" type="primary">
            Next
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default TableTestForm;
