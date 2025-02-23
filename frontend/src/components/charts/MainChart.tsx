import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { ChartConfig } from "../../types";
import { ChartDomains } from "@/types/chart";
import { FiRefreshCw, FiDownload } from "react-icons/fi";

interface MainChartProps {
  data: any[];
  config: ChartConfig;
  domains: ChartDomains;
  onChartClick: (point: any) => void;
  getMetricLabel: (value: string) => string;
  showDots?: boolean;
  isDetailView?: boolean;
}

export const MainChart: React.FC<MainChartProps> = ({
  data,
  config,
  domains,
  onChartClick,
  getMetricLabel,
  showDots = false,
  isDetailView,
}) => {
  // State for domains and controls
  const [currentXDomain, setCurrentXDomain] = useState(domains.x);
  const [currentYDomain, setCurrentYDomain] = useState(domains.y);
  const [brushDomain, setBrushDomain] = useState<[number, number] | null>(null);
  const [showControls, setShowControls] = useState(false);

  // Update domains when data or config changes
  useEffect(() => {
    setCurrentXDomain(domains.x);
    setCurrentYDomain(domains.y);
    setBrushDomain(null);
  }, [domains, config]);

  const handleReset = useCallback(() => {
    setCurrentXDomain(domains.x);
    setCurrentYDomain(domains.y);
    setBrushDomain(null);
  }, [domains]);

  const handleBrush = useCallback(
    (domain: any) => {
      if (domain && domain.startIndex !== undefined) {
        const newDomain = [
          data[domain.startIndex][config.xAxis],
          data[domain.endIndex][config.xAxis],
        ] as [number, number];
        setCurrentXDomain(newDomain);
        setBrushDomain(newDomain);
      }
    },
    [data, config.xAxis]
  );

  return (
    <div
      className={`relative h-[400px] ${isDetailView ? "w-full lg:w-1/2" : "w-full"}`}
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

      <ResponsiveContainer width="100%" height="100%">
        {config.type === "line" ? (
          <LineChart
            data={data}
            onClick={onChartClick}
            margin={{ top: 10, right: 30, left: 60, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={config.xAxis}
              domain={currentXDomain}
              type="number"
              label={{
                value: getMetricLabel(config.xAxis),
                position: "bottom",
                offset: 10,
              }}
              tickFormatter={(value) => value.toFixed(2)}
              allowDataOverflow
            />
            <YAxis
              domain={currentYDomain}
              type="number"
              label={{
                value: getMetricLabel(config.yAxis),
                angle: -90,
                position: "insideLeft",
                offset: -0,
                style: { textAnchor: "middle" },
              }}
              tickFormatter={(value) => value.toFixed(2)}
              allowDataOverflow
            />
            <Tooltip
              formatter={(value: number) => value.toFixed(4)}
              labelFormatter={(label: number) =>
                `${getMetricLabel(config.xAxis)}: ${label.toFixed(2)}`
              }
            />
            <Brush
              dataKey={config.xAxis}
              height={30}
              stroke="#8884d8"
              onChange={handleBrush}
              startIndex={
                brushDomain
                  ? data.findIndex(
                      (item) => item[config.xAxis] >= brushDomain[0]
                    )
                  : 0
              }
              endIndex={
                brushDomain
                  ? data.findIndex(
                      (item) => item[config.xAxis] >= brushDomain[1]
                    )
                  : data.length - 1
              }
              travellerWidth={10}
              y={330}
            />
            <Line
              type="monotone"
              dataKey={config.yAxis}
              stroke="#0066B1"
              dot={showDots}
              isAnimationActive={false}
              connectNulls
            />
          </LineChart>
        ) : (
          <ScatterChart
            onClick={onChartClick}
            margin={{ top: 10, right: 30, left: 60, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={config.xAxis}
              domain={currentXDomain}
              type="number"
              label={{
                value: getMetricLabel(config.xAxis),
                position: "bottom",
                offset: 40,
              }}
              tickFormatter={(value) => value.toFixed(2)}
              allowDataOverflow
            />
            <YAxis
              domain={currentYDomain}
              type="number"
              label={{
                value: getMetricLabel(config.yAxis),
                angle: -90,
                position: "insideLeft",
                offset: -45,
                style: { textAnchor: "middle" },
              }}
              tickFormatter={(value) => value.toFixed(2)}
              allowDataOverflow
            />
            <Tooltip
              formatter={(value: number) => value.toFixed(4)}
              labelFormatter={(label: number) =>
                `${getMetricLabel(config.xAxis)}: ${label.toFixed(2)}`
              }
            />
            <Brush
              dataKey={config.xAxis}
              height={30}
              stroke="#8884d8"
              onChange={handleBrush}
              startIndex={
                brushDomain
                  ? data.findIndex(
                      (item) => item[config.xAxis] >= brushDomain[0]
                    )
                  : 0
              }
              endIndex={
                brushDomain
                  ? data.findIndex(
                      (item) => item[config.xAxis] >= brushDomain[1]
                    )
                  : data.length - 1
              }
              travellerWidth={10}
              y={330}
            />
            <Scatter data={data} fill="#0066B1" isAnimationActive={false} />
          </ScatterChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
