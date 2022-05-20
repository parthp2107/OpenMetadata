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

import { findByTestId, render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import UserDataCard from './UserDataCard';

const mockItem = {
  displayName: 'description1',
  name: 'name1',
  id: 'id1',
  email: 'string@email.com',
  isActiveUser: true,
  profilePhoto: '',
  teamCount: 'Cloud_Infra',
};

const mockSelect = jest.fn();
const mockDelete = jest.fn();

jest.mock('../../authentication/auth-provider/AuthProvider', () => {
  return {
    useAuthContext: jest.fn(() => ({
      isAuthDisabled: false,
      isAuthenticated: true,
      isProtectedRoute: jest.fn().mockReturnValue(true),
      isTourRoute: jest.fn().mockReturnValue(false),
      onLogoutHandler: jest.fn(),
    })),
  };
});

jest.mock('../../components/common/ProfilePicture/ProfilePicture', () => {
  return jest
    .fn()
    .mockReturnValue(<p data-testid="profile-picture">ProfilePicture</p>);
});

jest.mock('../../utils/SvgUtils', () => {
  return {
    __esModule: true,
    default: jest.fn().mockReturnValue(<p data-testid="svg-icon">SVGIcons</p>),
    Icons: {
      DELETE: 'delete',
    },
  };
});

describe('Test UserDataCard component', () => {
  it('Component should render', async () => {
    const { container } = render(
      <UserDataCard
        item={mockItem}
        onClick={mockSelect}
        onDelete={mockDelete}
      />,
      {
        wrapper: MemoryRouter,
      }
    );

    const cardContainer = await findByTestId(container, 'user-card-container');
    const avatar = await findByTestId(container, 'profile-picture');

    expect(avatar).toBeInTheDocument();
    expect(cardContainer).toBeInTheDocument();
  });

  it('Data should render', async () => {
    const { container } = render(
      <UserDataCard
        item={mockItem}
        onClick={mockSelect}
        onDelete={mockDelete}
      />,
      {
        wrapper: MemoryRouter,
      }
    );

    expect(await findByTestId(container, 'data-container')).toBeInTheDocument();
  });
});
