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
  isFullWidth?: boolean;
}

export const MainChart: React.FC<MainChartProps> = ({
  data,
  config,
  domains,
  onChartClick,
  getMetricLabel,
  showDots = false,
  isFullWidth = true,
}) => {
  return (
    <div className={`h-[400px] ${isFullWidth ? "w-full" : "w-full lg:w-1/2"}`}>
      <ResponsiveContainer width="100%" height="100%">
        {config.type === "line" ? (
          <LineChart data={data} onClick={onChartClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={config.xAxis}
              domain={domains.x}
              type="number"
              label={{
                value: getMetricLabel(config.xAxis),
                position: "bottom",
              }}
            />
            <YAxis
              domain={domains.y}
              type="number"
              label={{
                value: getMetricLabel(config.yAxis),
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(value: number) => value.toFixed(4)}
              labelFormatter={(label: number) =>
                `${getMetricLabel(config.xAxis)}: ${label}`
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
          <ScatterChart onClick={onChartClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={config.xAxis}
              domain={domains.x}
              type="number"
              label={{
                value: getMetricLabel(config.xAxis),
                position: "bottom",
              }}
            />
            <YAxis
              domain={domains.y}
              type="number"
              label={{
                value: getMetricLabel(config.yAxis),
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(value: number) => value.toFixed(4)}
              labelFormatter={(label: number) =>
                `${getMetricLabel(config.xAxis)}: ${label}`
              }
            />
            <Scatter data={data} fill="#0066B1" isAnimationActive={false} />
          </ScatterChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
