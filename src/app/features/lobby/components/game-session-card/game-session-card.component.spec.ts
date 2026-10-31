import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameSessionCardComponent } from './game-session-card.component';
import { SessionLobbyResponse } from '../../models/loby.model';

describe('GameSessionCardComponent', () => {
  let component: GameSessionCardComponent;
  let fixture: ComponentFixture<GameSessionCardComponent>;

  // Mock data matching backend response
  const mockLobby: SessionLobbyResponse = {
    sessionId: '12345678-abcd-ef01-2345-6789abcdef01',
    sessionState: 'Created',
    slots: [
      { slotNumber: 1, isOccupied: true, guestInitials: 'MAX' },
      { slotNumber: 2, isOccupied: false },
      { slotNumber: 3, isOccupied: false },
      { slotNumber: 4, isOccupied: false },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSessionCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameSessionCardComponent);
    component = fixture.componentInstance;

    // Pass the required input signal
    fixture.componentRef.setInput('lobby', mockLobby);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the truncated sessionId and session state', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('12345678');
    expect(compiled.textContent).toContain('Created');
  });

  it('should render occupied slot with initials and unoccupied slot as Libre', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('MAX');
    expect(compiled.textContent).toContain('Libre');
  });
});
