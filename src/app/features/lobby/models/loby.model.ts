export type GameSlotStatus = 'Open' | 'Occupied' | 'Locked' | number;

export interface PlayerSlotInfo {
  slotNumber: number;
  isOccupied: boolean;
  status?: GameSlotStatus;
  userId?: string;
  guestInitials?: string;
}

export interface SessionLobbyResponse {
  sessionId: string;
  sessionState: string;
  slots: PlayerSlotInfo[];
}
