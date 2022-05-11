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
  findAllByText,
  findByTestId,
  queryByTestId,
  render,
} from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { FeedFilter } from '../../enums/mydata.enum';
import Users from './Users.component';

const mockUserData = {
  id: 'd6764107-e8b4-4748-b256-c86fecc66064',
  name: 'xyz',
  displayName: 'XYZ',
  version: 0.1,
  updatedAt: 1648704499857,
  updatedBy: 'xyz',
  email: 'xyz@gmail.com',
  href: 'http://localhost:8585/api/v1/users/d6764107-e8b4-4748-b256-c86fecc66064',
  isAdmin: false,
  profile: {
    images: {
      image:
        'https://lh3.googleusercontent.com/a-/AOh14Gh8NPux8jEPIuyPWOxAB1od9fGN188Kcp5HeXgc=s96-c',
      image24:
        'https://lh3.googleusercontent.com/a-/AOh14Gh8NPux8jEPIuyPWOxAB1od9fGN188Kcp5HeXgc=s24-c',
      image32:
        'https://lh3.googleusercontent.com/a-/AOh14Gh8NPux8jEPIuyPWOxAB1od9fGN188Kcp5HeXgc=s32-c',
      image48:
        'https://lh3.googleusercontent.com/a-/AOh14Gh8NPux8jEPIuyPWOxAB1od9fGN188Kcp5HeXgc=s48-c',
      image72:
        'https://lh3.googleusercontent.com/a-/AOh14Gh8NPux8jEPIuyPWOxAB1od9fGN188Kcp5HeXgc=s72-c',
      image192:
        'https://lh3.googleusercontent.com/a-/AOh14Gh8NPux8jEPIuyPWOxAB1od9fGN188Kcp5HeXgc=s192-c',
      image512:
        'https://lh3.googleusercontent.com/a-/AOh14Gh8NPux8jEPIuyPWOxAB1od9fGN188Kcp5HeXgc=s512-c',
    },
  },
  teams: [
    {
      id: '3362fe18-05ad-4457-9632-84f22887dda6',
      type: 'team',
      name: 'Finance',
      description: 'This is Finance description.',
      displayName: 'Finance',
      deleted: false,
      href: 'http://localhost:8585/api/v1/teams/3362fe18-05ad-4457-9632-84f22887dda6',
    },
    {
      id: '5069ddd4-d47e-4b2c-a4c4-4c849b97b7f9',
      type: 'team',
      name: 'Data_Platform',
      description: 'This is Data_Platform description.',
      displayName: 'Data_Platform',
      deleted: false,
      href: 'http://localhost:8585/api/v1/teams/5069ddd4-d47e-4b2c-a4c4-4c849b97b7f9',
    },
    {
      id: '7182cc43-aebc-419d-9452-ddbe2fc4e640',
      type: 'team',
      name: 'Customer_Support',
      description: 'This is Customer_Support description.',
      displayName: 'Customer_Support',
      deleted: true,
      href: 'http://localhost:8585/api/v1/teams/7182cc43-aebc-419d-9452-ddbe2fc4e640',
    },
  ],
  owns: [],
  follows: [],
  deleted: false,
  roles: [
    {
      id: 'ce4df2a5-aaf5-4580-8556-254f42574aa7',
      type: 'role',
      name: 'DataConsumer',
      description:
        'Users with Data Consumer role use different data assets for their day to day work.',
      displayName: 'Data Consumer',
      deleted: false,
      href: 'http://localhost:8585/api/v1/roles/ce4df2a5-aaf5-4580-8556-254f42574aa7',
    },
  ],
  inheritedRoles: [
    {
      id: '3fa30148-72f6-4205-8cab-56696cc23440',
      type: 'role',
      name: 'DataConsumer',
      fullyQualifiedName: 'DataConsumer',
      description:
        'Users with Data Consumer role use different data assets for their day to day work.',
      displayName: 'Data Consumer',
      deleted: false,
      href: 'http://localhost:8585/api/v1/roles/3fa30148-72f6-4205-8cab-56696cc23440',
    },
  ],
};

jest.mock('../common/avatar/Avatar', () => {
  return jest.fn().mockReturnValue(<p>Avatar</p>);
});

jest.mock('../../pages/teams/UserCard', () => {
  return jest.fn().mockReturnValue(<p>UserCard</p>);
});

jest.mock('../common/TabsPane/TabsPane', () => {
  return jest.fn().mockReturnValue(<p data-testid="tabs">Tabs</p>);
});

jest.mock('../ActivityFeed/ActivityFeedList/ActivityFeedList.tsx', () => {
  return jest.fn().mockReturnValue(<p>FeedCards</p>);
});

