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

import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getWebhooks } from '../../axiosAPIs/webhookAPI';
import Loader from '../../components/Loader/Loader';
import WebhooksV1 from '../../components/Webhooks/WebhooksV1';
import {
  getAddWebhookPath,
  getEditWebhookPath,
  PAGE_SIZE_MEDIUM,
} from '../../constants/constants';
import { EventConfigType } from '../../generated/api/events/createEventConfig';
import { EventConfig, Status } from '../../generated/entity/events/eventConfig';
import { Paging } from '../../generated/type/paging';
import jsonData from '../../jsons/en';
import { showErrorToast } from '../../utils/ToastUtils';

export const SlackSettingsPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<EventConfig[]>([]);

  const history = useHistory();

  const [paging, setPaging] = useState<Paging>({} as Paging);
  const [selectedStatus, setSelectedStatus] = useState<Status[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = (paging?: string) => {
    setIsLoading(true);
    getWebhooks(paging, undefined, {
      limit: PAGE_SIZE_MEDIUM,
      eventConfigType: EventConfigType.Slack,
    })
      .then((response) => {
        if (response.data) {
          setData(response.data);
          setPaging(response.paging);
        } else {
          setData([]);
          setPaging({} as Paging);

          throw jsonData['api-error-messages']['unexpected-server-response'];
        }
      })
      .catch((err: AxiosError) => {
        showErrorToast(
          err,
          jsonData['api-error-messages']['fetch-webhook-error']
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handlePageChange = (
    cursorType: string | number,
    activePage?: number
  ) => {
    const pagingString = `&${cursorType}=${
      paging[cursorType as keyof typeof paging]
    }`;
    fetchData(pagingString);
    setCurrentPage(activePage ?? 1);
  };

  const handleStatusFilter = (status: Status[]) => {
    setSelectedStatus(status);
  };

  const handleClickWebhook = (name: string) => {
    history.push(getEditWebhookPath(name));
  };

  const handleAddWebhook = () => {
    history.push(getAddWebhookPath(EventConfigType.Slack));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return !isLoading ? (
    <WebhooksV1
      currentPage={currentPage}
      data={data}
      eventConfigType={EventConfigType.Slack}
      paging={paging}
      selectedStatus={selectedStatus}
      onAddWebhook={handleAddWebhook}
      onClickWebhook={handleClickWebhook}
      onPageChange={handlePageChange}
      onStatusFilter={handleStatusFilter}
    />
  ) : (
    <Loader />
  );
};

export default SlackSettingsPage;
