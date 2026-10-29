import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModelSummary } from '../../models/machine.model';

@Component({
  selector: 'category-licence-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './category-licence.component.html',
  styleUrl: './category-licence.component.css',
})
export class CategoryLicenceComponent {
  // Data input
  readonly modelSummaries = input.required<ModelSummary[]>();

  // Search state input
  readonly isSearching = input<boolean>(false);
}
