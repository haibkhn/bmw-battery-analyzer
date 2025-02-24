import React, { useRef, useEffect } from "react";
import { FiSettings } from "react-icons/fi";

interface LineStyle {
  key: string;
  name: string;
  color: string;
  strokeWidth: number;
  strokeDasharray?: string;
}

interface ChartCustomizationProps {
  lines: LineStyle[];
  onLineStyleChange: (key: string, updates: Partial<LineStyle>) => void;
  chartTitle: string;
  onTitleChange: (title: string) => void;
}

export const ChartCustomization: React.FC<ChartCustomizationProps> = ({
  lines,
  onLineStyleChange,
  chartTitle,
  onTitleChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle clicks outside the panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
        title="Customize Chart"
      >
        <FiSettings size={16} />
      </button>

      {/* Customization Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-20"
        >
          {/* Chart Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chart Title
            </label>
            <input
              type="text"
              value={chartTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full px-2 py-1 border rounded"
              placeholder="Enter chart title"
            />
          </div>

          {/* Line Styles */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Line Styles</h3>
            {lines.map((line) => (
              <div key={line.key} className="space-y-2">
                <label className="block text-sm text-gray-600">
                  {line.name}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={line.color}
                    onChange={(e) =>
                      onLineStyleChange(line.key, { color: e.target.value })
                    }
                    className="w-8 h-8"
                  />
                  <select
                    value={line.strokeWidth}
                    onChange={(e) =>
                      onLineStyleChange(line.key, {
                        strokeWidth: Number(e.target.value),
                      })
                    }
                    className="px-2 py-1 border rounded"
                  >
                    <option value={1}>Thin</option>
                    <option value={2}>Normal</option>
                    <option value={3}>Thick</option>
                  </select>
                  <select
                    value={line.strokeDasharray || "none"}
                    onChange={(e) =>
                      onLineStyleChange(line.key, {
                        strokeDasharray:
                          e.target.value === "none"
                            ? undefined
                            : e.target.value,
                      })
                    }
                    className="px-2 py-1 border rounded"
                  >
                    <option value="none">Solid</option>
                    <option value="3 3">Dotted</option>
                    <option value="10 5">Dashed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Define default colors based on line type
export const getDefaultColor = (key: string): string => {
  if (key.includes("voltage")) {
    if (key.includes("peak")) return "#0066B1";
    if (key.includes("avg")) return "#00B100";
    if (key.includes("min")) return "#FF0000";
    return "#0066B1"; // default voltage color
  }
  if (key.includes("current")) {
    if (key.includes("peak")) return "#B100B1";
    if (key.includes("avg")) return "#B16600";
    if (key.includes("min")) return "#00B1B1";
    return "#FF0000"; // default current color
  }
  return "#0066B1"; // fallback color
};

// Get default title based on the lines
export const getDefaultTitle = (
  lines: { key: string; name: string }[]
): string => {
  const hasVoltage = lines.some((line) => line.key.includes("voltage"));
  const hasCurrent = lines.some((line) => line.key.includes("current"));

  if (hasVoltage && hasCurrent) {
    return "Voltage and Current Analysis";
  } else if (hasVoltage) {
    return "Voltage Analysis";
  } else if (hasCurrent) {
    return "Current Analysis";
  } else {
    return "Battery Analysis";
  }
};

// Types for chart customization
export interface ChartStyle {
  title: string;
  lines: LineStyle[];
}

export const defaultChartStyle = (
  lines: { key: string; name: string }[]
): ChartStyle => ({
  title: getDefaultTitle(lines),
  lines: lines.map((line) => ({
    ...line,
    color: getDefaultColor(line.key),
    strokeWidth: 2,
  })),
});
