import {
  AddClientCredentialPage,
  ClientCredentialListPage,
} from '@features/client-credentials';
import {
  AddContainerStackPage,
  ContainerStackDetailPage,
  ContainerStackListPage,
  DeployContainerStackPage,
  EditContainerStackPage,
} from '@features/container-stacks';
import {
  AddDevicePage,
  DeployDeviceAiModelPage,
  DeployDevicePage,
  DeviceAiModelEditionDetailPage,
  DeviceDetailPage,
  DeviceListPage,
  DeviceStackDetailPage,
  EditDevicePage,
} from '@features/devices';
import { HomePage } from '@features/home';
import {
  AddMemberPage,
  EditMemberPage,
  MemberListPage,
} from '@features/members';
import {
  AddOrganizationPage,
  EditOrganizationPage,
  OrganizationListPage,
} from '@features/organizations';
import {
  AddRegistryPage,
  EditRegistryPage,
  RegistryDetailPage,
  RegistryListPage,
} from '@features/registries';
import { APP_ROUTE_PATTERN, getAppBasePath } from '@shared/lib/appRoute';
import { getTenant } from '@shared/lib/baseUrl';
import { SnackbarProvider } from 'notistack';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import MainLayout from '@/app/layouts/MainLayout';
import { AppInitializer, ProtectedRoute } from '@/app/providers/AuthGuards';
import { breadcrumbs } from '@/app/router/breadcrumbs';
import {
  AddModelPage,
  AIModelListPage,
  DeployEditionPage,
  EditEditionPage,
  EditionDetailPage,
  EditModelPage,
} from '@/features/ai-models';

const tenantPath = getTenant();

