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
  EntityThread,
  FormatedTableData,
  SearchDataFunctionType,
} from 'Models';
import { FeedFilter } from '../../enums/mydata.enum';
import { User } from '../../generated/entity/teams/user';
import { Paging } from '../../generated/type/paging';

export interface MyDataProps {
  error: string;
  countServices: number;
  countTables: number;
  countTopics: number;
  countDashboards: number;
  followedDataCount: number;
  ownedDataCount: number;
  countPipelines: number;
  userDetails?: User;
  ownedData: Array<FormatedTableData>;
  followedData: Array<FormatedTableData>;
  feedData: EntityThread[];
  feedFilter: FeedFilter;
  paging: Paging;
  isFeedLoading: boolean;
  feedFilterHandler: (v: FeedFilter) => void;
  fetchFeedHandler: (filterType: FeedFilter, after?: string) => void;
  fetchData?: (value: SearchDataFunctionType) => void;
  postFeedHandler: (value: string, id: string) => void;
  deletePostHandler?: (threadId: string, postId: string) => void;
}
