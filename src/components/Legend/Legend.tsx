import React from 'react';
import { useTranslation } from 'react-i18next';
import { LegendColorSettings, LegendColorService } from '../../services/legendColorService';
import { Language } from '../../services';
import './Legend.scss';

interface LegendProps {
  colorSettings: LegendColorSettings;
  language: Language;
  className?: string;
}

interface LegendItem {
  key: keyof LegendColorSettings;
  labelKey: string;
  className: string;
}

const getLegendItems = (): LegendItem[] => {
  return [
    {
      key: 'normal',
      labelKey: 'normalDay',
      className: 'normal'
    },
    {
      key: 'weekend',
      labelKey: 'weekend',
      className: 'weekend'
    },
    {
      key: 'holiday',
      labelKey: 'holiday',
      className: 'holiday'
    },
    {
      key: 'holidayWeekend',
      labelKey: 'holidayWeekend',
      className: 'holiday-weekend'
    },
    {
      key: 'personalHoliday',
      labelKey: 'personalHoliday',
      className: 'personal-holiday'
    },
    {
      key: 'icalEvents',
      labelKey: 'icalEvents',
      className: 'has-ical-events'
    }
  ];
};

export const Legend: React.FC<LegendProps> = ({
  colorSettings,
  language,
  className = ''
}) => {
  const { t, i18n } = useTranslation();

  // Update i18n language when language prop changes
  React.useEffect(() => {
    if (language !== i18n.language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  return (
    <div className={`legend ${className}`}>
      <div className="legend-items">
        {getLegendItems().map((item) => (
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
                {t(item.labelKey).charAt(0)}
              </span>
            </div>
            <span>{t(item.labelKey)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
