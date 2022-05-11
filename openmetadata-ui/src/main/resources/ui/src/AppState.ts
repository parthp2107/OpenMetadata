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

import { isEmpty, isNil } from 'lodash';
import { action, makeAutoObservable } from 'mobx';
import { ClientAuth, NewUser, UserPermissions } from 'Models';
import { CurrentTourPageType } from './enums/tour.enum';
import { Role } from './generated/entity/teams/role';
import {
  EntityReference as UserTeams,
  User,
} from './generated/entity/teams/user';

class AppState {
  users: Array<User> = [];
  newUser: NewUser = {} as NewUser;
  authDisabled = false;
  authProvider: ClientAuth = {
    authority: '',
    // eslint-disable-next-line @typescript-eslint/camelcase
    client_id: '',
    signingIn: false,
  };
  nonSecureUserDetails: User = {} as User;
  userDetails: User = {} as User;
  userTeams: Array<UserTeams> = [];
  userRoles: Array<Role> = [];
  userPermissions: UserPermissions = {} as UserPermissions;

  inPageSearchText = '';
  explorePageTab = 'tables';

  isTourOpen = false;
  currentTourPage: CurrentTourPageType = CurrentTourPageType.MY_DATA_PAGE;
  activeTabforTourDatasetPage = 1;

  constructor() {
    makeAutoObservable(this, {
      updateUserDetails: action,
      updateUserTeam: action,
      updateNewUser: action,
      updateAuthProvide: action,
      updateAuthState: action,
      updateUserRole: action,
      updateUsers: action,
      updateUserPermissions: action,
      updateExplorePageTab: action,
      getCurrentUserDetails: action,
      getAllUsers: action,
      getAllTeams: action,
      getAllRoles: action,
      getAllPermissions: action,
    });
  }

  addUser(data: User) {
    this.users = [...this.users, data];
  }
  updateUsers(data: Array<User>) {
    this.users = data;
    this.nonSecureUserDetails = data[0];
  }
  updateUserTeam(data: Array<UserTeams>) {
    this.userTeams = data;
  }
  updateUserRole(data: Array<Role>) {
    this.userRoles = data;
  }
  updateUserDetails(data: User) {
    this.userDetails = data;
    this.nonSecureUserDetails = data;
  }
  updateNewUser(data: NewUser) {
    this.newUser = data;
  }
  updateAuthProvide(clientAuth: ClientAuth) {
    this.authProvider = clientAuth;
  }
  updateAuthState(state: boolean) {
    this.authDisabled = state;
  }
  updateUserPermissions(permissions: UserPermissions) {
    this.userPermissions = permissions;
  }
  updateExplorePageTab(tab: string) {
    this.explorePageTab = tab;
  }

  getCurrentUserDetails() {
    if (!isEmpty(this.userDetails) && !isNil(this.userDetails)) {
      return this.userDetails;
    } else if (
      !isEmpty(this.nonSecureUserDetails) &&
      !isNil(this.nonSecureUserDetails)
    ) {
      return this.nonSecureUserDetails;
    } else {
      return;
    }
  }

  getAllUsers() {
    return this.users;
  }

  getAllTeams() {
    return this.userTeams;
  }

  getAllRoles() {
    return this.userRoles;
  }

  getAllPermissions() {
    return this.userPermissions;
  }
}

export default new AppState();
