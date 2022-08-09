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

import { AxiosResponse } from 'axios';
import { Operation } from 'fast-json-patch';
import { CreateGlossary } from '../generated/api/data/createGlossary';
import { CreateGlossaryTerm } from '../generated/api/data/createGlossaryTerm';
import { Glossary } from '../generated/entity/data/glossary';
import { GlossaryTerm } from '../generated/entity/data/glossaryTerm';
import { ModifiedGlossaryData } from '../pages/GlossaryPage/GlossaryPageV1.component';
import { getURLWithQueryFields } from '../utils/APIUtils';
import APIClient from './index';

export const getGlossaries = async (
  paging = '',
  limit = 10,
  arrQueryFields: string | string[] = ''
) => {
  const qParams = `limit=${limit}`;
  const url = getURLWithQueryFields(`/glossaries`, arrQueryFields, qParams);

  const response = await APIClient.get<{ data: ModifiedGlossaryData[] }>(
    paging ? `${url}&${paging}` : url
  );

  return response.data;
};

export const addGlossaries = async (data: CreateGlossary) => {
  const url = '/glossaries';

  const response = await APIClient.post<
    CreateGlossary,
    AxiosResponse<Glossary>
  >(url, data);

  return response.data;
};

export const updateGlossaries = (
  data: CreateGlossary
): Promise<AxiosResponse> => {
  const url = '/glossaries';

  return APIClient.put(url, data);
};

export const patchGlossaries = async (id: string, patch: Operation[]) => {
  const configOptions = {
    headers: { 'Content-type': 'application/json-patch+json' },
  };

  const response = await APIClient.patch<Operation[], AxiosResponse<Glossary>>(
    `/glossaries/${id}`,
    patch,
    configOptions
  );

  return response.data;
};

export const getGlossariesByName = async (
  glossaryName: string,
  arrQueryFields: string | string[]
) => {
  const url = getURLWithQueryFields(
    `/glossaries/name/${glossaryName}`,
    arrQueryFields
  );

  const response = await APIClient.get<Glossary>(url);

  return response.data;
};

export const getGlossaryTerms = (
  glossaryId = '',
  limit = 10,
  arrQueryFields: string | string[] = ''
): Promise<AxiosResponse<{ data: GlossaryTerm[] }>> => {
  let qParams = `limit=${limit}`;
  qParams += glossaryId ? `&glossary=${glossaryId}` : '';
  const url = getURLWithQueryFields(`/glossaryTerms`, arrQueryFields, qParams);

  return APIClient.get(url);
};

export const getGlossaryTermsById: Function = (
  glossaryTermId = '',
  arrQueryFields = ''
): Promise<AxiosResponse> => {
  const url = getURLWithQueryFields(
    `/glossaryTerms/${glossaryTermId}`,
    arrQueryFields
  );

  return APIClient.get(url);
};

export const getGlossaryTermByFQN = async (
  glossaryTermFQN = '',
  arrQueryFields: string | string[] = ''
) => {
  const url = getURLWithQueryFields(
    `/glossaryTerms/name/${glossaryTermFQN}`,
    arrQueryFields
  );

  const response = await APIClient.get<GlossaryTerm>(url);

  return response.data;
};

export const addGlossaryTerm = (
  data: CreateGlossaryTerm
): Promise<AxiosResponse> => {
  const url = '/glossaryTerms';

  return APIClient.post(url, data);
};

export const patchGlossaryTerm = async (id: string, patch: Operation[]) => {
  const configOptions = {
    headers: { 'Content-type': 'application/json-patch+json' },
  };

  const response = await APIClient.patch<Operation[], AxiosResponse<Glossary>>(
    `/glossaryTerms/${id}`,
    patch,
    configOptions
  );

  return response.data;
};

export const deleteGlossary = (id: string) => {
  return APIClient.delete(`/glossaries/${id}?recursive=true&hardDelete=true`);
};

export const deleteGlossaryTerm = (id: string) => {
  return APIClient.delete(
    `/glossaryTerms/${id}?recursive=true&hardDelete=true`
  );
};
