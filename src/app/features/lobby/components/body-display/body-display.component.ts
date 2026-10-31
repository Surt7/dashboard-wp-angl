import { Component, inject } from '@angular/core';
import { LobbyService } from '../../data-access/lobby.service';
import { GameSessionCardComponent } from '../game-session-card/game-session-card.component';

@Component({
  selector: 'app-body-display',
  standalone: true,
  styleUrl: './body-display.component.css',
  templateUrl: './body-display.component.html',
  imports: [GameSessionCardComponent],
})
export class BodyDisplayComponent {
  protected lobbyService = inject(LobbyService);
}

export default BodyDisplayComponent;
