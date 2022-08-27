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

import { Button, Col, Row, Space, Typography } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import {
  getDatabaseDetailsPath,
  getDatabaseSchemaDetailsPath,
  getServiceDetailsPath,
  getTableTabPath,
} from '../../constants/constants';
import { STEPS_FOR_ADD_TEST_CASE } from '../../constants/profiler.constant';
import { FqnPart } from '../../enums/entity.enum';
import { PageLayoutType } from '../../enums/layout.enum';
import { ServiceCategory } from '../../enums/service.enum';
import { TestCase } from '../../generated/tests/testCase';
import {
  getEntityName,
  getPartialNameFromTableFQN,
} from '../../utils/CommonUtils';
import { serviceTypeLogo } from '../../utils/ServiceUtils';
import CronEditor from '../common/CronEditor/CronEditor';
import TitleBreadcrumb from '../common/title-breadcrumb/title-breadcrumb.component';
import PageLayout from '../containers/PageLayout';
import IngestionStepper from '../IngestionStepper/IngestionStepper.component';
import {
  AddDataQualityTestProps,
  SelectTestSuiteType,
} from './AddDataQualityTest.interface';
import RightPanel from './components/RightPanel';
import SelectTestSuite from './components/SelectTestSuite';
import TableTestForm from './components/TableTestForm';

const AddDataQualityTestV1: React.FC<AddDataQualityTestProps> = ({ table }) => {
  const [activeServiceStep, setActiveServiceStep] = useState(1);
  const [selectedTestSuite, setSelectedTestSuite] =
    useState<SelectTestSuiteType>();
  const [testCaseData, setTestCaseData] = useState<TestCase>();
  const [repeatFrequency, setRepeatFrequency] = useState('');

  const breadcrumb = useMemo(() => {
    const { service, serviceType, fullyQualifiedName = '' } = table;

    return [
      {
        name: service?.name || '',
        url: service
          ? getServiceDetailsPath(
              service.name || '',
              ServiceCategory.DATABASE_SERVICES
            )
          : '',
        imgSrc: serviceType ? serviceTypeLogo(serviceType) : undefined,
      },
      {
        name: getPartialNameFromTableFQN(fullyQualifiedName, [
          FqnPart.Database,
        ]),
        url: getDatabaseDetailsPath(fullyQualifiedName),
      },
      {
        name: getPartialNameFromTableFQN(fullyQualifiedName, [FqnPart.Schema]),
        url: getDatabaseSchemaDetailsPath(fullyQualifiedName),
      },
      {
        name: getEntityName(table),
        url: getTableTabPath(fullyQualifiedName),
      },
      {
        name: 'Add Table Test',
        url: '',
        activeTitle: true,
      },
    ];
  }, [table]);

  const handleCancelClick = () => {
    setActiveServiceStep((pre) => pre - 1);
  };

  const handleSelectTestSuite = (data: SelectTestSuiteType) => {
    setSelectedTestSuite(data);
    setActiveServiceStep(2);
  };

  const handleTestCaseData = (data: TestCase) => {
    setTestCaseData(data);
    setActiveServiceStep(3);
  };

  const RenderSelectedTab = useCallback(() => {
    if (activeServiceStep === 2) {
      return (
        <TableTestForm
          onCancel={handleCancelClick}
          onSubmit={handleTestCaseData}
        />
      );
    } else if (activeServiceStep === 3) {
      return (
        <Row gutter={[16, 32]}>
          <Col span={24}>
            <CronEditor
              value={repeatFrequency}
              onChange={(value: string) => setRepeatFrequency(value)}
            />
          </Col>
          <Col span={24}>
            <Space className="tw-w-full tw-justify-end" size={16}>
              <Button onClick={handleCancelClick}>Back</Button>
              <Button type="primary">Submit</Button>
            </Space>
          </Col>
        </Row>
      );
    } else if (activeServiceStep > 3) {
      return <p>Success</p>;
    }

    return <SelectTestSuite onSubmit={handleSelectTestSuite} />;
  }, [activeServiceStep]);

  return (
    <PageLayout
      classes="tw-max-w-full-hd tw-h-full tw-pt-4"
      header={<TitleBreadcrumb titleLinks={breadcrumb} />}
      layout={PageLayoutType['2ColRTL']}
      rightPanel={<RightPanel />}>
      <Row className="tw-form-container" gutter={[16, 16]}>
        <Col span={24}>
          <Typography.Title level={5}>Add Table Test</Typography.Title>
        </Col>
        <Col span={24}>
          <IngestionStepper
            activeStep={activeServiceStep}
            steps={STEPS_FOR_ADD_TEST_CASE}
          />
        </Col>
        <Col span={24}>{RenderSelectedTab()}</Col>
      </Row>
    </PageLayout>
  );
};

export default AddDataQualityTestV1;
