import { environment } from '../../../environments/environment';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: (returnUrl?: string) =>
      returnUrl
        ? `${environment.bffBaseUrl}/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`
        : `${environment.bffBaseUrl}/api/auth/login`,
    CURRENT_USER: `${environment.bffBaseUrl}/api/auth/user`,
    LOGOUT: `${environment.bffBaseUrl}/api/auth/logout`,
  },
  MACHINES: {
    ROOT: `${environment.bffBaseUrl}/api/v1/admin/machines`,
    PAGED: `${environment.bffBaseUrl}/api/v1/admin/machines/paged`,
    BY_ID: (id: string) => `${environment.bffBaseUrl}/api/v1/admin/machines/${id}`,
    DASHBOARD: (id: string) => `${environment.bffBaseUrl}/api/v1/admin/machines/${id}/dashboard`,
    PROVISION: `${environment.bffBaseUrl}/api/v1/admin/machines/provision`,
  },
  STREAMING_ACCESS: {
    GRANTS: `${environment.bffBaseUrl}/api/v1/admin/streaming-access/grants`,
    REVOKE: (grantId: string) =>
      `${environment.bffBaseUrl}/api/v1/admin/streaming-access/grants/${grantId}/revoke`,
  },
  HUBS: {
    LOBBY: `${environment.bffBaseUrl}/hubs/lobby`,
  },
} as const;
