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

import { List, Space, Typography } from 'antd';
import { toString } from 'lodash';
import moment from 'moment';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { ThreadType } from '../../generated/entity/feed/thread';
import { entityDisplayName, prepareFeedLink } from '../../utils/FeedUtils';
import { getTaskDetailPath } from '../../utils/TasksUtils';
import ProfilePicture from '../common/ProfilePicture/ProfilePicture';
import { NotificationFeedProp } from './NotificationFeedCard.interface';

const NotificationFeedCard: FC<NotificationFeedProp> = ({
  createdBy,
  entityFQN,
  entityType,
  timestamp,
  feedType,
  taskDetails,
}) => {
  return (
    <Link
      className="tw-no-underline"
      to={
        feedType === ThreadType.Conversation
          ? prepareFeedLink(entityType, entityFQN)
          : getTaskDetailPath(toString(taskDetails?.id)).pathname
      }>
      <List.Item.Meta
        avatar={<ProfilePicture id="" name={createdBy} width="32" />}
        className="tw-m-0"
        description={
          <Space direction="vertical" size={0}>
            <Typography.Paragraph
              className="tw-m-0"
              style={{ color: '#37352F', marginBottom: 0 }}>
              <>{createdBy}</>
              {feedType === ThreadType.Conversation ? (
                <>
                  <span> mentioned you on the </span> <span>{entityType} </span>
                  <Link
                    className="tw-truncate"
                    to={prepareFeedLink(entityType, entityFQN)}>
                    {entityDisplayName(entityType, entityFQN)}
                  </Link>
                </>
              ) : (
                <>
                  <span className="tw-px-1">assigned you a new task</span>
                  <Link
                    to={getTaskDetailPath(toString(taskDetails?.id)).pathname}>
                    {`#${taskDetails?.id}`} {taskDetails?.type}
                  </Link>
                </>
              )}
            </Typography.Paragraph>
            <Typography.Text
              style={{ color: '#6B7280', marginTop: '8px', fontSize: '12px' }}
              title={moment(timestamp).format('MMM, DD, YYYY hh:mm:ss')}>
              {moment(timestamp).fromNow()}
            </Typography.Text>
          </Space>
        }
        style={{ marginBottom: 0 }}
      />
    </Link>
  );
};

export default NotificationFeedCard;
