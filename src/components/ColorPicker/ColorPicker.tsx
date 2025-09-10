import React from 'react';
import './ColorPicker.scss';

export interface ColorOption {
  id: string;
  name: string;
  color: string;
  borderColor?: string;
}

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  colors: ColorOption[];
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorChange,
  colors,
  className = ''
}) => {
  return (
    <div className={`color-picker ${className}`}>
      <div className="color-picker-grid">
        {colors.map((colorOption) => (
          <button
            key={colorOption.id}
            className={`color-option ${selectedColor === colorOption.color ? 'selected' : ''}`}
            style={{
              backgroundColor: colorOption.color,
              borderColor: colorOption.borderColor || colorOption.color
            }}
            onClick={() => onColorChange(colorOption.color)}
            title={colorOption.name}
            aria-label={`Select ${colorOption.name} color`}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
