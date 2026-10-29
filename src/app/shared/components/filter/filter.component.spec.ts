import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterComponent, AdvancedFilters } from './filter.component';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should start with no active filters', () => {
    expect((component as any).hasActiveFilters()).toBe(false);
    expect((component as any).activeFilterCount()).toBe(0);
  });

  it('should emit filtersChange when status changes and update active filters', () => {
    let emittedFilters: AdvancedFilters | undefined;
    component.filtersChange.subscribe((f) => (emittedFilters = f));

    component.onStatusChange(['ONLINE']);

    expect((component as any).hasActiveFilters()).toBe(true);
    expect((component as any).activeFilterCount()).toBe(1);
    expect(emittedFilters).toEqual({
      statuses: ['ONLINE'],
      licenseName: null,
    });
  });

  it('should emit filtersChange when license is selected', () => {
    let emittedFilters: AdvancedFilters | undefined;
    component.filtersChange.subscribe((f) => (emittedFilters = f));

    component.selectLicense('Star Wars');

    expect((component as any).hasActiveFilters()).toBe(true);
    expect((component as any).activeFilterCount()).toBe(1);
    expect(emittedFilters).toEqual({
      statuses: [],
      licenseName: 'Star Wars',
    });
  });

  it('should reset all filters and emit empty filters when resetFilters() is called', () => {
    let emittedFilters: AdvancedFilters | undefined;
    component.filtersChange.subscribe((f) => (emittedFilters = f));

    component.onStatusChange(['ONLINE', 'MAINTENANCE']);
    component.selectLicense('Marvel');
    expect((component as any).activeFilterCount()).toBe(3);

    component.resetFilters();

    expect((component as any).hasActiveFilters()).toBe(false);
    expect((component as any).activeFilterCount()).toBe(0);
    expect(emittedFilters).toEqual({
      statuses: [],
      licenseName: null,
    });
  });

  it('should emit viewModeChange when toggleView is called', () => {
    let emittedMode: 'LIST' | 'IP' | undefined;
    component.viewModeChange.subscribe((m) => (emittedMode = m));

    component.toggleView('IP');
    expect(emittedMode).toBe('IP');
  });

  it('should clear input value, reset searchQuery, and emit empty string when clearSearch is called', () => {
    let emittedSearch: string | undefined;
    component.search.subscribe((s) => (emittedSearch = s));

    const inputEl = document.createElement('input');
    inputEl.value = 'Medieval';
    (component as any).searchQuery.set('Medieval');

    component.clearSearch(inputEl);

    expect(inputEl.value).toBe('');
    expect((component as any).searchQuery()).toBe('');
    expect(emittedSearch).toBe('');
  });
});
