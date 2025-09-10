import React from 'react';
import { ICalEvent } from '../../../types/ical';
import { LegendColorSettings } from '../../../services';
import EventRow from '../EventRow';
import './EventContainer.scss';

interface EventContainerProps {
  events: ICalEvent[];
  month: number;
  year: number;
  legendColorSettings?: LegendColorSettings;
  className?: string;
}

const EventContainer: React.FC<EventContainerProps> = ({
  events,
  month,
  year,
  legendColorSettings,
  className = ''
}) => {
  // console.log('EventContainer - events:', events);
  // console.log('EventContainer - month:', month, 'year:', year);
  
  if (events.length === 0) {
    return null;
  }

  // Sort events by start date
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Show max 3 events per month to keep layout clean
  const maxEvents = 3;
  const eventsToShow = sortedEvents.slice(0, maxEvents);
  const remainingCount = sortedEvents.length - maxEvents;

  const calculateEventPosition = (event: ICalEvent) => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    
    // Calculate the first day of the month's position in the week (0 = Monday, 6 = Sunday)
    let firstDayOfWeek = monthStart.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convert to Monday = 0
    
    // Calculate event position within the month
    const eventStartDay = eventStart.getDate();
    const eventEndDay = eventEnd.getDate();
    
    // Calculate the actual position in the calendar grid (including empty days at start)
    const eventStartPosition = firstDayOfWeek + eventStartDay - 1;
    const eventEndPosition = firstDayOfWeek + eventEndDay - 1;
    
    // Account for the event-label-space (50px = ~2.3 days at 22px per day)
    // We need to subtract the equivalent days that the event-label-space takes up
    
    // Calculate offsets
    const startOffset = Math.max(0, eventStartPosition); // Adjust for event-label-space
    const span = eventEndDay - eventStartDay + 1; // Event duration in days
    const totalDaysInGrid = firstDayOfWeek + monthEnd.getDate(); // Total days in the month grid
    const endOffset = totalDaysInGrid - eventEndPosition - 1; // Days after event ends
    
    return {
      startOffset: Math.max(0, startOffset),
      span: Math.max(1, span),
      endOffset: Math.max(0, endOffset)
    };
  };

  return (
    <div className={`linear-month-events ${className}`}>
      {eventsToShow.map((event, index) => {
        const position = calculateEventPosition(event);
        return (
          <EventRow
            key={`${event.uid}-${index}`}
            event={event}
            startOffset={position.startOffset}
            span={position.span}
            endOffset={position.endOffset}
            legendColorSettings={legendColorSettings}
          />
        );
      })}
      
      {/* Show "..." if there are more events */}
      {remainingCount > 0 && (
        <div className="linear-event-more-row">
          <div className="event-more-label"></div>
          <div className="event-more-content">+{remainingCount} autres événements</div>
          <div className="event-more-total"></div>
        </div>
      )}
    </div>
  );
};

export default EventContainer;
