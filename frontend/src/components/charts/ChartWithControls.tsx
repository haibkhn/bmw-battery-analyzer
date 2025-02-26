import React, { useState, useCallback, useRef, useEffect } from "react";
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
import { FiRefreshCw } from "react-icons/fi";
import {
  ChartCustomization,
  ChartStyle,
  defaultChartStyle,
} from "./ChartCustomization";
import { downloadChartAsImage, downloadDataAsCSV } from "./downloadUtils";
import { DownloadMenu } from "./DownloadMenu";

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
  // Reference to chart container for downloads
  const chartContainerRef = useRef<HTMLDivElement>(null);

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

  const [chartStyle, setChartStyle] = useState<ChartStyle>(() =>
    defaultChartStyle(lines)
  );

  // Store initial style for reset
  const initialStyle = useRef<ChartStyle>(null!);

  // Initialize initial style
  useEffect(() => {
    initialStyle.current = defaultChartStyle(lines);
  }, [lines]);

  const handleReset = useCallback(() => {
    console.log("Resetting...");
    setCurrentXDomain(xAxis.domain);
    setCurrentYDomain(yAxis.domain);

    // Reset the brush range
    setBrushStartIndex(0);
    setBrushEndIndex(data.length - 1);

    // Reset chart style to initial
    if (initialStyle.current) {
      setChartStyle(initialStyle.current);
    }
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

  // Handle downloads
  const handleDownloadImage = useCallback(() => {
    const title = chartStyle.title || "chart";
    downloadChartAsImage(
      chartContainerRef,
      `${title.replace(/\s+/g, "-").toLowerCase()}.png`
    );
  }, [chartStyle.title]);

  const handleDownloadData = useCallback(() => {
    const title = chartStyle.title || "chart-data";
    downloadDataAsCSV(data, `${title.replace(/\s+/g, "-").toLowerCase()}.csv`);
  }, [data, chartStyle.title]);

  return (
    <div
      className="relative"
      style={{ height }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      ref={chartContainerRef}
    >
      {/* Add title display */}
      {chartStyle.title && (
        <div className="absolute top-2 left-0 right-0 text-center z-10">
          <h3 className="text-sm font-medium text-gray-700">
            {chartStyle.title}
          </h3>
        </div>
      )}

      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white/80 rounded-lg p-1 shadow">
          <ChartCustomization
            lines={chartStyle.lines}
            onLineStyleChange={(key, updates) => {
              setChartStyle((prev) => ({
                ...prev,
                lines: prev.lines.map((line) =>
                  line.key === key ? { ...line, ...updates } : line
                ),
              }));
            }}
            chartTitle={chartStyle.title}
            onTitleChange={(title) =>
              setChartStyle((prev) => ({ ...prev, title }))
            }
          />
          <button
            onClick={handleReset}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
            title="Reset View"
          >
            <FiRefreshCw size={16} />
          </button>
          <DownloadMenu
            onDownloadImage={handleDownloadImage}
            onDownloadData={handleDownloadData}
          />
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: chartStyle.title ? 30 : 20,
            right: 30,
            left: 60,
            bottom: 70,
          }}
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
            y={300}
            fill="#fff"
          />
          {/* Update Line components to use custom styles */}
          {chartStyle.lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              strokeDasharray={line.strokeDasharray}
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
