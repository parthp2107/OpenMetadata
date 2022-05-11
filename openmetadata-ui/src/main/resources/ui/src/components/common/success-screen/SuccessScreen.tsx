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

import { isUndefined } from 'lodash';
import React from 'react';
import { FormSubmitType } from '../../../enums/form.enum';
import SVGIcons, { Icons } from '../../../utils/SvgUtils';
import { Button } from '../../buttons/Button/Button';

type SuccessScreenProps = {
  name: string;
  successMessage?: JSX.Element;
  showIngestionButton: boolean;
  showDeployButton?: boolean;
  state: FormSubmitType;
  handleIngestionClick?: () => void;
  handleViewServiceClick: () => void;
  handleDeployClick?: () => void;
};

const SuccessScreen = ({
  name,
  showIngestionButton,
  showDeployButton = false,
  handleIngestionClick,
  handleViewServiceClick,
  handleDeployClick,
  successMessage,
}: SuccessScreenProps) => {
  return (
    <div
      className="tw-flex tw-flex-col tw-items-center tw-mt-14 tw-mb-24"
      data-testid="success-screen-container">
      <div className="tw-mb-7">
        <SVGIcons
          alt="success"
          className="tw-w-10 tw-h-10"
          data-testid="success-icon"
          icon={Icons.CIRCLE_CHECKBOX}
        />
      </div>
      <p className="tw-mb-7" data-testid="success-line">
        {isUndefined(successMessage) ? (
          <span>
            <span className="tw-mr-1 tw-font-semibold">&quot;{name}&quot;</span>
            <span>has been created successfully</span>
          </span>
        ) : (
          successMessage
        )}
      </p>

      <div>
        <Button
          data-testid="view-service-button"
          size="regular"
          theme="primary"
          variant="outlined"
          onClick={handleViewServiceClick}>
          <span>View Service</span>
        </Button>

        {showIngestionButton && (
          <Button
            className="tw-ml-3.5"
            data-testid="add-ingestion-button"
            size="regular"
            theme="primary"
            variant="contained"
            onClick={handleIngestionClick}>
            <span>Add Ingestion</span>
          </Button>
        )}

        {showDeployButton && (
          <Button
            className="tw-ml-3.5"
            data-testid="add-ingestion-button"
            size="regular"
            theme="primary"
            variant="contained"
            onClick={handleDeployClick}>
            <span>Deploy</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default SuccessScreen;
