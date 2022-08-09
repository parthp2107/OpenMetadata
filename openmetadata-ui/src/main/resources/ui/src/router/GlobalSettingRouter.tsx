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

import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import {
  GlobalSettingOptions,
  GlobalSettingsMenuCategory,
} from '../constants/globalSettings.constants';
import TeamsPage from '../pages/teams/TeamsPage';
import { getSettingCategoryPath, getSettingPath } from '../utils/RouterUtils';
import withSuspenseFallback from './withSuspenseFallback';

const WebhooksPageV1 = withSuspenseFallback(
  React.lazy(() => import('../pages/WebhooksPage/WebhooksPageV1.component'))
);
const ServicesPage = withSuspenseFallback(
  React.lazy(() => import('../pages/services/ServicesPage'))
);
const BotsListPage = withSuspenseFallback(
  React.lazy(() => import('../pages/BotsListpage/BotsListpage.component'))
);
const CustomPropertiesPageV1 = withSuspenseFallback(
  React.lazy(
    () => import('../pages/CustomPropertiesPage/CustomPropertiesPageV1')
  )
);
const RolesPageComponent = withSuspenseFallback(
  React.lazy(() => import('../pages/RolesPage/RolesPage.component'))
);
const UserListPageV1 = withSuspenseFallback(
  React.lazy(() => import('../pages/UserListPage/UserListPageV1'))
);

const GlobalSettingRouter = () => {
  return (
    <Switch>
      <Route exact path={getSettingPath()}>
        <Redirect
          to={getSettingPath(
            GlobalSettingsMenuCategory.ACCESS,
            GlobalSettingOptions.TEAMS
          )}
        />
      </Route>
      <Route
        exact
        component={TeamsPage}
        path={getSettingPath(
          GlobalSettingsMenuCategory.ACCESS,
          GlobalSettingOptions.TEAMS
        )}
      />
      <Route
        exact
        component={TeamsPage}
        path={getSettingPath(
          GlobalSettingsMenuCategory.ACCESS,
          GlobalSettingOptions.TEAMS,
          true
        )}
      />
      <Route
        exact
        component={RolesPageComponent}
        path={getSettingPath(
          GlobalSettingsMenuCategory.ACCESS,
          GlobalSettingOptions.ROLES
        )}
      />
      <Route
        exact
        component={UserListPageV1}
        path={getSettingCategoryPath(GlobalSettingsMenuCategory.ACCESS)}
      />

      <Route
        exact
        component={WebhooksPageV1}
        path={getSettingPath(
          GlobalSettingsMenuCategory.INTEGRATIONS,
          GlobalSettingOptions.WEBHOOK
        )}
      />
      <Route
        exact
        component={BotsListPage}
        path={getSettingPath(
          GlobalSettingsMenuCategory.INTEGRATIONS,
          GlobalSettingOptions.BOTS
        )}
      />

      <Route
        exact
        component={ServicesPage}
        path={getSettingCategoryPath(GlobalSettingsMenuCategory.SERVICES)}
      />

      <Route
        exact
        component={CustomPropertiesPageV1}
        path={getSettingCategoryPath(
          GlobalSettingsMenuCategory.CUSTOM_ATTRIBUTES
        )}
      />
    </Switch>
  );
};

export default GlobalSettingRouter;