const childrenRoutes = [
  {
    index: true,
    element: <HomePage />,
  },
  {
    path: 'organizations',
    children: [
      {
        path: '',
        element: <OrganizationListPage />,
        handle: { breadcrumb: [breadcrumbs.home] },
      },
      {
        path: 'add',
        element: <AddOrganizationPage />,
        handle: {
          breadcrumb: [breadcrumbs.home, breadcrumbs.organizations.list],
        },
      },
      {
        path: ':organizationId/edit',
        element: <EditOrganizationPage />,
        handle: {
          breadcrumb: [breadcrumbs.home, breadcrumbs.organizations.list],
        },
      },
    ],
  },
  {
    path: 'members',
    children: [
      {
        path: '',
        element: <MemberListPage />,
        handle: { breadcrumb: [breadcrumbs.home] },
      },
      {
        path: 'add',
        element: <AddMemberPage />,
        handle: { breadcrumb: [breadcrumbs.home, breadcrumbs.members.list] },
      },
      {
        path: 'edit',
        element: <EditMemberPage />,
        handle: { breadcrumb: [breadcrumbs.home, breadcrumbs.members.list] },
      },
    ],
  },
  {
    path: 'devices',
    children: [
      {
        path: '',
        element: <DeviceListPage />,
        handle: { breadcrumb: [breadcrumbs.home] },
      },
      {
        path: 'add',
        element: <AddDevicePage />,
        handle: { breadcrumb: [breadcrumbs.home, breadcrumbs.devices.list] },
      },
      {
        path: ':deviceId/edit',
        element: <EditDevicePage />,
        handle: { breadcrumb: [breadcrumbs.home, breadcrumbs.devices.list] },
      },
      {
        path: ':deviceId/:tab',
        element: <DeviceDetailPage />,
        handle: { breadcrumb: [breadcrumbs.home, breadcrumbs.devices.list] },
      },
      {
        path: ':deviceId/container-stacks/deploy',
        element: <DeployDevicePage />,
        handle: {
          breadcrumb: [
            breadcrumbs.home,
            breadcrumbs.devices.list,
            breadcrumbs.devices.containerStacks,
          ],
        },
      },
      {
        path: ':deviceId/ai-model/deploy',
        element: <DeployDeviceAiModelPage />,
        handle: {
          breadcrumb: [
            breadcrumbs.home,
            breadcrumbs.devices.list,
            breadcrumbs.devices.aiModels,
          ],
        },
      },
      {
        path: ':deviceId/ai-model/:deviceDeploymentId',
        element: <DeviceAiModelEditionDetailPage />,
        handle: {
          breadcrumb: [
            breadcrumbs.home,
            breadcrumbs.devices.list,
            breadcrumbs.devices.aiModels,
          ],
        },
      },
      {
        path: ':deviceId/container-stacks/:stackConfigId/:stackRevisionId',
        element: <DeviceStackDetailPage />,
        handle: {
          breadcrumb: [
            breadcrumbs.home,
            breadcrumbs.devices.list,
            breadcrumbs.devices.containerStacks,
          ],
        },
      },
    ],
  },
  {
    path: 'container-stacks',
    children: [
      {
        path: '',
        element: <ContainerStackListPage />,
        handle: { breadcrumb: [breadcrumbs.home] },
      },
      {
        path: 'add',
        element: <AddContainerStackPage />,
        handle: { breadcrumb: [breadcrumbs.home, breadcrumbs.stacks.list] },
      },
      {
        path: ':stackConfigId/:stackRevisionId/edit',
        element: <EditContainerStackPage />,
        handle: { breadcrumb: [breadcrumbs.home, breadcrumbs.stacks.list] },
      },
      {
        path: ':stackConfigId/:stackRevisionId/:tab',
        element: <ContainerStackDetailPage />,
        handle: { breadcrumb: [breadcrumbs.home, breadcrumbs.stacks.list] },
      },

      {
        path: ':stackConfigId/:stackRevisionId/deploy',
        element: <DeployContainerStackPage />,
        handle: {
          breadcrumb: [
            breadcrumbs.home,
            breadcrumbs.stacks.list,
            breadcrumbs.stacks.deployments,
          ],
        },
      },
    ],
  },
  {
    path: 'registries',
    children: [
      {
        path: '',
        element: <RegistryListPage />,
        handle: { breadcrumb: [breadcrumbs.home] },
      },
      {
        path: 'add',
        element: <AddRegistryPage />,
        handle: {
          breadcrumb: [breadcrumbs.home, breadcrumbs.registries.list],
        },
      },
      {
        path: ':registryId/edit',
        element: <EditRegistryPage />,
        handle: {
          breadcrumb: [breadcrumbs.home, breadcrumbs.registries.list],
        },
      },
      {
        path: ':registryId',
        element: <RegistryDetailPage />,
        handle: {
          breadcrumb: [breadcrumbs.home, breadcrumbs.registries.list],
        },
      },
    ],
  },
  {
    path: 'client-credentials',
    children: [
      {
        path: '',
        element: <ClientCredentialListPage />,
        handle: { breadcrumb: [breadcrumbs.home] },
      },
      {
        path: 'add',
        element: <AddClientCredentialPage />,
        handle: {
          breadcrumb: [breadcrumbs.home, breadcrumbs.clientCredentials.list],
        },
      },
    ],
  },
  {
    path: 'ai-models',
    children: [
      {
        path: '',
        element: <AIModelListPage />,
        handle: { breadcrumb: [breadcrumbs.home] },
      },
      {
        path: 'add',
        element: <AddModelPage />,
        handle: { breadcrumb: [breadcrumbs.home, breadcrumbs.aiModels.list] },
      },
      {
        path: ':modelId/edit',
        element: <EditModelPage />,
        handle: { breadcrumb: [breadcrumbs.home, breadcrumbs.aiModels.list] },
      },
      {
        path: ':modelId/editions/:edition/edit',
        element: <EditEditionPage />,
        handle: { breadcrumb: [breadcrumbs.home, breadcrumbs.aiModels.list] },
      },
      {
        path: ':modelId/editions/:edition/:tab',
        element: <EditionDetailPage />,
        handle: { breadcrumb: [breadcrumbs.home, breadcrumbs.aiModels.list] },
      },
      {
        path: ':modelId/editions/:edition/deploy',
        element: <DeployEditionPage />,
        handle: {
          breadcrumb: [
            breadcrumbs.home,
            breadcrumbs.aiModels.list,
            breadcrumbs.aiModels.deployments,
          ],
        },
      },
    ],
  },
];

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={getAppBasePath(tenantPath)} replace />,
  },
  {
    path: `/${tenantPath}`,
    element: <Navigate to={getAppBasePath(tenantPath)} replace />,
  },
  {
    element: (
      <SnackbarProvider>
        <ProtectedRoute />
      </SnackbarProvider>
    ),
    children: [
      {
        element: <AppInitializer />,
        children: [
          {
            path: APP_ROUTE_PATTERN,
            element: <MainLayout />,
            children: childrenRoutes,
          },
        ],
      },
    ],
  },
]);
