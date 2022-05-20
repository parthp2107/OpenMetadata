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

import classNames from 'classnames';
import { compare } from 'fast-json-patch';
import { isNil } from 'lodash';
import { EntityFieldThreads, EntityTags, ExtraInfo } from 'Models';
import React, { Fragment, RefObject, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../authentication/auth-provider/AuthProvider';
import { FQN_SEPARATOR_CHAR } from '../../constants/char.constants';
import { getTeamAndUserDetailsPath } from '../../constants/constants';
import { observerOptions } from '../../constants/Mydata.constants';
import { EntityType } from '../../enums/entity.enum';
import { OwnerType } from '../../enums/user.enum';
import { Pipeline, Task } from '../../generated/entity/data/pipeline';
import { Operation } from '../../generated/entity/policies/accessControl/rule';
import { EntityReference } from '../../generated/type/entityReference';
import { Paging } from '../../generated/type/paging';
import { LabelType, State } from '../../generated/type/tagLabel';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import {
  getCurrentUserId,
  getEntityName,
  getEntityPlaceHolder,
  getHtmlForNonAdminAction,
  getUserTeams,
  isEven,
} from '../../utils/CommonUtils';
import { getEntityFeedLink } from '../../utils/EntityUtils';
import {
  getDefaultValue,
  getFieldThreadElement,
} from '../../utils/FeedElementUtils';
import { getEntityFieldThreadCounts } from '../../utils/FeedUtils';
import SVGIcons, { Icons } from '../../utils/SvgUtils';
import { getTagsWithoutTier } from '../../utils/TableUtils';
import ActivityFeedList from '../ActivityFeed/ActivityFeedList/ActivityFeedList';
import ActivityThreadPanel from '../ActivityFeed/ActivityThreadPanel/ActivityThreadPanel';
import Description from '../common/description/Description';
import EntityPageInfo from '../common/entityPageInfo/EntityPageInfo';
import NonAdminAction from '../common/non-admin-action/NonAdminAction';
import PopOver from '../common/popover/PopOver';
import RichTextEditorPreviewer from '../common/rich-text-editor/RichTextEditorPreviewer';
import TabsPane from '../common/TabsPane/TabsPane';
import PageContainer from '../containers/PageContainer';
import Entitylineage from '../EntityLineage/EntityLineage.component';
import Loader from '../Loader/Loader';
import ManageTabComponent from '../ManageTab/ManageTab.component';
import { ModalWithMarkdownEditor } from '../Modals/ModalWithMarkdownEditor/ModalWithMarkdownEditor';
import RequestDescriptionModal from '../Modals/RequestDescriptionModal/RequestDescriptionModal';
import PipelineStatusList from '../PipelineStatusList/PipelineStatusList.component';
import { PipeLineDetailsProp } from './PipelineDetails.interface';

const PipelineDetails = ({
  entityName,
  owner,
  tier,
  slashedPipelineName,
  pipelineTags,
  activeTab,
  pipelineUrl,
  pipelineDetails,
  serviceType,
  setActiveTabHandler,
  description,
  descriptionUpdateHandler,
  entityLineage,
  followers,
  users,
  followPipelineHandler,
  unfollowPipelineHandler,
  tagUpdateHandler,
  settingsUpdateHandler,
  tasks,
  taskUpdateHandler,
  loadNodeHandler,
  lineageLeafNodes,
  isNodeLoading,
  version,
  deleted,
  versionHandler,
  addLineageHandler,
  removeLineageHandler,
  entityLineageHandler,
  isLineageLoading,
  isentityThreadLoading,
  entityThread,
  postFeedHandler,
  feedCount,
  entityFieldThreadCount,
  createThread,
  pipelineFQN,
  deletePostHandler,
  paging,
  fetchFeedHandler,
  pipelineStatus,
  isPipelineStatusLoading,
}: PipeLineDetailsProp) => {
  const { isAuthDisabled } = useAuthContext();
  const [isEdit, setIsEdit] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editTask, setEditTask] = useState<{
    task: Task;
    index: number;
  }>();

  const [threadLink, setThreadLink] = useState<string>('');

  const [selectedField, setSelectedField] = useState<string>('');

  const [elementRef, isInView] = useInfiniteScroll(observerOptions);

  const onEntityFieldSelect = (value: string) => {
    setSelectedField(value);
  };
  const closeRequestModal = () => {
    setSelectedField('');
  };

  const hasEditAccess = () => {
    if (owner?.type === 'user') {
      return owner.id === getCurrentUserId();
    } else {
      return getUserTeams().some((team) => team.id === owner?.id);
    }
  };
  const setFollowersData = (followers: Array<EntityReference>) => {
    setIsFollowing(
      followers.some(({ id }: { id: string }) => id === getCurrentUserId())
    );
    setFollowersCount(followers?.length);
  };
  const tabs = [
    {
      name: 'Details',
      icon: {
        alt: 'schema',
        name: 'icon-schema',
        title: 'Details',
        selectedName: 'icon-schemacolor',
      },
      isProtected: false,
      position: 1,
    },
    {
      name: 'Activity Feed',
      icon: {
        alt: 'activity_feed',
        name: 'activity_feed',
        title: 'Activity Feed',
        selectedName: 'activity-feed-color',
      },
      isProtected: false,
      position: 2,
      count: feedCount,
    },
    {
      name: 'Executions',
      icon: {
        alt: 'execution',
        name: 'execution',
        title: 'Execution',
        selectedName: 'execution-color',
      },
      isProtected: false,
      position: 3,
    },
    {
      name: 'Lineage',
      icon: {
        alt: 'lineage',
        name: 'icon-lineage',
        title: 'Lineage',
        selectedName: 'icon-lineagecolor',
      },
      isProtected: false,
      position: 4,
    },
    {
      name: 'Manage',
      icon: {
        alt: 'manage',
        name: 'icon-manage',
        title: 'Manage',
        selectedName: 'icon-managecolor',
      },
      isProtected: true,
      isHidden: deleted,
      protectedState: !owner || hasEditAccess(),
      position: 5,
    },
  ];

  const extraInfo: Array<ExtraInfo> = [
    {
      key: 'Owner',
      value:
        owner?.type === 'team'
          ? getTeamAndUserDetailsPath(owner?.name || '')
          : getEntityName(owner),
      placeholderText: getEntityPlaceHolder(
        getEntityName(owner),
        owner?.deleted
      ),
      isLink: owner?.type === 'team',
      openInNewTab: false,
      profileName: owner?.type === OwnerType.USER ? owner?.name : undefined,
    },
    {
      key: 'Tier',
      value: tier?.tagFQN ? tier.tagFQN.split(FQN_SEPARATOR_CHAR)[1] : '',
    },
    {
      key: `${serviceType} Url`,
      value: pipelineUrl,
      placeholderText: entityName,
      isLink: true,
      openInNewTab: true,
    },
  ];

  const onTaskUpdate = (taskDescription: string) => {
    if (editTask) {
      const updatedTasks = [...(pipelineDetails.tasks || [])];

      const updatedTask = {
        ...editTask.task,
        description: taskDescription,
      };
      updatedTasks[editTask.index] = updatedTask;

      const updatedPipeline = { ...pipelineDetails, tasks: updatedTasks };
      const jsonPatch = compare(pipelineDetails, updatedPipeline);
      taskUpdateHandler(jsonPatch);
      setEditTask(undefined);
    } else {
      setEditTask(undefined);
    }
  };

  const handleUpdateTask = (task: Task, index: number) => {
    setEditTask({ task, index });
  };

  const closeEditTaskModal = (): void => {
    setEditTask(undefined);
  };

  const onSettingsUpdate = (newOwner?: Pipeline['owner'], newTier?: string) => {
    if (newOwner || newTier) {
      const tierTag: Pipeline['tags'] = newTier
        ? [
            ...getTagsWithoutTier(pipelineDetails.tags as Array<EntityTags>),
            {
              tagFQN: newTier,
              labelType: LabelType.Manual,
              state: State.Confirmed,
            },
          ]
        : pipelineDetails.tags;
      const updatedPipelineDetails = {
        ...pipelineDetails,
        owner: newOwner
          ? { ...pipelineDetails.owner, ...newOwner }
          : pipelineDetails.owner,
        tags: tierTag,
      };

      return settingsUpdateHandler(updatedPipelineDetails);
    } else {
      return Promise.reject();
    }
  };

  const onTagUpdate = (selectedTags?: Array<EntityTags>) => {
    if (selectedTags) {
      const updatedTags = [...(tier ? [tier] : []), ...selectedTags];
      const updatedPipeline = { ...pipelineDetails, tags: updatedTags };
      tagUpdateHandler(updatedPipeline);
    }
  };

  const onDescriptionEdit = (): void => {
    setIsEdit(true);
  };
  const onCancel = () => {
    setIsEdit(false);
  };

  const onDescriptionUpdate = (updatedHTML: string) => {
    if (description !== updatedHTML) {
      const updatedPipelineDetails = {
        ...pipelineDetails,
        description: updatedHTML,
      };
      descriptionUpdateHandler(updatedPipelineDetails);
      setIsEdit(false);
    } else {
      setIsEdit(false);
    }
  };

  const followPipeline = () => {
    if (isFollowing) {
      setFollowersCount((preValu) => preValu - 1);
      setIsFollowing(false);
      unfollowPipelineHandler();
    } else {
      setFollowersCount((preValu) => preValu + 1);
      setIsFollowing(true);
      followPipelineHandler();
    }
  };

  const onThreadLinkSelect = (link: string) => {
    setThreadLink(link);
  };

  const onThreadPanelClose = () => {
    setThreadLink('');
  };

  const getLoader = () => {
    return isentityThreadLoading ? <Loader /> : null;
  };

  const fetchMoreThread = (
    isElementInView: boolean,
    pagingObj: Paging,
    isLoading: boolean
  ) => {
    if (isElementInView && pagingObj?.after && !isLoading) {
      fetchFeedHandler(pagingObj.after);
    }
  };

  useEffect(() => {
    if (isAuthDisabled && users.length && followers.length) {
      setFollowersData(followers);
    }
  }, [users, followers]);

  useEffect(() => {
    setFollowersData(followers);
  }, [followers]);

  useEffect(() => {
    fetchMoreThread(isInView as boolean, paging, isentityThreadLoading);
  }, [paging, isentityThreadLoading, isInView]);

  return (
    <PageContainer>
      <div className="tw-px-6 tw-w-full tw-h-full tw-flex tw-flex-col">
        <EntityPageInfo
          isTagEditable
          deleted={deleted}
          entityFieldThreads={getEntityFieldThreadCounts(
            'tags',
            entityFieldThreadCount
          )}
          entityFqn={pipelineFQN}
          entityName={entityName}
          entityType={EntityType.PIPELINE}
          extraInfo={extraInfo}
          followHandler={followPipeline}
          followers={followersCount}
          followersList={followers}
          hasEditAccess={hasEditAccess()}
          isFollowing={isFollowing}
          owner={owner}
          tags={pipelineTags}
          tagsHandler={onTagUpdate}
          tier={tier}
          titleLinks={slashedPipelineName}
          version={version}
          versionHandler={versionHandler}
          onThreadLinkSelect={onThreadLinkSelect}
        />
        <div className="tw-mt-4 tw-flex tw-flex-col tw-flex-grow">
          <TabsPane
            activeTab={activeTab}
            setActiveTab={setActiveTabHandler}
            tabs={tabs}
          />

          <div className="tw-flex-grow tw-flex tw-flex-col tw--mx-6 tw-px-7 tw-py-4">
            <div className="tw-bg-white tw-flex-grow tw-p-4 tw-shadow tw-rounded-md">
              {activeTab === 1 && (
                <>
                  <div className="tw-grid tw-grid-cols-4 tw-gap-4 tw-w-full">
                    <div className="tw-col-span-full tw--ml-5">
                      <Description
                        description={description}
                        entityFieldThreads={getEntityFieldThreadCounts(
                          'description',
                          entityFieldThreadCount
                        )}
                        entityFqn={pipelineFQN}
                        entityName={entityName}
                        entityType={EntityType.PIPELINE}
                        hasEditAccess={hasEditAccess()}
                        isEdit={isEdit}
                        isReadOnly={deleted}
                        owner={owner}
                        onCancel={onCancel}
                        onDescriptionEdit={onDescriptionEdit}
                        onDescriptionUpdate={onDescriptionUpdate}
                        onEntityFieldSelect={onEntityFieldSelect}
                        onThreadLinkSelect={onThreadLinkSelect}
                      />
                    </div>
                  </div>
                  <div className="tw-table-responsive tw-my-6">
                    {tasks ? (
                      <table className="tw-w-full" data-testid="tasks-table">
                        <thead>
                          <tr className="tableHead-row">
                            <th className="tableHead-cell">Task Name</th>
                            <th className="tableHead-cell">Description</th>
                            <th className="tableHead-cell">Task Type</th>
                          </tr>
                        </thead>
                        <tbody className="tableBody">
                          {tasks?.map((task, index) => (
                            <tr
                              className={classNames(
                                'tableBody-row',
                                !isEven(index + 1) ? 'odd-row' : null
                              )}
                              key={index}>
                              <td className="tableBody-cell">
                                <Link
                                  target="_blank"
                                  to={{ pathname: task.taskUrl }}>
                                  <span className="tw-flex">
                                    <span className="tw-mr-1">
                                      {task.displayName}
                                    </span>
                                    <SVGIcons
                                      alt="external-link"
                                      className="tw-align-middle"
                                      icon="external-link"
                                      width="12px"
                                    />
                                  </span>
                                </Link>
                              </td>
                              <td className="tw-group tableBody-cell tw-relative">
                                <div
                                  className="tw-cursor-pointer tw-flex"
                                  data-testid="description">
                                  <div>
                                    {task.description ? (
                                      <RichTextEditorPreviewer
                                        markdown={task.description}
                                      />
                                    ) : (
                                      <span className="tw-no-description">
                                        No description{' '}
                                      </span>
                                    )}
                                  </div>
                                  {!deleted && (
                                    <Fragment>
                                      <NonAdminAction
                                        html={getHtmlForNonAdminAction(
                                          Boolean(owner)
                                        )}
                                        isOwner={hasEditAccess()}
                                        permission={Operation.UpdateDescription}
                                        position="top">
                                        <button
                                          className="tw-self-start tw-w-8 tw-h-auto tw-opacity-0 tw-ml-1 group-hover:tw-opacity-100 focus:tw-outline-none"
                                          onClick={() =>
                                            handleUpdateTask(task, index)
                                          }>
                                          <SVGIcons
                                            alt="edit"
                                            icon="icon-edit"
                                            title="Edit"
                                            width="12px"
                                          />
                                        </button>
                                      </NonAdminAction>
                                      {!isNil(
                                        getFieldThreadElement(
                                          task.name,
                                          'description',
                                          getEntityFieldThreadCounts(
                                            'tasks',
                                            entityFieldThreadCount
                                          ) as EntityFieldThreads[],
                                          onThreadLinkSelect
                                        )
                                      ) &&
                                      onEntityFieldSelect &&
                                      !task.description ? (
                                        <button
                                          className="focus:tw-outline-none tw-ml-1 tw-opacity-0 group-hover:tw-opacity-100 tw--mt-2"
                                          data-testid="request-description"
                                          onClick={() =>
                                            onEntityFieldSelect?.(
                                              `tasks/${task.name}/description`
                                            )
                                          }>
                                          <PopOver
                                            position="top"
                                            title="Request description"
                                            trigger="mouseenter">
                                            <SVGIcons
                                              alt="request-description"
                                              className="tw-mt-2.5"
                                              icon={Icons.REQUEST}
                                            />
                                          </PopOver>
                                        </button>
                                      ) : null}
                                      {getFieldThreadElement(
                                        task.name,
                                        'description',
                                        getEntityFieldThreadCounts(
                                          'tasks',
                                          entityFieldThreadCount
                                        ) as EntityFieldThreads[],
                                        onThreadLinkSelect,
                                        EntityType.PIPELINE,
                                        pipelineFQN,
                                        `tasks/${task.name}/description`,
                                        Boolean(task.description)
                                      )}
                                    </Fragment>
                                  )}
                                </div>
                              </td>
                              <td className="tableBody-cell">
                                {task.taskType}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="tw-mt-4 tw-ml-4 tw-flex tw-justify-center tw-font-medium tw-items-center tw-border tw-border-main tw-rounded-md tw-p-8">
                        <span>No task data is available</span>
                      </div>
                    )}
                  </div>
                </>
              )}
              {activeTab === 2 && (
                <div
                  className="tw-py-4 tw-px-7 tw-grid tw-grid-cols-3 entity-feed-list tw--mx-7 tw--my-4"
                  id="activityfeed">
                  <div />
                  <ActivityFeedList
                    isEntityFeed
                    withSidePanel
                    className=""
                    deletePostHandler={deletePostHandler}
                    entityName={entityName}
                    feedList={entityThread}
                    postFeedHandler={postFeedHandler}
                  />
                  <div />
                </div>
              )}
              {activeTab === 3 && (
                <PipelineStatusList
                  isLoading={isPipelineStatusLoading}
                  pipelineStatus={pipelineStatus}
                />
              )}
              {activeTab === 4 && (
                <div className="tw-h-full tw-px-3">
                  <Entitylineage
                    addLineageHandler={addLineageHandler}
                    deleted={deleted}
                    entityLineage={entityLineage}
                    entityLineageHandler={entityLineageHandler}
                    isLoading={isLineageLoading}
                    isNodeLoading={isNodeLoading}
                    isOwner={hasEditAccess()}
                    lineageLeafNodes={lineageLeafNodes}
                    loadNodeHandler={loadNodeHandler}
                    removeLineageHandler={removeLineageHandler}
                  />
                </div>
              )}
              {activeTab === 5 && !deleted && (
                <div>
                  <ManageTabComponent
                    allowDelete
                    currentTier={tier?.tagFQN}
                    currentUser={owner}
                    entityId={pipelineDetails.id}
                    entityName={pipelineDetails.name}
                    entityType={EntityType.PIPELINE}
                    hasEditAccess={hasEditAccess()}
                    manageSectionType={EntityType.PIPELINE}
                    onSave={onSettingsUpdate}
                  />
                </div>
              )}
              <div
                data-testid="observer-element"
                id="observer-element"
                ref={elementRef as RefObject<HTMLDivElement>}>
                {getLoader()}
              </div>
            </div>
          </div>
        </div>
      </div>
      {editTask && (
        <ModalWithMarkdownEditor
          header={`Edit Task: "${editTask.task.displayName}"`}
          placeholder="Enter Task Description"
          value={editTask.task.description || ''}
          onCancel={closeEditTaskModal}
          onSave={onTaskUpdate}
        />
      )}
      {threadLink ? (
        <ActivityThreadPanel
          createThread={createThread}
          deletePostHandler={deletePostHandler}
          open={Boolean(threadLink)}
          postFeedHandler={postFeedHandler}
          threadLink={threadLink}
          onCancel={onThreadPanelClose}
        />
      ) : null}
      {selectedField ? (
        <RequestDescriptionModal
          createThread={createThread}
          defaultValue={getDefaultValue(owner as EntityReference)}
          header="Request description"
          threadLink={getEntityFeedLink(
            EntityType.PIPELINE,
            pipelineFQN,
            selectedField
          )}
          onCancel={closeRequestModal}
        />
      ) : null}
    </PageContainer>
  );
};

export default PipelineDetails;
