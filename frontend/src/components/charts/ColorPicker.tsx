import React, { useState, useRef, useEffect } from "react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

// Array of predefined colors to choose from
const PRESET_COLORS = [
  "#0066B1", // Blue
  "#00B100", // Green
  "#FF0000", // Red
  "#B100B1", // Purple
  "#B16600", // Orange
  "#00B1B1", // Teal
  "#000000", // Black
  "#666666", // Gray
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    if (!showPicker) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        className="w-8 h-8 border border-gray-300 rounded"
        style={{ backgroundColor: color }}
        onClick={() => setShowPicker(!showPicker)}
      />

      {showPicker && (
        <div className="absolute left-0 top-full mt-1 p-2 bg-white border rounded shadow-lg z-30">
          <div className="grid grid-cols-4 gap-2 w-32">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                className="w-6 h-6 rounded-full border border-gray-300"
                style={{ backgroundColor: presetColor }}
                onClick={() => {
                  onChange(presetColor);
                  setShowPicker(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
