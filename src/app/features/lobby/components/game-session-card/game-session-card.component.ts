import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionLobbyResponse } from '../../models/loby.model';
import {
  SessionBadgeColorPipe,
  SessionBorderColorPipe,
  SlotStatusClassPipe,
  SlotStatusLabelPipe,
} from '../../pipes/session-state-color.pipe';

@Component({
  selector: 'app-game-session-card',
  templateUrl: './game-session-card.component.html',
  styleUrl: './game-session-card.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    SessionBorderColorPipe,
    SessionBadgeColorPipe,
    SlotStatusClassPipe,
    SlotStatusLabelPipe,
  ],
})
export class GameSessionCardComponent {
  readonly lobby = input.required<SessionLobbyResponse>();
}
