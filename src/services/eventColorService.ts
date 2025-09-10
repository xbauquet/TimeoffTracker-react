import { ICalEvent } from '../types/ical';

// Import the event color from variables
// Note: We can't directly import SCSS variables in TS, so we'll keep the value in sync
const EVENT_COLOR = '#c2185b'; // Dark pink - matches $event-color in _variables.scss

export class EventColorService {
  /**
   * Assigns the standard dark pink color to an event
   */
  static assignColor(event: ICalEvent): ICalEvent {
    return {
      ...event,
      color: EVENT_COLOR
    };
  }

  /**
   * Assigns the standard color to all events in a list
   */
  static assignColorsToEvents(events: ICalEvent[]): ICalEvent[] {
    return events.map(event => this.assignColor(event));
  }

  /**
   * Gets the event color for the legend
   */
  static getEventColor(): string {
    return EVENT_COLOR;
  }

  /**
   * Gets event legend info (shows that all events use the same color)
   */
  static getEventLegend(events: ICalEvent[]): Array<{ summary: string; color: string }> {
    if (events.length === 0) {
      return [];
    }

    // Return a single legend item showing the event color
    return [{
      summary: 'Événements iCal',
      color: EVENT_COLOR
    }];
  }
}
