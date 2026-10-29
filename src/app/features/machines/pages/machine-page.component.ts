import { Component, inject, computed, input, Signal, signal } from '@angular/core';
import { MachineService } from '../data-access/machines.service';
import { TooltipModule } from 'primeng/tooltip';
import { MachineStatus, PinballModel } from '../models/machine.model';
import { ReactiveFormsModule } from '@angular/forms';
import { AddMachineFormComponent } from '../components/add-machine/add-machine-form.component';
import { MachineHeaderComponent } from '../components/machine-header/machine-header.component';
import { AdvancedFilters, FilterComponent } from '../../../shared/components/filter/filter.component';
import { CategoryLicenceComponent } from '../components/category-licence/category-licence.component';
import { CategoryMachineComponent } from '../components/category-machine/category-machine.component';

@Component({
  selector: 'app-machines-page',
  standalone: true,
  templateUrl: './machine-page.component.html',
  styleUrl: './machine-page.component.css',
  imports: [
    TooltipModule,
    ReactiveFormsModule,
    AddMachineFormComponent,
    MachineHeaderComponent,
    FilterComponent,
    CategoryLicenceComponent,
    CategoryMachineComponent,
  ],
})
export class MachinesPageComponent {
  private readonly machineService = inject(MachineService);

  readonly modelId = input<string>();

  // INIT
  ngOnInit(): void {
    this.machineService.loadFleetOverview();
    this.machineService.loadPagedMachines();
  }

  protected readonly selectedModel: Signal<PinballModel | null> = computed(() => {
    const id = this.modelId();
    if (!id) return null;
    return this.machineService.models().find((m) => m.id === id) ?? null;
  });

  protected readonly viewMode = this.machineService.viewMode;
  protected readonly machines = this.machineService.machines;
  protected readonly fleetStats = this.machineService.fleetStats;
  protected readonly availableLicenses = computed(() =>
    this.machineService.licenseSummaries().map((l) => l.name),
  );
  protected readonly activeFilters = signal<AdvancedFilters>({
    statuses: [],
    licenseName: null,
  });

  protected readonly totalRecords = this.machineService.totalCount;
  protected readonly rows = signal<number>(10);
  protected readonly first = signal<number>(0);
  protected readonly searchQuery = signal<string>('');

  protected onViewModeChange(mode: 'LIST' | 'IP'): void {
    this.machineService.viewMode.set(mode);
  }

  protected onFiltersChange(filters: AdvancedFilters): void {
    this.activeFilters.set(filters);
    this.first.set(0);
  }

  protected readonly displayedMachines = computed(() => {
    const raw = this.machineService.machines();
    const filters = this.activeFilters();

    return raw.filter((m) => {
      if (filters.statuses.length > 0 && !filters.statuses.includes(m.status)) {
        return false;
      }
      if (filters.licenseName && m.licenseName !== filters.licenseName) {
        return false;
      }
      return true;
    });
  });

  /**
   * Filtered license cards when searching or applying advanced filters
   */
  protected readonly filteredModelSummaries = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filters = this.activeFilters();
    let all = this.machineService.allMachines();

    if (filters.statuses.length > 0) {
      all = all.filter((m) => filters.statuses.includes(m.status));
    }
    if (filters.licenseName) {
      all = all.filter((m) => m.licenseName === filters.licenseName);
    }

    if (query) {
      all = all.filter(
        (m) =>
          m.serialNumber.toLowerCase().includes(query) ||
          m.displayName.toLowerCase().includes(query) ||
          (m.licenseName && m.licenseName.toLowerCase().includes(query)) ||
          (m.ipSlug && m.ipSlug.toLowerCase().includes(query)),
      );
    }

    const summaries = this.machineService.buildLicenseSummaries(all);
    return summaries.map((lic) => ({
      model: lic,
      totalUnits: lic.totalUnits,
      onlineCount: lic.onlineCount,
      inGameCount: lic.inGameCount,
      maintenanceCount: lic.maintenanceCount,
      offlineCount: lic.offlineCount,
    }));
  });

  protected readonly selectedModelUnits = computed(() => {
    const currentModel = this.selectedModel();
    if (!currentModel) return [];
    const query = this.searchQuery().toLowerCase().trim();
    let units = this.machineService
      .allMachines()
      .filter((m) => m.ipSlug === currentModel.id || m.licenseName === currentModel.name);

    if (query) {
      units = units.filter(
        (m) =>
          m.serialNumber.toLowerCase().includes(query) ||
          m.displayName.toLowerCase().includes(query) ||
          (m.licenseName && m.licenseName.toLowerCase().includes(query)),
      );
    }
    return units;
  });

  protected changeStatus(unitId: string, nextStatus: MachineStatus): void {
    this.machineService.updateUnitStatus(unitId, nextStatus);
  }

  protected onSearch(query: string): void {
    this.searchQuery.set(query);
    this.first.set(0);
    this.machineService.loadPagedMachines(this.rows(), null, 1, query);
  }

  protected onPageChange(event: { page: number; rows: number }): void {
    this.rows.set(event.rows);
    this.first.set((event.page - 1) * event.rows);
    this.machineService.loadPagedMachines(event.rows, null, event.page, this.searchQuery());
  }

  protected readonly filteredMachines = computed(() => {
    const query = this.searchQuery();
    const all = this.machineService.machines();

    if (!query) return all;
    return all.filter(
      (m) =>
        m.serialNumber.toLowerCase().includes(query) ||
        m.displayName.toLowerCase().includes(query) ||
        (m.licenseName && m.licenseName.toLowerCase().includes(query)),
    );
  });

  protected onAddUnit(values: {
    serialNumber: string;
    ipAddress: string;
    location: string;
    status: MachineStatus;
  }): void {
    const currentModel = this.selectedModel();
    if (!currentModel) return;

    this.machineService.addUnit({
      id: `u-${Date.now()}`,
      serialNumber: values.serialNumber,
      licenseName: currentModel.name,
      ipSlug: currentModel.id,
      displayName: values.location,
      status: values.status,
      totalGamesPlayed: 0,
      lastPing: "À l'instant",
    });
  }
}
