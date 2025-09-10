import React from 'react';
import './DayHeader.scss';

const DayHeader: React.FC = () => {
  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <div className="dh-day-hearder">
      <div className="dh-day-hearder-label">
        {/* Empty label for header */}
      </div>
        <div className="dh-day-hearder-days">
          {Array.from({ length: 6 }, (_, i) => (
            <React.Fragment key={`month-${i}`}>
              {Array.from({ length: 7 }, (_, dayIndex) => (
                <div key={`${i}-${dayIndex}`} className="dh-day-hearder-day-name">
                  {dayNames[dayIndex]}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
    </div>
  );
};

export default DayHeader;
