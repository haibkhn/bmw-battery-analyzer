import React from "react";
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
} from "recharts";
import { ChartConfig } from "../../types";
import { ChartDomains } from "@/types/chart";

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
  return (
    <div className={`h-[400px] ${isDetailView ? "w-full lg:w-1/2" : "w-full"}`}>
      <ResponsiveContainer width="100%" height="100%">
        {config.type === "line" ? (
          <LineChart
            data={data}
            onClick={onChartClick}
            margin={{ top: 10, right: 30, left: 60, bottom: 50 }} // Added margins
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={config.xAxis}
              domain={domains.x}
              type="number"
              label={{
                value: getMetricLabel(config.xAxis),
                position: "bottom",
                offset: 10, // Increased offset
              }}
              tickFormatter={(value) => value.toFixed(2)} // Format ticks to prevent overlap
            />
            <YAxis
              domain={domains.y}
              type="number"
              label={{
                value: getMetricLabel(config.yAxis),
                angle: -90,
                position: "insideLeft",
                offset: -0, // Adjusted offset
                style: { textAnchor: "middle" }, // Better text alignment
              }}
              tickFormatter={(value) => value.toFixed(2)} // Format ticks to prevent overlap
            />
            <Tooltip
              formatter={(value: number) => value.toFixed(4)}
              labelFormatter={(label: number) =>
                `${getMetricLabel(config.xAxis)}: ${label.toFixed(2)}`
              }
            />
            <Line
              type="monotone"
              dataKey={config.yAxis}
              stroke="#0066B1"
              dot={showDots}
              isAnimationActive={false}
            />
          </LineChart>
        ) : (
          <ScatterChart
            onClick={onChartClick}
            margin={{ top: 10, right: 30, left: 60, bottom: 50 }} // Added margins
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={config.xAxis}
              domain={domains.x}
              type="number"
              label={{
                value: getMetricLabel(config.xAxis),
                position: "bottom",
                offset: 40, // Increased offset
              }}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <YAxis
              domain={domains.y}
              type="number"
              label={{
                value: getMetricLabel(config.yAxis),
                angle: -90,
                position: "insideLeft",
                offset: -45, // Adjusted offset
                style: { textAnchor: "middle" },
              }}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip
              formatter={(value: number) => value.toFixed(4)}
              labelFormatter={(label: number) =>
                `${getMetricLabel(config.xAxis)}: ${label.toFixed(2)}`
              }
            />
            <Scatter data={data} fill="#0066B1" isAnimationActive={false} />
          </ScatterChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
