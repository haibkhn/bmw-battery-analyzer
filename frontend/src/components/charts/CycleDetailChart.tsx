import React from "react";
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
  return (
    <div className="h-[400px] w-full lg:w-1/2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Cycle {cycleNumber} Detail ({cycleData.length} points)
        </span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close cycle detail"
        >
          Close
        </button>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={cycleData}
          margin={{ top: 10, right: 60, left: 60, bottom: 60 }} // Adjusted margins for dual Y-axes
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
          <Line
            yAxisId="voltage"
            type="monotone"
            dataKey="voltage"
            stroke="#0066B1"
            name="Voltage"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            yAxisId="current"
            type="monotone"
            dataKey="current"
            stroke="#FF0000"
            name="Current"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
