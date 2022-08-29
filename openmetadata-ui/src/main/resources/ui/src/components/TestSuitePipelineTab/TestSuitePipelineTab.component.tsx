import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Space, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { AxiosError } from 'axios';
import cronstrue from 'cronstrue';
import { capitalize } from 'lodash';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import {
  deleteIngestionPipelineById,
  deployIngestionPipelineById,
  enableDisableIngestionPipelineById,
  triggerIngestionPipelineById,
} from '../../axiosAPIs/ingestionPipelineAPI';
import { fetchAirflowConfig } from '../../axiosAPIs/miscAPI';
import { TITLE_FOR_NON_ADMIN_ACTION } from '../../constants/constants';
import { IngestionPipeline } from '../../generated/entity/services/ingestionPipelines/ingestionPipeline';
import jsonData from '../../jsons/en';
import SVGIcons, { Icons } from '../../utils/SvgUtils';
import { showErrorToast, showSuccessToast } from '../../utils/ToastUtils';
import NonAdminAction from '../common/non-admin-action/NonAdminAction';
import PopOver from '../common/popover/PopOver';
import Loader from '../Loader/Loader';
import EntityDeleteModal from '../Modals/EntityDeleteModal/EntityDeleteModal';
import IngestionLogsModal from '../Modals/IngestionLogsModal/IngestionLogsModal';
import KillIngestionModal from '../Modals/KillIngestionPipelineModal/KillIngestionPipelineModal';
import TestCaseCommonTabContainer from '../TestCaseCommonTabContainer/TestCaseCommonTabContainer.component';

