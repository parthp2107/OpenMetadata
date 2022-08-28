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

import { Table } from '../../generated/entity/data/table';
import { TestCase } from '../../generated/tests/testCase';
import { TestDefinition } from '../../generated/tests/testDefinition';
import { TestSuite } from '../../generated/tests/testSuite';

export interface AddDataQualityTestProps {
  table: Table;
}

export interface SelectTestSuiteProps {
  initialValue?: SelectTestSuiteType;
  onSubmit: (data: SelectTestSuiteType) => void;
}

export interface TestCaseFormProps {
  initialValue?: TestCase;
  onSubmit: (data: TestCase) => void;
  onCancel: (data: TestCase) => void;
}

export interface TestSuiteIngestionProps {
  testSuite: TestSuite;
  onCancel: () => void;
}

export interface TestSuiteSchedulerProps {
  onSubmit: (repeatFrequency: string) => void;
  onCancel: () => void;
}

export type SelectTestSuiteType = {
  name?: string;
  description?: string;
  data?: TestSuite;
  isNewTestSuite: boolean;
};

export interface ParameterFormProps {
  definition: TestDefinition;
}