jest.mock('../../axiosAPIs/teamsAPI', () => ({
  getTeams: jest.fn().mockImplementation(() =>
    Promise.resolve({
      data: {
        data: [],
      },
    })
  ),
}));

jest.mock('../common/description/Description', () => {
  return jest.fn().mockReturnValue(<p>Description</p>);
});

jest.mock('../EntityList/EntityList', () => {
  return jest.fn().mockReturnValue(<p>EntityList.component</p>);
});

const mockObserve = jest.fn();
const mockunObserve = jest.fn();

window.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: mockObserve,
  unobserve: mockunObserve,
}));

const mockFetchFeedHandler = jest.fn();
const feedFilterHandler = jest.fn();
const fetchData = jest.fn();
const postFeed = jest.fn();
const updateUserDetails = jest.fn();
const mockPaging = {
  after: 'MTY0OTIzNTQ3MzExMg==',
  total: 202,
};

const mockProp = {
  feedData: [],
  feedFilter: FeedFilter.ALL,
  feedFilterHandler: feedFilterHandler,
  fetchData: fetchData,
  fetchFeedHandler: mockFetchFeedHandler,
  isFeedLoading: false,
  paging: mockPaging,
  postFeedHandler: postFeed,
  isAdminUser: false,
  isLoggedinUser: false,
  isAuthDisabled: true,
  updateUserDetails,
};

describe('Test User Component', () => {
  it('Should render user component', async () => {
    const { container } = render(
      <Users userData={mockUserData} {...mockProp} />,
      {
        wrapper: MemoryRouter,
      }
    );

    const leftPanel = await findByTestId(container, 'left-panel');
    const rightPanel = await findByTestId(container, 'right-pannel');
    const EntityLists = await findAllByText(container, 'EntityList.component');

    expect(leftPanel).toBeInTheDocument();
    expect(rightPanel).toBeInTheDocument();
    expect(EntityLists.length).toBe(2);
  });

  it('Only admin can able to see tab for bot page', async () => {
    const { container } = render(
      <Users
        userData={{ ...mockUserData, isBot: true }}
        {...mockProp}
        isAdminUser
      />,
      {
        wrapper: MemoryRouter,
      }
    );

    const tabs = await findByTestId(container, 'tabs');
    const leftPanel = await findByTestId(container, 'left-panel');
    const rightPanel = await findByTestId(container, 'right-pannel');
    const EntityLists = await findAllByText(container, 'EntityList.component');

    expect(tabs).toBeInTheDocument();
    expect(leftPanel).toBeInTheDocument();
    expect(rightPanel).toBeInTheDocument();
    expect(EntityLists.length).toBe(2);
  });

  it('Tab should not visible to normal user', async () => {
    const { container } = render(
      <Users userData={mockUserData} {...mockProp} />,
      {
        wrapper: MemoryRouter,
      }
    );

    const tabs = queryByTestId(container, 'tabs');
    const leftPanel = await findByTestId(container, 'left-panel');

    expect(tabs).not.toBeInTheDocument();
    expect(leftPanel).toBeInTheDocument();
  });

  it('Should render non deleted teams', async () => {
    const { container } = render(
      <Users userData={mockUserData} {...mockProp} />,
      {
        wrapper: MemoryRouter,
      }
    );

    const teamFinance = await findByTestId(container, 'Finance');
    const teamDataPlatform = await findByTestId(container, 'Data_Platform');

    expect(teamFinance).toBeInTheDocument();
    expect(teamDataPlatform).toBeInTheDocument();
  });

  it('Should not render deleted teams', async () => {
    const { container } = render(
      <Users userData={mockUserData} {...mockProp} />,
      {
        wrapper: MemoryRouter,
      }
    );

    const deletedTeam = queryByTestId(container, 'Customer_Support');

    expect(deletedTeam).not.toBeInTheDocument();
  });

  it('Should create an observer if IntersectionObserver is available', async () => {
    const { container } = render(
      <Users userData={mockUserData} {...mockProp} />,
      {
        wrapper: MemoryRouter,
      }
    );

    const obServerElement = await findByTestId(container, 'observer-element');

    expect(obServerElement).toBeInTheDocument();

    expect(mockObserve).toHaveBeenCalled();
  });

  it('Should render inherited roles', async () => {
    const { container } = render(
      <Users userData={mockUserData} {...mockProp} />,
      {
        wrapper: MemoryRouter,
      }
    );
    const inheritedRoles = await findByTestId(container, 'inherited-roles');

    expect(inheritedRoles).toBeInTheDocument();
  });
});
