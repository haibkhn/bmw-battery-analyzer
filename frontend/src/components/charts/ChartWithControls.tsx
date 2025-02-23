import React, { useState, useCallback, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { FiZoomIn, FiZoomOut, FiRefreshCw, FiDownload } from "react-icons/fi";

interface ChartWithControlsProps {
  data: any[];
  xAxis: {
    key: string;
    label: string;
    domain: [number, number];
  };
  yAxis: {
    key: string;
    label: string;
    domain: [number, number];
  };
  lines: Array<{
    key: string;
    name: string;
    color: string;
  }>;
  height?: number;
}

export const ChartWithControls: React.FC<ChartWithControlsProps> = ({
  data,
  xAxis,
  yAxis,
  lines,
  height = 400,
}) => {
  // State for domains
  const [currentXDomain, setCurrentXDomain] = useState(xAxis.domain);
  const [currentYDomain, setCurrentYDomain] = useState(yAxis.domain);

  // State for Brush index range
  const [brushStartIndex, setBrushStartIndex] = useState(0);
  const [brushEndIndex, setBrushEndIndex] = useState(data.length - 1);

  // Controls overlay state
  const [showControls, setShowControls] = useState(false);

  // Ref for Brush component
  const brushRef = useRef<any>(null);

  const handleReset = useCallback(() => {
    console.log("Resetting...");
    setCurrentXDomain(xAxis.domain);
    setCurrentYDomain(yAxis.domain);

    // Reset the brush range
    setBrushStartIndex(0);
    setBrushEndIndex(data.length - 1);
  }, [xAxis.domain, yAxis.domain, data.length]);

  const handleBrush = useCallback(
    (domain: any) => {
      if (domain && domain.startIndex !== undefined) {
        setCurrentXDomain([
          data[domain.startIndex][xAxis.key],
          data[domain.endIndex][xAxis.key],
        ]);
        setBrushStartIndex(domain.startIndex);
        setBrushEndIndex(domain.endIndex);
      }
    },
    [data, xAxis.key]
  );

  return (
    <div
      className="relative"
      style={{ height }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white/80 rounded-lg p-1 shadow">
          <button
            onClick={handleReset}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
            title="Reset View"
          >
            <FiRefreshCw size={16} />
          </button>
          <button
            onClick={() => {
              /* Download implementation */
            }}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
            title="Download"
          >
            <FiDownload size={16} />
          </button>
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 60, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxis.key}
            domain={currentXDomain}
            type="number"
            label={{
              value: xAxis.label,
              position: "bottom",
              offset: 35,
            }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <YAxis
            domain={currentYDomain}
            label={{
              value: yAxis.label,
              angle: -90,
              position: "insideLeft",
              offset: -45,
            }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip formatter={(value: number) => value.toFixed(4)} />
          <Legend verticalAlign="top" height={36} />
          <Brush
            dataKey={xAxis.key}
            height={30}
            stroke="#8884d8"
            startIndex={brushStartIndex}
            endIndex={brushEndIndex}
            onChange={handleBrush}
          />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartWithControls;
