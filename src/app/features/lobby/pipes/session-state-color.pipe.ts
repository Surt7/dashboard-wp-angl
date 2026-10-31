import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sessionBorderColor',
  standalone: true,
})
export class SessionBorderColorPipe implements PipeTransform {
  transform(state: string): string {
    // Return CSS border class based on state:
    // Joined -> green, Started -> blue, Created/Pending/Searching -> amber, Ended/Cancelled -> gray
    switch (state) {
      case 'Joined':
      case 'MatchFound':
        return 'border-emerald-500 shadow-md shadow-emerald-500/10';
      case 'Started':
      case 'InGame':
        return 'border-blue-500 shadow-md shadow-blue-500/10';
      case 'SearchingPlayer':
      case 'Pending':
      case 'Created':
        return 'border-amber-500 shadow-md shadow-amber-500/10';
      case 'Paused':
        return 'border-sky-400 shadow-md shadow-sky-400/10';
      case 'Ended':
      case 'Cancelled':
      case 'Aborted':
        return 'border-surface-700 opacity-60';
      default:
        return 'border-surface-700';
    }
  }
}

@Pipe({
  name: 'sessionBadgeColor',
  standalone: true,
})
export class SessionBadgeColorPipe implements PipeTransform {
  transform(state: string): string {
    // Return CSS badge style based on session state:
    // Joined -> green, Started -> blue, Created/Pending/Searching -> amber, Ended/Cancelled -> gray
    switch (state) {
      case 'Joined':
      case 'MatchFound':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40';
      case 'Started':
      case 'InGame':
        return 'bg-blue-950/40 text-blue-400 border-blue-500/40';
      case 'SearchingPlayer':
      case 'Pending':
      case 'Created':
        return 'bg-amber-950/40 text-amber-400 border-amber-500/40';
      case 'Paused':
        return 'bg-sky-950/40 text-sky-400 border-sky-400/40';
      case 'Ended':
      case 'Cancelled':
      case 'Aborted':
        return 'bg-surface-900 text-surface-400 border-surface-700';
      default:
        return 'bg-surface-800 text-surface-300 border-surface-700';
    }
  }
}

@Pipe({
  name: 'slotStatusLabel',
  standalone: true,
})
export class SlotStatusLabelPipe implements PipeTransform {
  transform(slot: { isOccupied: boolean; status?: string | number; guestInitials?: string; userId?: string }): string {
    // 1. If occupied, display player initials or fallback
    if (slot.isOccupied) {
      return slot.guestInitials || slot.userId || 'Joueur';
    }

    // 2. If backend explicitly flagged slot as Locked (string or enum value 2)
    if (slot.status === 'Locked' || slot.status === 2) {
      return 'Fermé';
    }

    // 3. Otherwise slot is open/available
    return 'Libre';
  }
}

@Pipe({
  name: 'slotStatusClass',
  standalone: true,
})
export class SlotStatusClassPipe implements PipeTransform {
  transform(slot: { isOccupied: boolean; status?: string | number }, sessionState: string): string {
    // 1. If slot is occupied
    if (slot.isOccupied) {
      // If game is actively started/in-game, show blue highlight
      if (sessionState === 'Started' || sessionState === 'InGame') {
        return 'border-blue-500 bg-blue-950/30 text-blue-400';
      }
      // If joined / pre-game
      if (sessionState === 'Joined' || sessionState === 'MatchFound') {
        return 'border-emerald-500 bg-emerald-950/30 text-emerald-400';
      }
      // If ended, show calm neutral
      if (sessionState === 'Ended' || sessionState === 'Cancelled' || sessionState === 'Aborted') {
        return 'border-surface-700 bg-surface-900 text-surface-300 opacity-75';
      }
      return 'border-emerald-500 bg-emerald-950/20 text-emerald-400';
    }

    // 2. If slot is locked/closed (backend status Locked or enum 2)
    if (slot.status === 'Locked' || slot.status === 2) {
      return 'border-surface-800/50 bg-surface-950/60 text-surface-600 opacity-50';
    }

    // 3. Open / Free slot waiting for players (visible lighter neutral)
    return 'border-surface-700 bg-surface-800/40 text-surface-300';
  }
}
