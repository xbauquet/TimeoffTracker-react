import React, { useState } from 'react';
import { LegendColorSettings, LegendColorService } from '../../services/legendColorService';
import { LegendSettingsModal } from '../LegendSettingsModal';
import './Legend.scss';

interface LegendProps {
  colorSettings: LegendColorSettings;
  onColorSettingsChange: (settings: LegendColorSettings) => void;
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
  onColorSettingsChange,
  className = ''
}) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleSettingsChange = (newSettings: LegendColorSettings) => {
    onColorSettingsChange(newSettings);
  };

  const openSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };

  const closeSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  return (
    <>
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
                <span className="legend-color-text">{item.label.charAt(0)}</span>
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        
        <button
          className="legend-settings-button"
          onClick={openSettingsModal}
          title="Personnaliser les couleurs"
          aria-label="Personnaliser les couleurs de la légende"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      <LegendSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
        onSettingsChange={handleSettingsChange}
        currentSettings={colorSettings}
      />
    </>
  );
};

export default Legend;