const TestSuitePipelineTab = ({
  getAllIngestionWorkflows,
  testSuitePipelines,
}: {
  getAllIngestionWorkflows: (paging?: string) => void;
  testSuitePipelines: IngestionPipeline[]; // type to be change after api update
}) => {
  const [airFlowEndPoint, setAirFlowEndPoint] = useState('');
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<IngestionPipeline>();
  const [isKillModalOpen, setIsKillModalOpen] = useState<boolean>(false);
  const [deleteSelection, setDeleteSelection] = useState({
    id: '',
    name: '',
    state: '',
  });
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [currTriggerId, setCurrTriggerId] = useState({ id: '', state: '' });
  const [currDeployId, setCurrDeployId] = useState({ id: '', state: '' });

  const handleCancelConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
    setDeleteSelection({
      id: '',
      name: '',
      state: '',
    });
  };

  const handleDelete = async (id: string, displayName: string) => {
    setDeleteSelection({ id, name: displayName, state: 'waiting' });
    try {
      await deleteIngestionPipelineById(id);
      setDeleteSelection({ id, name: displayName, state: 'success' });
      getAllIngestionWorkflows();
    } catch (error) {
      showErrorToast(
        error as AxiosError,
        `${jsonData['api-error-messages']['delete-ingestion-error']} ${displayName}`
      );
    } finally {
      handleCancelConfirmationModal();
    }
  };

  const fetchAirFlowEndPoint = async () => {
    try {
      const response = await fetchAirflowConfig();
      setAirFlowEndPoint(response.apiEndpoint);
    } catch {
      setAirFlowEndPoint('');
    }
  };

  const handleEnableDisableIngestion = async (id: string) => {
    try {
      await enableDisableIngestionPipelineById(id);
      getAllIngestionWorkflows();
    } catch (error) {
      showErrorToast(
        error as AxiosError,
        jsonData['api-error-messages']['unexpected-server-response']
      );
    }
  };

  const separator = (
    <span className="tw-inline-block tw-text-gray-400 tw-self-center">|</span>
  );

  const getStatuses = (ingestion: IngestionPipeline) => {
    const lastFiveIngestions = ingestion.pipelineStatuses
      ?.sort((a, b) => {
        // Turn your strings into millis, and then subtract them
        // to get a value that is either negative, positive, or zero.
        const date1 = new Date(a.startDate || '');
        const date2 = new Date(b.startDate || '');

        return date1.getTime() - date2.getTime();
      })
      .slice(Math.max(ingestion.pipelineStatuses.length - 5, 0));

    return lastFiveIngestions?.map((r, i) => {
      const status =
        i === lastFiveIngestions.length - 1 ? (
          <p
            className={`tw-h-5 tw-w-16 tw-rounded-sm tw-bg-status-${r.state} tw-mr-1 tw-px-1 tw-text-white tw-text-center`}
            key={i}>
            {capitalize(r.state)}
          </p>
        ) : (
          <p
            className={`tw-w-4 tw-h-5 tw-rounded-sm tw-bg-status-${r.state} tw-mr-1`}
            key={i}
          />
        );

      return r?.endDate || r?.startDate || r?.timestamp ? (
        <PopOver
          html={
            <div className="tw-text-left">
              {r.timestamp ? (
                <p>Execution Date: {new Date(r.timestamp).toUTCString()}</p>
              ) : null}
              {r.startDate ? (
                <p>Start Date: {new Date(r.startDate).toUTCString()}</p>
              ) : null}
              {r.endDate ? (
                <p>End Date: {new Date(r.endDate).toUTCString()}</p>
              ) : null}
            </div>
          }
          key={i}
          position="bottom"
          theme="light"
          trigger="mouseenter">
          {status}
        </PopOver>
      ) : (
        status
      );
    });
  };

  const confirmDelete = (id: string, name: string) => {
    setDeleteSelection({
      id,
      name,
      state: '',
    });
    setIsConfirmationModalOpen(true);
  };

  const handleTriggerIngestion = async (id: string, displayName: string) => {
    setCurrTriggerId({ id, state: 'waiting' });

    try {
      await triggerIngestionPipelineById(id);
      setCurrTriggerId({ id, state: 'success' });
      setTimeout(() => {
        setCurrTriggerId({ id: '', state: '' });
        showSuccessToast('Pipeline triggered successfully');
      }, 1500);
      getAllIngestionWorkflows();
    } catch (error) {
      showErrorToast(
        `${jsonData['api-error-messages']['triggering-ingestion-error']} ${displayName}`
      );
      setCurrTriggerId({ id: '', state: '' });
    }
  };

  const handleDeployIngestion = async (id: string) => {
    setCurrDeployId({ id, state: 'waiting' });

    try {
      await deployIngestionPipelineById(id);
      setCurrDeployId({ id, state: 'success' });
      setTimeout(() => setCurrDeployId({ id: '', state: '' }), 1500);
    } catch (error) {
      setCurrDeployId({ id: '', state: '' });
      showErrorToast(
        error as AxiosError,
        jsonData['api-error-messages']['update-ingestion-error']
      );
    }
  };

  const getTriggerDeployButton = (ingestion: IngestionPipeline) => {
    if (ingestion.deployed) {
      return (
        <Button
          data-testid="run"
          type="link"
          onClick={() =>
            handleTriggerIngestion(ingestion.id as string, ingestion.name)
          }>
          {currTriggerId.id === ingestion.id ? (
            currTriggerId.state === 'success' ? (
              <FontAwesomeIcon icon="check" />
            ) : (
              <Loader size="small" type="default" />
            )
          ) : (
            'Run'
          )}
        </Button>
      );
    } else {
      return (
        <Button
          data-testid="deploy"
          type="link"
          onClick={() => handleDeployIngestion(ingestion.id as string)}>
          {currDeployId.id === ingestion.id ? (
            currDeployId.state === 'success' ? (
              <FontAwesomeIcon icon="check" />
            ) : (
              <Loader size="small" type="default" />
            )
          ) : (
            'Deploy'
          )}
        </Button>
      );
    }
  };

  const pipelineColumns = useMemo(() => {
    const column: ColumnsType<IngestionPipeline> = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (name: string) => {
          return (
            <>
              <NonAdminAction
                position="bottom"
                title={TITLE_FOR_NON_ADMIN_ACTION}>
                <a
                  className="link-text tw-mr-2"
                  data-testid="airflow-tree-view"
                  href={`${airFlowEndPoint}`}
                  rel="noopener noreferrer"
                  target="_blank">
                  {name}
                  <SVGIcons
                    alt="external-link"
                    className="tw-align-middle tw-ml-1"
                    icon={Icons.EXTERNAL_LINK}
                    width="16px"
                  />
                </a>
              </NonAdminAction>
            </>
          );
        },
      },
      {
        title: 'Type',
        dataIndex: 'pipelineType',
        key: 'pipelineType',
      },
      {
        title: 'Schedule',
        dataIndex: 'airflowConfig',
        key: 'airflowEndpoint',
        render: (_, record) => {
          return (
            <>
              {record?.airflowConfig.scheduleInterval ? (
                <PopOver
                  html={
                    <div>
                      {cronstrue.toString(
                        record.airflowConfig.scheduleInterval || '',
                        {
                          use24HourTimeFormat: true,
                          verbose: true,
                        }
                      )}
                    </div>
                  }
                  position="bottom"
                  theme="light"
                  trigger="mouseenter">
                  <span>{record.airflowConfig.scheduleInterval ?? '--'}</span>
                </PopOver>
              ) : (
                <span>--</span>
              )}
            </>
          );
        },
      },
      {
        title: 'Recent Runs',
        dataIndex: 'pipelineStatuses',
        key: 'recentRuns',
        render: (_, record) => <Space>{getStatuses(record)}</Space>, // use getIngestionStatuses from commonUtils
      },
      {
        title: 'Actions',
        dataIndex: 'actions',
        key: 'actions',
        render: (_, record) => {
          return (
            <>
              <NonAdminAction
                position="bottom"
                title={TITLE_FOR_NON_ADMIN_ACTION}>
                <div className="tw-flex">
                  {record.enabled ? (
                    <Fragment>
                      {getTriggerDeployButton(record)}
                      {separator}
                      <Button
                        data-testid="pause"
                        type="link"
                        onClick={() =>
                          handleEnableDisableIngestion(record.id || '')
                        }>
                        Pause
                      </Button>
                    </Fragment>
                  ) : (
                    <Button
                      data-testid="unpause"
                      type="link"
                      onClick={() =>
                        handleEnableDisableIngestion(record.id || '')
                      }>
                      Unpause
                    </Button>
                  )}
                  {separator}
                  <Button data-testid="edit" type="link">
                    Edit
                  </Button>
                  {separator}
                  <Button
                    data-testid="delete"
                    type="link"
                    onClick={() =>
                      confirmDelete(record.id as string, record.name)
                    }>
                    {deleteSelection.id === record.id ? (
                      deleteSelection.state === 'success' ? (
                        <FontAwesomeIcon icon="check" />
                      ) : (
                        <Loader size="small" type="default" />
                      )
                    ) : (
                      'Delete'
                    )}
                  </Button>
                  {separator}
                  <Button
                    data-testid="kill"
                    type="link"
                    onClick={() => {
                      setIsKillModalOpen(true);
                      setSelectedPipeline(record);
                    }}>
                    Kill
                  </Button>
                  {separator}
                  <Button
                    data-testid="logs"
                    type="link"
                    onClick={() => {
                      setIsLogsModalOpen(true);
                      setSelectedPipeline(record);
                    }}>
                    Logs
                  </Button>
                </div>
              </NonAdminAction>
              {isLogsModalOpen &&
                selectedPipeline &&
                record.id === selectedPipeline?.id && (
                  <IngestionLogsModal
                    isModalOpen={isLogsModalOpen}
                    pipelinName={selectedPipeline.name}
                    pipelineId={selectedPipeline.id as string}
                    pipelineType={selectedPipeline.pipelineType}
                    onClose={() => {
                      setIsLogsModalOpen(false);
                      setSelectedPipeline(undefined);
                    }}
                  />
                )}
              {isKillModalOpen &&
                selectedPipeline &&
                record.id === selectedPipeline?.id && (
                  <KillIngestionModal
                    isModalOpen={isKillModalOpen}
                    pipelinName={selectedPipeline.name}
                    pipelineId={selectedPipeline.id as string}
                    onClose={() => {
                      setIsKillModalOpen(false);
                      setSelectedPipeline(undefined);
                    }}
                    onIngestionWorkflowsUpdate={getAllIngestionWorkflows}
                  />
                )}
            </>
          );
        },
      },
    ];

    return column;
  }, [airFlowEndPoint, isKillModalOpen, isLogsModalOpen, selectedPipeline]);

  useEffect(() => {
    getAllIngestionWorkflows();
    fetchAirFlowEndPoint();
  }, []);

  return (
    <TestCaseCommonTabContainer buttonName="Add Ingestion">
      <Col span={24}>
        <Table
          columns={pipelineColumns}
          dataSource={testSuitePipelines}
          pagination={false}
          size="small"
        />
        {isConfirmationModalOpen && (
          <EntityDeleteModal
            entityName={deleteSelection.name}
            entityType="ingestion"
            loadingState={deleteSelection.state}
            onCancel={handleCancelConfirmationModal}
            onConfirm={() =>
              handleDelete(deleteSelection.id, deleteSelection.name)
            }
          />
        )}
      </Col>
    </TestCaseCommonTabContainer>
  );
};

export default TestSuitePipelineTab;
