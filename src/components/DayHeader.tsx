import React from 'react';

const DayHeader: React.FC = () => {
  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <div className="linear-month">
      <div className="linear-month-label">
        {/* Empty label for header */}
      </div>
        <div className="linear-days">
          {Array.from({ length: 6 }, (_, i) => (
            <React.Fragment key={`month-${i}`}>
              {Array.from({ length: 7 }, (_, dayIndex) => (
                <div key={`${i}-${dayIndex}`} className="linear-day-name-header">
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
