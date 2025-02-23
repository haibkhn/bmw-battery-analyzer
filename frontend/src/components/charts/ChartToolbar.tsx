import React from "react";
import {
  FiZoomIn,
  FiZoomOut,
  FiMove,
  FiDownload,
  FiSettings,
} from "react-icons/fi";

interface ChartToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPanMode: () => void;
  onReset: () => void;
  onDownload: () => void;
  mode: "zoom" | "pan" | "none";
}

export const ChartToolbar: React.FC<ChartToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onPanMode,
  onReset,
  onDownload,
  mode,
}) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow">
      <button
        onClick={onZoomIn}
        className={`p-2 rounded ${mode === "zoom" ? "bg-blue-100" : "hover:bg-gray-100"}`}
        title="Zoom In"
      >
        <FiZoomIn />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 rounded hover:bg-gray-100"
        title="Zoom Out"
      >
        <FiZoomOut />
      </button>
      <button
        onClick={onPanMode}
        className={`p-2 rounded ${mode === "pan" ? "bg-blue-100" : "hover:bg-gray-100"}`}
        title="Pan"
      >
        <FiMove />
      </button>
      <div className="w-px h-6 bg-gray-200 mx-2" />
      <button
        onClick={onReset}
        className="p-2 rounded hover:bg-gray-100"
        title="Reset View"
      >
        Reset
      </button>
      <button
        onClick={onDownload}
        className="p-2 rounded hover:bg-gray-100"
        title="Download Plot"
      >
        <FiDownload />
      </button>
    </div>
  );
};
