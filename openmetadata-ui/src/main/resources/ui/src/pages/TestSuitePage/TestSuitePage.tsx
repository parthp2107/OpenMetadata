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

import { Col, Row, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getListTestSuites } from '../../axiosAPIs/testAPI';
import Ellipses from '../../components/common/Ellipses/Ellipses';
import NextPrevious from '../../components/common/next-previous/NextPrevious';
import {
  INITIAL_PAGING_VALUE,
  PAGE_SIZE,
  pagingObject,
} from '../../constants/constants';
import { TestSuite } from '../../generated/tests/testSuite';
import { Paging } from '../../generated/type/paging';
import { getTestSuitePath } from '../../utils/RouterUtils';
const { Text } = Typography;

const TestSuitePage = () => {
  const [testSuites, setTestSuites] = useState<Array<TestSuite>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testSuitePage, setTestSuitePage] = useState(INITIAL_PAGING_VALUE);
  const [testSuitePaging, setTestSuitePaging] = useState<Paging>(pagingObject);

  const fetchTestSuites = async (param?: Record<string, string>) => {
    try {
      setIsLoading(true);
      const response = await getListTestSuites({
        fields: 'owner,tests',
        limit: PAGE_SIZE,
        before: param && param.before,
        after: param && param.after,
      });
      setTestSuites(response.data);
      setTestSuitePaging(response.paging);
    } catch (err) {
      setTestSuites([]);
      setTestSuitePaging(pagingObject);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo(() => {
    const col: ColumnsType<TestSuite> = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (_, record) => (
          <Link to={getTestSuitePath(record.name)}>{record.name}</Link>
        ),
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        width: 300,
        render: (_, record) => (
          <Ellipses tooltip className="tw-w-11/12">
            {record.description}
          </Ellipses>
        ),
      },
      {
        title: 'No. of Test',
        dataIndex: 'noOfTests',
        key: 'noOfTests',
        render: (_, record) => (
          <Text strong>{record?.tests?.length} Tests</Text>
        ),
      },
      {
        title: 'Owner',
        dataIndex: 'owner',
        key: 'owner',
        render: (_, record) => <span>{record?.owner?.displayName}</span>,
      },
    ];

    return col;
  }, [testSuites]);

  const testSuitePagingHandler = (
    cursorValue: string | number,
    activePage?: number
  ) => {
    setTestSuitePage(activePage as number);
    fetchTestSuites({
      [cursorValue]: testSuitePaging[cursorValue as keyof Paging] as string,
    });
  };

  useEffect(() => {
    fetchTestSuites();
  }, []);

  return (
    <Row className="tw-w-full">
      <Col span={24}>
        <Table
          columns={columns}
          dataSource={testSuites}
          loading={isLoading}
          pagination={false}
          size="small"
        />
      </Col>
      {testSuites.length > PAGE_SIZE && (
        <Col span={24}>
          <NextPrevious
            currentPage={testSuitePage}
            pageSize={PAGE_SIZE}
            paging={testSuitePaging}
            pagingHandler={testSuitePagingHandler}
            totalCount={testSuitePaging.total}
          />
        </Col>
      )}
    </Row>
  );
};

export default TestSuitePage;
