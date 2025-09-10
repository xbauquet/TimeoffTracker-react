import React from 'react';
import { ICalEvent } from '../../../types/ical';
import { LegendColorSettings } from '../../../services';
import './EventRow.scss';

interface EventRowProps {
  event: ICalEvent;
  startOffset: number;
  span: number;
  endOffset: number;
  legendColorSettings?: LegendColorSettings;
  className?: string;
}

const EventRow: React.FC<EventRowProps> = ({
  event,
  startOffset,
  span,
  endOffset,
  legendColorSettings,
  className = ''
}) => {
  return (
    <div className={`linear-event-row ${className}`}>
      {/* Empty space for month label alignment */}
      <div className="event-label-space"></div>
      
      {/* Days container */}
      <div className="event-days-container">
        {/* Empty days before the event starts */}
        {Array.from({ length: startOffset }, (_, i) => (
          <div key={`empty-before-${i}`} className="event-empty-day"></div>
        ))}
        
        {/* Event content with assigned color */}
        <div 
          className="event-content-simple"
          style={{
            width: `${span * 22}px`, // 20px per day + 2px margin
            minWidth: `${span * 22}px`,
            maxWidth: `${span * 22}px`,
            backgroundColor: legendColorSettings?.icalEvents || event.color || '#c2185b',
            borderColor: legendColorSettings?.icalEvents || event.color || '#c2185b'
          }}
        >
          {event.summary}
        </div>
        
        {/* Empty days after the event ends */}
        {Array.from({ length: endOffset }, (_, i) => (
          <div key={`empty-after-${i}`} className="event-empty-day"></div>
        ))}
      </div>
      
      {/* Empty space for month total alignment */}
      <div className="event-total-space"></div>
    </div>
  );
};

export default EventRow;
