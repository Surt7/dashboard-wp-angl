// Domain definitions for Machine fleet and Intellectual Property (IP / Franchise licenses)

export type MachineStatus = 'ONLINE' | 'IN_GAME' | 'MAINTENANCE' | 'OFFLINE' | 'PENDING';

// Core Machine entity representing a deployed physical pinball cabinet
export interface Machine {
  id: string;
  serialNumber: string;
  licenseName: string; // IP (Intellectual Property franchise, e.g. "Godzilla Premium")
  ipSlug: string; // License identifier slug, e.g. "godzilla"
  displayName: string; // Physical location or operator identifier (e.g. "Arcade Paris 11")
  status: MachineStatus;
  notes?: string | null;
  registeredAtUtc?: string;
  lastUpdated?: string | null;
  totalGamesPlayed?: number;
  lastPing?: string;
}

export interface FleetStats {
  total: number;
  online: number;
  offline: number;
  maintenance: number;
  pending: number;
}

export interface PagedResponse<T> {
  items: T[];
  pageSize: number;
  totalCount: number;
  pageNumber: number;
  totalPages?: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  lastId: string | null;
  stats?: FleetStats;
}

// Intellectual Property / Franchise License definition
export interface PinballLicense {
  id: string;
  name: string;
  manufacturer?: string;
  year?: number;
}

// Aggregated license summary for grouped category view
export interface LicenseSummary {
  id: string; // e.g. 'godzilla'
  name: string;
  manufacturer: string;
  year: number;
  totalUnits: number;
  onlineCount: number;
  inGameCount: number;
  maintenanceCount: number;
  offlineCount: number;
  pendingCount: number;
}

// API DTOs matching backend C# contracts
export interface ApiMachineDto {
  machineId: string;
  machineName: string; // IP Franchise Model Name (e.g. "Godzilla Premium")
  displayName: string; // Cabinet display / operator name
  machineStatus: ApiMachineStatus;
  machineNotes: string | null;
  registredAtUtc: string;
  lastUpdated: string | null;
  serialNumber: string;
}

export enum ApiMachineStatus {
  Active = 1,
  Revoked = 2,
  Inactive = 3,
  Maintenance = 4,
  PendingEnrollment = 5,
}

// Status mapper from API numeric enum to UI MachineStatus
export function mapStatusToUi(status: ApiMachineStatus): MachineStatus {
  switch (status) {
    case ApiMachineStatus.Active:
      return 'ONLINE';
    case ApiMachineStatus.Maintenance:
      return 'MAINTENANCE';
    case ApiMachineStatus.PendingEnrollment:
      return 'PENDING';
    case ApiMachineStatus.Inactive:
    case ApiMachineStatus.Revoked:
    default:
      return 'OFFLINE';
  }
}

// Aliases to preserve backward compatibility during component refactoring
export type MachineUnit = Machine;
export type PinballModel = LicenseSummary;
export type ModelSummary = {
  model: LicenseSummary;
  totalUnits: number;
  onlineCount: number;
  inGameCount: number;
  maintenanceCount: number;
  offlineCount: number;
};
