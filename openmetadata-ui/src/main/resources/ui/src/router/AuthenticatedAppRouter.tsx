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

import { isEmpty } from 'lodash';
import React, { FunctionComponent } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import AppState from '../AppState';
import { ROUTES } from '../constants/constants';
import AddGlossaryPage from '../pages/AddGlossary/AddGlossaryPage.component';
import AddGlossaryTermPage from '../pages/AddGlossaryTermPage/AddGlossaryTermPage.component';
import AddIngestionPage from '../pages/AddIngestionPage/AddIngestionPage.component';
import AddServicePage from '../pages/AddServicePage/AddServicePage.component';
import AddWebhookPage from '../pages/AddWebhookPage/AddWebhookPage.component';
import BotsListPage from '../pages/BotsListpage/BotsListpage.component';
import BotsPage from '../pages/BotsPage/BotsPage.component';
import CreateUserPage from '../pages/CreateUserPage/CreateUserPage.component';
import DashboardDetailsPage from '../pages/DashboardDetailsPage/DashboardDetailsPage.component';
import DatabaseDetails from '../pages/database-details/index';
import DatabaseSchemaPageComponent from '../pages/DatabaseSchemaPage/DatabaseSchemaPage.component';
import DatasetDetailsPage from '../pages/DatasetDetailsPage/DatasetDetailsPage.component';
import EditIngestionPage from '../pages/EditIngestionPage/EditIngestionPage.component';
import EditWebhookPage from '../pages/EditWebhookPage/EditWebhookPage.component';
import EntityVersionPage from '../pages/EntityVersionPage/EntityVersionPage.component';
import ExplorePage from '../pages/explore/ExplorePage.component';
import GlossaryPageV1 from '../pages/GlossaryPage/GlossaryPageV1.component';
import MyDataPage from '../pages/MyDataPage/MyDataPage.component';
import PipelineDetailsPage from '../pages/PipelineDetails/PipelineDetailsPage.component';
import RolesPage from '../pages/RolesPage/RolesPage.component';
import ServicePage from '../pages/service';
import ServicesPage from '../pages/services';
import SignupPage from '../pages/signup';
import SwaggerPage from '../pages/swagger';
import TagsPage from '../pages/tags';
import TeamsAndUsersPage from '../pages/TeamsAndUsersPage/TeamsAndUsersPage.component';
import TopicDetailsPage from '../pages/TopicDetails/TopicDetailsPage.component';
import TourPageComponent from '../pages/tour-page/TourPage.component';
import UserPage from '../pages/UserPage/UserPage.component';
import WebhooksPage from '../pages/WebhooksPage/WebhooksPage.component';
import AdminProtectedRoute from './AdminProtectedRoute';
const AuthenticatedAppRouter: FunctionComponent = () => {
  return (
    <Switch>
      <Route exact component={MyDataPage} path={ROUTES.MY_DATA} />
      <Route exact component={TourPageComponent} path={ROUTES.TOUR} />
      <Route exact component={ExplorePage} path={ROUTES.EXPLORE} />
      <Route component={ExplorePage} path={ROUTES.EXPLORE_WITH_SEARCH} />
      <Route component={ExplorePage} path={ROUTES.EXPLORE_WITH_TAB} />
      <Route
        exact
        component={TeamsAndUsersPage}
        path={ROUTES.TEAMS_AND_USERS}
      />
      <Route
        exact
        component={TeamsAndUsersPage}
        path={ROUTES.TEAMS_AND_USERS_DETAILS}
      />
      <Route exact component={ServicesPage} path={ROUTES.SERVICES} />
      <Route exact component={ServicesPage} path={ROUTES.SERVICES_WITH_TAB} />
      <Route exact component={ServicePage} path={ROUTES.SERVICE} />
      <Route exact component={ServicePage} path={ROUTES.SERVICE_WITH_TAB} />
      <Route exact component={AddServicePage} path={ROUTES.ADD_SERVICE} />
      <AdminProtectedRoute
        exact
        component={AddIngestionPage}
        path={ROUTES.ADD_INGESTION}
      />
      <AdminProtectedRoute
        exact
        component={EditIngestionPage}
        path={ROUTES.EDIT_INGESTION}
      />
      <Route exact component={SignupPage} path={ROUTES.SIGNUP}>
        {!isEmpty(AppState.userDetails) && <Redirect to={ROUTES.HOME} />}
      </Route>
      <Route exact component={SwaggerPage} path={ROUTES.SWAGGER} />
      <Route exact component={TagsPage} path={ROUTES.TAGS} />
      <Route exact component={DatabaseDetails} path={ROUTES.DATABASE_DETAILS} />
      <Route
        exact
        component={DatabaseDetails}
        path={ROUTES.DATABASE_DETAILS_WITH_TAB}
      />
      <Route
        exact
        component={DatabaseSchemaPageComponent}
        path={ROUTES.SCHEMA_DETAILS}
      />
      <Route
        exact
        component={DatabaseSchemaPageComponent}
        path={ROUTES.SCHEMA_DETAILS_WITH_TAB}
      />
      <Route exact component={DatasetDetailsPage} path={ROUTES.TABLE_DETAILS} />
      <Route
        exact
        component={DatasetDetailsPage}
        path={ROUTES.TABLE_DETAILS_WITH_TAB}
      />
      <Route exact component={TopicDetailsPage} path={ROUTES.TOPIC_DETAILS} />
      <Route
        exact
        component={TopicDetailsPage}
        path={ROUTES.TOPIC_DETAILS_WITH_TAB}
      />
      <Route
        exact
        component={DashboardDetailsPage}
        path={ROUTES.DASHBOARD_DETAILS}
      />
      <Route
        exact
        component={DashboardDetailsPage}
        path={ROUTES.DASHBOARD_DETAILS_WITH_TAB}
      />
      <Route
        exact
        component={PipelineDetailsPage}
        path={ROUTES.PIPELINE_DETAILS}
      />
      <Route
        exact
        component={PipelineDetailsPage}
        path={ROUTES.PIPELINE_DETAILS_WITH_TAB}
      />
      <Route exact component={EntityVersionPage} path={ROUTES.ENTITY_VERSION} />
      <Route exact component={WebhooksPage} path={ROUTES.WEBHOOKS} />
      <Route exact component={EditWebhookPage} path={ROUTES.EDIT_WEBHOOK} />
      <Route exact component={GlossaryPageV1} path={ROUTES.GLOSSARY} />
      <Route exact component={GlossaryPageV1} path={ROUTES.GLOSSARY_DETAILS} />
      <Route exact component={GlossaryPageV1} path={ROUTES.GLOSSARY_TERMS} />
      <Route exact component={UserPage} path={ROUTES.USER_PROFILE} />
      <AdminProtectedRoute
        exact
        component={AddGlossaryPage}
        path={ROUTES.ADD_GLOSSARY}
      />
      <AdminProtectedRoute
        exact
        component={AddGlossaryTermPage}
        path={ROUTES.ADD_GLOSSARY_TERMS_CHILD}
      />
      <AdminProtectedRoute
        exact
        component={AddGlossaryTermPage}
        path={ROUTES.ADD_GLOSSARY_TERMS}
      />
      <AdminProtectedRoute
        exact
        component={AddWebhookPage}
        path={ROUTES.ADD_WEBHOOK}
      />
      <AdminProtectedRoute exact component={RolesPage} path={ROUTES.ROLES} />
      <AdminProtectedRoute
        exact
        component={CreateUserPage}
        path={ROUTES.CREATE_USER}
      />
      <AdminProtectedRoute exact component={BotsListPage} path={ROUTES.BOTS} />
      <AdminProtectedRoute
        exact
        component={BotsPage}
        path={ROUTES.BOTS_PROFILE}
      />

      <Redirect to={ROUTES.NOT_FOUND} />
    </Switch>
  );
};

export default AuthenticatedAppRouter;
