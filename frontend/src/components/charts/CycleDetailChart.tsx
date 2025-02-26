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
} from "recharts";
import { BatteryData } from "../../types";
import { DetailDomains } from "@/types/chart";
import { FiX, FiRefreshCw } from "react-icons/fi";
import { downloadChartAsImage, downloadDataAsCSV } from "./downloadUtils";
import { DownloadMenu } from "./DownloadMenu";
import {
  ChartCustomization,
  ChartStyle,
  defaultChartStyle,
} from "./ChartCustomization";

interface CycleDetailChartProps {
  cycleData: BatteryData[];
  onClose: () => void;
  cycleNumber: number;
  domains: DetailDomains;
}

export const CycleDetailChart: React.FC<CycleDetailChartProps> = ({
  cycleData,
  onClose,
  cycleNumber,
  domains,
}) => {
  // Reference to chart container for downloads
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // State for controls
  const [showControls, setShowControls] = useState(false);

  // Chart style state
  const [chartStyle, setChartStyle] = useState<ChartStyle>(() => {
    return defaultChartStyle([
      { key: "voltage", name: "Voltage", color: "#0066B1" },
      { key: "current", name: "Current", color: "#FF0000" },
    ]);
  });

  // Store initial style for reset
  const initialStyle = useRef(chartStyle);

  // Handle reset button
  const handleReset = useCallback(() => {
    setChartStyle(initialStyle.current);
  }, []);

  // Handle downloads
  const handleDownloadImage = useCallback(() => {
    const title = `cycle-${cycleNumber}-detail`;
    downloadChartAsImage(chartContainerRef, `${title}.png`);
  }, [cycleNumber]);

  const handleDownloadData = useCallback(() => {
    const title = `cycle-${cycleNumber}-detail`;
    downloadDataAsCSV(cycleData, `${title}.csv`);
  }, [cycleData, cycleNumber]);

  return (
    <div
      className="h-[400px] w-full lg:w-1/2"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      ref={chartContainerRef}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Cycle {cycleNumber} Detail ({cycleData.length} points)
        </span>
        <div className="flex items-center gap-2">
          {showControls && (
            <div className="flex gap-1 bg-white/80 rounded-lg p-1 shadow">
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
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close cycle detail"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={cycleData}
          margin={{ top: 10, right: 60, left: 60, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="relativeTime"
            domain={domains.time}
            type="number"
            label={{
              value: "Time (s)",
              position: "bottom",
              offset: 40,
            }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <YAxis
            yAxisId="voltage"
            domain={domains.voltage}
            label={{
              value: "Voltage (V)",
              angle: -90,
              position: "insideLeft",
              offset: -10,
              style: { textAnchor: "middle" },
            }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <YAxis
            yAxisId="current"
            orientation="right"
            domain={domains.current}
            label={{
              value: "Current (A)",
              angle: 90,
              position: "insideRight",
              offset: 10,
              style: { textAnchor: "middle" },
            }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              value.toFixed(4),
              name === "voltage" ? "Voltage (V)" : "Current (A)",
            ]}
            labelFormatter={(label: number) => `Time: ${label.toFixed(2)}s`}
          />
          <Legend />
          {chartStyle.lines.map((line) => {
            const isVoltage = line.key === "voltage";
            return (
              <Line
                key={line.key}
                yAxisId={isVoltage ? "voltage" : "current"}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                strokeDasharray={line.strokeDasharray}
                dot={false}
                isAnimationActive={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CycleDetailChart;
