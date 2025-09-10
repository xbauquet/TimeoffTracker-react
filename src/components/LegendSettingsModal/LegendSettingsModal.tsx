import React, { useState, useEffect } from 'react';
import { ColorPicker, ColorOption } from '../ColorPicker';
import { LegendColorService, LegendColorSettings } from '../../services/legendColorService';
import './LegendSettingsModal.scss';

interface LegendSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: LegendColorSettings) => void;
  currentSettings: LegendColorSettings;
}

interface LegendItem {
  key: keyof LegendColorSettings;
  label: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  {
    key: 'normal',
    label: 'Jour normal',
  },
  {
    key: 'weekend',
    label: 'Week-end',
  },
  {
    key: 'holiday',
    label: 'Jour férié',
  },
  {
    key: 'holidayWeekend',
    label: 'Jour férié (week-end)',
  },
  {
    key: 'personalHoliday',
    label: 'Congé personnel',
  },
  {
    key: 'icalEvents',
    label: 'Événements iCal',
  }
];

export const LegendSettingsModal: React.FC<LegendSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChange,
  currentSettings
}) => {
  const [settings, setSettings] = useState<LegendColorSettings>(currentSettings);
  const [colorOptions] = useState<ColorOption[]>(LegendColorService.getColorOptions());

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const handleColorChange = (key: keyof LegendColorSettings, color: string) => {
    const newSettings = { ...settings, [key]: color };
    setSettings(newSettings);
  };

  const handleSave = () => {
    LegendColorService.saveSettings(settings);
    onSettingsChange(settings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = LegendColorService.resetToDefaults();
    setSettings(defaultSettings);
    onSettingsChange(defaultSettings);
  };

  const handleCancel = () => {
    setSettings(currentSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="legend-settings-modal-overlay" onClick={onClose}>
      <div className="legend-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Personnaliser les couleurs</h2>
          <button className="close-button" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="legend-settings-list">
            {LEGEND_ITEMS.map((item) => (
              <div key={item.key} className="legend-setting-item">
                <div className="legend-setting-header">
                  <div className="legend-label">{item.label}</div>
                </div>
                <ColorPicker
                  selectedColor={settings[item.key]}
                  onColorChange={(color) => handleColorChange(item.key, color)}
                  colors={colorOptions}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="reset-button" onClick={handleReset}>
            Réinitialiser
          </button>
          <div className="modal-actions">
            <button className="cancel-button" onClick={handleCancel}>
              Annuler
            </button>
            <button className="save-button" onClick={handleSave}>
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegendSettingsModal;
