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

import {
  CreateEventConfig,
  EventConfigType,
} from '../generated/api/events/createEventConfig';
import { EventConfig } from '../generated/entity/events/eventConfig';
import { Paging } from '../generated/type/paging';
import { getURLWithQueryFields } from '../utils/APIUtils';
import APIClient from './index';

export const getWebhooks = async (
  paging?: string,
  arrQueryFields?: string,
  params?: { limit: number; eventConfigType?: EventConfigType }
) => {
  const url = getURLWithQueryFields(
    '/webhook',
    arrQueryFields,
    paging ? paging : undefined
  );

  const response = await APIClient.get<{ data: EventConfig[]; paging: Paging }>(
    url,
    {
      params,
    }
  );

  return response.data;
};

export const addWebhook = async (data: CreateEventConfig) => {
  const url = '/webhook';

  const response = await APIClient.post<CreateEventConfig>(url, data);

  return response.data;
};

export const updateWebhook = async (data: CreateEventConfig) => {
  const url = '/webhook';

  const response = await APIClient.put<CreateEventConfig>(url, data);

  return response.data;
};

export const deleteWebhook = async (id: string) => {
  const url = `/webhook/${id}`;

  const response = await APIClient.delete<EventConfig>(url);

  return response.data;
};

export const getWebhookByName = async (name: string) => {
  const url = `/webhook/name/${name}`;

  const response = await APIClient.get<EventConfig>(url);

  return response.data;
};

export const getWebhookById = async (id: string) => {
  const url = `/webhook/${id}`;

  const response = await APIClient.get<EventConfig>(url);

  return response.data;
};
