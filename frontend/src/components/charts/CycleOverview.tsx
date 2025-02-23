import React, { useMemo } from "react";
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

interface CycleOverviewProps {
  data: BatteryData[];
  cycles: number[];
}

export const CycleOverview: React.FC<CycleOverviewProps> = ({
  data,
  cycles,
}) => {
  // Calculate summary data for each cycle
  const { summaryData, domains } = useMemo(() => {
    const summaries = cycles.map((cycleNum) => {
      const cycleData = data.filter((d) => d.cycle_number === cycleNum);

      // Get voltage stats
      const voltages = cycleData.map((d) => d.voltage || 0);
      const avgVoltage = voltages.reduce((a, b) => a + b, 0) / voltages.length;
      const peakVoltage = Math.max(...voltages);
      const minVoltage = Math.min(...voltages);

      // Get current stats
      const currents = cycleData.map((d) => d.current || 0);
      const avgCurrent = currents.reduce((a, b) => a + b, 0) / currents.length;
      const peakCurrent = Math.max(...currents);
      const minCurrent = Math.min(...currents);

      // Calculate duration
      const times = cycleData.map((d) => d.time || 0);
      const duration = (Math.max(...times) - Math.min(...times)) / 1000; // in seconds

      return {
        cycle_number: cycleNum,
        avg_voltage: avgVoltage,
        peak_voltage: peakVoltage,
        min_voltage: minVoltage,
        avg_current: avgCurrent,
        peak_current: peakCurrent,
        min_current: minCurrent,
        duration,
      };
    });

    // Calculate domains with padding
    const getPaddedDomain = (values: number[], padding = 0.05) => {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;
      return [min - range * padding, max + range * padding];
    };

    const domains = {
      voltage: getPaddedDomain([
        ...summaries.map((s) => s.peak_voltage),
        ...summaries.map((s) => s.avg_voltage),
        ...summaries.map((s) => s.min_voltage),
      ]),
      current: getPaddedDomain([
        ...summaries.map((s) => s.peak_current),
        ...summaries.map((s) => s.avg_current),
        ...summaries.map((s) => s.min_current),
      ]),
    };

    return { summaryData: summaries, domains };
  }, [data, cycles]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Voltage Trends */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={summaryData}
            margin={{ top: 20, right: 30, left: 60, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="cycle_number"
              label={{ value: "Cycle Number", position: "bottom", offset: 35 }}
              tickFormatter={(value) => value.toString()}
              interval={Math.ceil(summaryData.length / 10)} // Show fewer ticks
            />
            <YAxis
              domain={domains.voltage}
              label={{
                value: "Voltage (V)",
                angle: -90,
                position: "insideLeft",
                offset: -45,
              }}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip
              formatter={(value: number) => value.toFixed(4)}
              labelFormatter={(label) => `Cycle ${label}`}
            />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="peak_voltage"
              name="Peak Voltage"
              stroke="#0066B1"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="avg_voltage"
              name="Average Voltage"
              stroke="#00B100"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="min_voltage"
              name="Min Voltage"
              stroke="#FF0000"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Current Trends */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={summaryData}
            margin={{ top: 20, right: 30, left: 60, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="cycle_number"
              label={{ value: "Cycle Number", position: "bottom", offset: 35 }}
              tickFormatter={(value) => value.toString()}
              interval={Math.ceil(summaryData.length / 10)} // Show fewer ticks
            />
            <YAxis
              domain={domains.current}
              label={{
                value: "Current (A)",
                angle: -90,
                position: "insideLeft",
                offset: -45,
              }}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip
              formatter={(value: number) => value.toFixed(4)}
              labelFormatter={(label) => `Cycle ${label}`}
            />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="peak_current"
              name="Peak Current"
              stroke="#B100B1"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="avg_current"
              name="Average Current"
              stroke="#B16600"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="min_current"
              name="Min Current"
              stroke="#00B1B1"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CycleOverview;
