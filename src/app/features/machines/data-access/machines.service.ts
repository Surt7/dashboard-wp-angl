import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import {
  ApiMachineDto,
  Machine,
  MachineStatus,
  mapStatusToUi,
  LicenseSummary,
  ModelSummary,
  PinballModel,
  PagedResponse,
  FleetStats,
} from '../models/machine.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class MachineService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  // Reactive state signals
  #allMachines = signal<Machine[]>([]);
  #pagedMachines = signal<Machine[]>([]);
  #isLoading = signal<boolean>(false);
  #error = signal<string | null>(null);

  // Hybrid pagination signals
  #hasNextPage = signal<boolean>(false);
  #hasPreviousPage = signal<boolean>(false);
  #lastId = signal<string | null>(null);
  #totalCount = signal<number>(0);
  #pageNumber = signal<number>(1);
  #fleetStats = signal<FleetStats>({
    total: 0,
    online: 0,
    offline: 0,
    maintenance: 0,
    pending: 0,
  });

  // Active view toggle: 'LIST' (flat table of all machines) or 'IP' (grouped by Intellectual Property / License)
  readonly viewMode = signal<'LIST' | 'IP'>('LIST');

  // Readonly public signals
  readonly isLoading = this.#isLoading.asReadonly();
  readonly error = this.#error.asReadonly();
  readonly machines = this.#pagedMachines.asReadonly();
  readonly allMachines = this.#allMachines.asReadonly();
  readonly hasNextPage = this.#hasNextPage.asReadonly();
  readonly hasPreviousPage = this.#hasPreviousPage.asReadonly();
  readonly lastId = this.#lastId.asReadonly();
  readonly totalCount = this.#totalCount.asReadonly();
  readonly pageNumber = this.#pageNumber.asReadonly();
  readonly fleetStats = this.#fleetStats.asReadonly();

  // Backward compatibility alias for components using .units
  readonly units = this.#allMachines.asReadonly();

  /**
   * Helper to build LicenseSummary[] from an arbitrary list of machines
   */
  buildLicenseSummaries(machines: Machine[]): LicenseSummary[] {
    if (machines.length === 0) {
      return [];
    }

    const groups = new Map<string, Machine[]>();
    for (const machine of machines) {
      const key = machine.licenseName || 'Sans Licence';
      const existing = groups.get(key) ?? [];
      existing.push(machine);
      groups.set(key, existing);
    }

    const summaries: LicenseSummary[] = [];
    for (const [licenseName, units] of groups.entries()) {
      const slug = units[0]?.ipSlug || licenseName.toLowerCase().replace(/\s+/g, '-');
      summaries.push({
        id: slug,
        name: licenseName,
        manufacturer: 'WorldPinball',
        year: 2026,
        totalUnits: units.length,
        onlineCount: units.filter((u) => u.status === 'ONLINE').length,
        inGameCount: units.filter((u) => u.status === 'IN_GAME').length,
        maintenanceCount: units.filter((u) => u.status === 'MAINTENANCE').length,
        offlineCount: units.filter((u) => u.status === 'OFFLINE').length,
        pendingCount: units.filter((u) => u.status === 'PENDING').length,
      });
    }

    return summaries;
  }

  /**
   * Computed signal grouping full fleet by Intellectual Property (License)
   */
  readonly licenseSummaries = computed<LicenseSummary[]>(() => {
    return this.buildLicenseSummaries(this.#allMachines());
  });


  // Backward-compatible computed signal for existing components
  readonly modelSummaries = computed<ModelSummary[]>(() => {
    return this.licenseSummaries().map((lic) => ({
      model: lic,
      totalUnits: lic.totalUnits,
      onlineCount: lic.onlineCount,
      inGameCount: lic.inGameCount,
      maintenanceCount: lic.maintenanceCount,
      offlineCount: lic.offlineCount,
    }));
  });

  // Backward-compatible signal for model list
  readonly models = computed<PinballModel[]>(() => this.licenseSummaries());

  /**
   * Loads full fleet for global stats and license groups
   */
  loadFleetOverview(): void {
    this.http
      .get<ApiMachineDto[]>(API_ENDPOINTS.MACHINES.ROOT, { withCredentials: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dtos) => {
          this.#allMachines.set(dtos.map((dto) => this.mapDtoToMachine(dto)));
        },
        error: (err) => this.handleError(err, 'Failed to load fleet overview'),
      });
  }

  /**
   * Backward-compatible alias for loading all machines
   */
  loadUnitsFormApi(): void {
    this.loadFleetOverview();
  }
  /**
   * Loads machines using server-side hybrid keyset & offset pagination
   */
  loadPagedMachines(
    pageSize: number = 10,
    lastMachineId?: string | null,
    pageNumber?: number | null,
    search?: string,
  ): void {
    this.#isLoading.set(true);
    this.#error.set(null);
    let params = new HttpParams().set('pageSize', pageSize);
    if (lastMachineId) params = params.set('lastMachineId', lastMachineId);
    if (pageNumber && pageNumber > 1) params = params.set('page', pageNumber);
    if (search && search.trim()) params = params.set('search', search.trim());
    this.http
      .get<PagedResponse<ApiMachineDto>>(API_ENDPOINTS.MACHINES.PAGED, {
        params,
        withCredentials: true,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.handlePagedResponse(response),
        error: (err) => this.handleError(err, 'Failed to load machines'),
      });
  }

  addUnit(newMachine: Machine): void {
    this.#allMachines.update((currentList) => [newMachine, ...currentList]);
    this.#pagedMachines.update((currentList) => [newMachine, ...currentList]);
  }

  updateUnitStatus(unitId: string, newStatus: MachineStatus): void {
    this.#allMachines.update((currentList) =>
      currentList.map((m) => (m.id === unitId ? { ...m, status: newStatus } : m)),
    );
    this.#pagedMachines.update((currentList) =>
      currentList.map((m) => (m.id === unitId ? { ...m, status: newStatus } : m)),
    );
  }

  // --- Private Helpers ---

  private mapDtoToMachine(dto: ApiMachineDto): Machine {
    const licenseName = dto.machineName || 'Resident Evil Death Island';
    const ipSlug = licenseName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return {
      id: dto.machineId,
      serialNumber: dto.serialNumber,
      licenseName,
      ipSlug,
      displayName: dto.displayName || dto.serialNumber,
      status: mapStatusToUi(dto.machineStatus),
      notes: dto.machineNotes,
      registeredAtUtc: dto.registredAtUtc,
      lastUpdated: dto.lastUpdated,
      totalGamesPlayed: 0,
      lastPing: 'Direct',
    };
  }

  private handlePagedResponse(response: PagedResponse<ApiMachineDto>): void {
    const mapped = response.items.map((dto) => this.mapDtoToMachine(dto));
    this.#pagedMachines.set(mapped);
    this.#totalCount.set(response.totalCount);
    this.#pageNumber.set(response.pageNumber);
    this.#hasNextPage.set(response.hasNextPage);
    this.#hasPreviousPage.set(response.hasPreviousPage);
    this.#lastId.set(response.lastId);
    if (response.stats) {
      this.#fleetStats.set(response.stats);
    }
    this.#isLoading.set(false);
  }

  private handleError(err: unknown, userMessage: string): void {
    console.error('[MachineService] API Error:', err);
    this.#error.set(userMessage);
    this.#isLoading.set(false);
  }
}
