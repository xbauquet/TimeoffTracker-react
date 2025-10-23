import React from 'react';
import { LegendColorSettings, LegendColorService } from '../../services/legendColorService';
import './Legend.scss';

interface LegendProps {
  colorSettings: LegendColorSettings;
  className?: string;
}

interface LegendItem {
  key: keyof LegendColorSettings;
  label: string;
  className: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  {
    key: 'normal',
    label: 'Jour normal',
    className: 'normal'
  },
  {
    key: 'weekend',
    label: 'Week-end',
    className: 'weekend'
  },
  {
    key: 'holiday',
    label: 'Jour férié',
    className: 'holiday'
  },
  {
    key: 'holidayWeekend',
    label: 'Jour férié (week-end)',
    className: 'holiday-weekend'
  },
  {
    key: 'personalHoliday',
    label: 'Congé personnel',
    className: 'personal-holiday'
  },
  {
    key: 'icalEvents',
    label: 'Événements iCal',
    className: 'has-ical-events'
  }
];

export const Legend: React.FC<LegendProps> = ({
  colorSettings,
  className = ''
}) => {

  return (
    <div className={`legend ${className}`}>
      <div className="legend-items">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.key} className="legend-item">
            <div
              className={`legend-color ${item.className}`}
              style={{
                backgroundColor: colorSettings[item.key],
                borderColor: colorSettings[item.key],
                color: LegendColorService.getTextColor(colorSettings[item.key])
              }}
            >
              <span 
                className="legend-color-text"
                style={{
                  color: LegendColorService.getTextColor(colorSettings[item.key])
                }}
              >
                {item.label.charAt(0)}
              </span>
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
