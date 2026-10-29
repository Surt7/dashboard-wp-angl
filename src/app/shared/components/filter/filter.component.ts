import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { Checkbox } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { FieldsetCardComponent } from '../fieldset-card/fieldset-card.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface AdvancedFilters {
  statuses: string[];
  licenseName: string | null;
}

export interface FilterFleetStats {
  total: number;
  online: number;
  offline: number;
  maintenance: number;
  pending: number;
}

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DividerModule,
    FieldsetCardComponent,
    ButtonModule,
    Drawer,
    Checkbox,
    TooltipModule,
    FormsModule,
  ],
})
export class FilterComponent {
  // Inputs (purely presentation-oriented, zero coupled services)
  readonly viewMode = input<'LIST' | 'IP'>('LIST');
  readonly stats = input<FilterFleetStats>({
    total: 0,
    online: 0,
    offline: 0,
    maintenance: 0,
    pending: 0,
  });
  readonly availableLicenses = input<string[]>([]);

  // Outputs
  readonly search = output<string>();
  readonly viewModeChange = output<'LIST' | 'IP'>();
  readonly filtersChange = output<AdvancedFilters>();

  // Drawer & Filter state as signals
  protected readonly isDrawerOpen = signal<boolean>(false);
  protected readonly selectedStatuses = signal<string[]>([]);
  protected readonly selectedLicense = signal<string | null>(null);
  protected readonly searchQuery = signal<string>('');

  protected readonly hasActiveFilters = computed(
    () => this.selectedStatuses().length > 0 || this.selectedLicense() !== null,
  );
  protected readonly activeFilterCount = computed(() => {
    let count = this.selectedStatuses().length;
    if (this.selectedLicense()) count++;
    return count;
  });

  protected readonly availableStatuses = [
    { value: 'ONLINE', label: 'En ligne (Online)', dotClass: 'bg-emerald-500' },
    { value: 'MAINTENANCE', label: 'En maintenance', dotClass: 'bg-amber-500' },
    { value: 'OFFLINE', label: 'Hors ligne (Offline)', dotClass: 'bg-surface-400' },
    { value: 'PENDING', label: 'À enrôler (Pending)', dotClass: 'bg-gray-500' },
  ];

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        map((query) => this.sanitizeQuery(query)),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((cleanValue) => {
        this.search.emit(cleanValue);
      });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.searchSubject.next(input.value);
  }

  onImmediateSearch(rawValue: string): void {
    this.searchQuery.set(rawValue);
    this.search.emit(this.sanitizeQuery(rawValue));
  }

  clearSearch(inputEl: HTMLInputElement): void {
    inputEl.value = '';
    this.searchQuery.set('');
    this.searchSubject.next('');
    this.search.emit('');
  }

  toggleView(mode: 'LIST' | 'IP'): void {
    this.viewModeChange.emit(mode);
  }

  openDrawer(): void {
    this.isDrawerOpen.set(true);
  }

  selectLicense(lic: string | null): void {
    this.selectedLicense.set(lic);
    this.emitFilters();
  }

  onStatusChange(statuses: string[]): void {
    this.selectedStatuses.set(statuses);
    this.emitFilters();
  }

  resetFilters(): void {
    this.selectedStatuses.set([]);
    this.selectedLicense.set(null);
    this.emitFilters();
  }

  private emitFilters(): void {
    this.filtersChange.emit({
      statuses: [...this.selectedStatuses()],
      licenseName: this.selectedLicense(),
    });
  }

  private sanitizeQuery(raw: string): string {
    if (!raw) return '';
    return raw
      .replace(/[\x00-\x1F\x7F]/g, '')
      .slice(0, 50)
      .trim()
      .toLowerCase();
  }
}
