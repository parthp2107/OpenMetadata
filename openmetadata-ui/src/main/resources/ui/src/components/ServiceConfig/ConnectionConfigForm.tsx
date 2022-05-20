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

import { ISubmitEvent } from '@rjsf/core';
import { cloneDeep, isNil } from 'lodash';
import { LoadingState } from 'Models';
import React, { Fragment, FunctionComponent, useMemo } from 'react';
import { TestConnection } from '../../axiosAPIs/serviceAPI';
import { ServiceCategory } from '../../enums/service.enum';
import {
  DashboardConnection,
  DashboardService,
} from '../../generated/entity/services/dashboardService';
import {
  DatabaseConnection,
  DatabaseService,
} from '../../generated/entity/services/databaseService';
import {
  MessagingConnection,
  MessagingService,
} from '../../generated/entity/services/messagingService';
import { PipelineService } from '../../generated/entity/services/pipelineService';
import { ConfigData } from '../../interface/service.interface';
import jsonData from '../../jsons/en';
import { getDashboardConfig } from '../../utils/DashboardServiceUtils';
import { getDatabaseConfig } from '../../utils/DatabaseServiceUtils';
import { formatFormDataForSubmit } from '../../utils/JSONSchemaFormUtils';
import { getMessagingConfig } from '../../utils/MessagingServiceUtils';
import { getPipelineConfig } from '../../utils/PipelineServiceUtils';
import {
  getTestConnectionType,
  shouldTestConnection,
} from '../../utils/ServiceUtils';
import { showErrorToast } from '../../utils/ToastUtils';
import FormBuilder from '../common/FormBuilder/FormBuilder';

interface Props {
  data: DatabaseService | MessagingService | DashboardService | PipelineService;
  okText?: string;
  cancelText?: string;
  serviceType: string;
  serviceCategory: ServiceCategory;
  status: LoadingState;
  onCancel?: () => void;
  onSave: (data: ISubmitEvent<ConfigData>) => void;
}

const ConnectionConfigForm: FunctionComponent<Props> = ({
  data,
  okText = 'Save',
  cancelText = 'Cancel',
  serviceType,
  serviceCategory,
  status,
  onCancel,
  onSave,
}: Props) => {
  const allowTestConn = useMemo(() => {
    return shouldTestConnection(serviceType, serviceCategory);
  }, [serviceType, serviceCategory]);

  const config = !isNil(data)
    ? /* eslint-disable-next-line no-prototype-builtins */
      data.hasOwnProperty('connection')
      ? ((data as DatabaseService | MessagingService | DashboardService)
          .connection.config as ConfigData)
      : ({ pipelineUrl: (data as PipelineService).pipelineUrl } as ConfigData)
    : ({} as ConfigData);

  const handleSave = (data: ISubmitEvent<ConfigData>) => {
    const updatedFormData = formatFormDataForSubmit(data.formData);
    onSave({ ...data, formData: updatedFormData });
  };

  const handleTestConnection = (formData: ConfigData) => {
    const updatedFormData = formatFormDataForSubmit(formData);

    return new Promise<void>((resolve, reject) => {
      TestConnection(updatedFormData, getTestConnectionType(serviceCategory))
        .then((res) => {
          // This api only responds with status 200 on success
          // No data sent on api success
          if (res.status === 200) {
            resolve();
          } else {
            throw jsonData['api-error-messages']['unexpected-server-response'];
          }
        })
        .catch((err) => {
          showErrorToast(
            err,
            jsonData['api-error-messages']['test-connection-error']
          );
          reject(err);
        });
    });
  };

  const getDatabaseFields = () => {
    let connSch = {
      schema: {},
      uiSchema: {},
    };

    const validConfig = cloneDeep(config || {});

    for (const [key, value] of Object.entries(validConfig)) {
      if (isNil(value)) {
        delete validConfig[key as keyof ConfigData];
      }
    }

    switch (serviceCategory) {
      case ServiceCategory.DATABASE_SERVICES: {
        connSch = getDatabaseConfig(
          validConfig as DatabaseConnection['config']
        );

        break;
      }
      case ServiceCategory.MESSAGING_SERVICES: {
        connSch = getMessagingConfig(
          validConfig as MessagingConnection['config']
        );

        break;
      }
      case ServiceCategory.DASHBOARD_SERVICES: {
        connSch = getDashboardConfig(
          validConfig as DashboardConnection['config']
        );

        break;
      }
      case ServiceCategory.PIPELINE_SERVICES: {
        connSch = getPipelineConfig();

        break;
      }
    }

    return (
      <FormBuilder
        cancelText={cancelText}
        formData={validConfig}
        okText={okText}
        schema={connSch.schema}
        status={status}
        uiSchema={connSch.uiSchema}
        onCancel={onCancel}
        onSubmit={handleSave}
        onTestConnection={allowTestConn ? handleTestConnection : undefined}
      />
    );
  };

  return <Fragment>{getDatabaseFields()}</Fragment>;
};

export default ConnectionConfigForm;
