import React from 'react';
import { useTranslation } from 'react-i18next';
import { Month } from '../../../types/year';
import './DayHeader.scss';

interface DayHeaderProps {
  months: Month[];
}

const DayHeader: React.FC<DayHeaderProps> = ({ months }) => {
  const { t } = useTranslation();
  
  // Find the maximum number of columns needed across all months
  const maxColumns = Math.max(...months.map(month => {
    const mondayFirstOffset = month.firstDayOfWeek === 0 ? 6 : month.firstDayOfWeek - 1;
    return mondayFirstOffset + month.days.length;
  }));
  
  // Get day letters from translations (Monday to Sunday)
  const dayLetters = t('dayLetters', { returnObjects: true }) as string[];
  const dayNames = Array.from({ length: maxColumns }, (_, index) => {
    return dayLetters[index % 7];
  });

  return (
    <div className="dh-day-hearder">
      <div className="dh-day-hearder-label">
        {/* Empty label for header */}
      </div>
      <div className="dh-day-hearder-days">
        {dayNames.map((dayName, index) => (
          <div key={index} className="dh-day-hearder-day-name">
            {dayName}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayHeader;
