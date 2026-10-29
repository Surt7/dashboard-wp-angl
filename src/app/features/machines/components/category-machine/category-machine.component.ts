import { Component, input, output } from '@angular/core';
import { Machine } from '../../models/machine.model';
import { Tag } from 'primeng/tag';
import { Table, TablePageEvent } from 'primeng/table';
import { StatusSeverityPipe } from '../../../../shared/pipe/prime-severity';

@Component({
  selector: 'category-machine',
  templateUrl: './category-machine.component.html',
  styleUrl: './category-machine.component.css',
  standalone: true,
  imports: [Tag, Table, StatusSeverityPipe],
})
export class CategoryMachineComponent {
  // Data input
  readonly machines = input.required<Machine[]>();

  // Hybrid pagination inputs
  readonly totalRecords = input<number>(0);
  readonly rows = input<number>(10);
  readonly first = input<number>(0);

  // Page change event (1-based page and rows)
  readonly pageChange = output<{ page: number; rows: number }>();

  onPage(event: TablePageEvent): void {
    const rows = event.rows ?? 10;
    const pageIndex = Math.floor((event.first ?? 0) / rows);
    this.pageChange.emit({
      page: pageIndex + 1,
      rows,
    });
  }
}
