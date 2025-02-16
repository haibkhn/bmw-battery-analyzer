import { useState, useMemo, useEffect } from "react";
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
import { BatteryData, ChartConfig, CSVType } from "../../types";

interface ChartAreaProps {
  data: BatteryData[];
  availableColumns: string[];
  type: CSVType;
}

interface DataPoint {
  cycle_number: number;
  time: number;
  current: number;
  voltage: number;
}

interface GroupedData {
  [cycle: number]: DataPoint[];
}

const ChartArea = ({ data, availableColumns, type }: ChartAreaProps) => {
  // Filter columns based on CSV type
  const relevantColumns = useMemo(() => {
    const baseColumns = ["cycle_number"];
    if (type === "2_column") {
      return [...baseColumns, "capacity"];
    }
    return [...baseColumns, "time", "current", "voltage"];
  }, [type]);

  const [config, setConfig] = useState<ChartConfig>({
    xAxis: "cycle_number",
    yAxis: type === "2_column" ? "capacity" : "voltage",
    type: "line",
  });

  // Update config when CSV type changes
  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      yAxis: type === "2_column" ? "capacity" : "voltage",
    }));
  }, [type]);

  // Group data by cycle_number for better analysis
  const groupedData = useMemo(() => {
    if (type !== "4_column") return null;

    const grouped: GroupedData = {};
    data.forEach((point) => {
      const cycle = point.cycle_number;
      if (!grouped[cycle]) {
        grouped[cycle] = [];
      }
      grouped[cycle].push(point as DataPoint);
    });
    return grouped;
  }, [data, type]);

  // Add cycle information
  const cycleInfo = useMemo(() => {
    if (!groupedData) return null;

    const cycles = Object.keys(groupedData).map(Number);
    const pointsPerCycle = Object.values(groupedData).map(
      (points) => points.length
    );

    return {
      totalCycles: cycles.length,
      minCycle: Math.min(...cycles),
      maxCycle: Math.max(...cycles),
      avgPointsPerCycle: Math.round(
        pointsPerCycle.reduce((a, b) => a + b, 0) / cycles.length
      ),
    };
  }, [groupedData]);

  // Calculate domains for each axis
  const domains = useMemo(() => {
    if (data.length === 0) return null;

    const xValues = data.map((item) =>
      Number(item[config.xAxis as keyof BatteryData])
    );
    const yValues = data.map((item) =>
      Number(item[config.yAxis as keyof BatteryData])
    );

    // Filter out any NaN values
    const validXValues = xValues.filter((x) => !isNaN(x));
    const validYValues = yValues.filter((y) => !isNaN(y));

    return {
      x: [Math.min(...validXValues), Math.max(...validXValues)],
      y: [Math.min(...validYValues), Math.max(...validYValues)],
    };
  }, [data, config.xAxis, config.yAxis]);

  // Sample data for better performance
  const sampledData = useMemo(() => {
    console.log("CSV Type:", type);
    console.log("Available columns:", relevantColumns);

    if (config.type === "scatter" && data.length > 1000) {
      const sampleRate = Math.ceil(data.length / 1000);
      return data.filter((_, index) => index % sampleRate === 0);
    }
    return data;
  }, [data, config.type, relevantColumns]);

  const chartData = useMemo(() => {
    return sampledData.map((item) => ({
      [config.xAxis]: item[config.xAxis as keyof BatteryData],
      [config.yAxis]: item[config.yAxis as keyof BatteryData],
    }));
  }, [sampledData, config.xAxis, config.yAxis]);

  // Performance metrics
  const [loadTime, setLoadTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      setLoadTime(endTime - startTime);
    };
  }, [chartData]);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            X Axis
          </label>
          <select
            value={config.xAxis}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, xAxis: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            {relevantColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Y Axis
          </label>
          <select
            value={config.yAxis}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, yAxis: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            {relevantColumns
              .filter((col) => col !== "cycle_number")
              .map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Chart Type
          </label>
          <select
            value={config.type}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                type: e.target.value as "line" | "scatter",
              }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="line">Line Chart</option>
            <option value="scatter">Scatter Plot</option>
          </select>
        </div>
      </div>

      {/* Data info */}
      <div className="mb-4 text-sm text-gray-600">
        <p>CSV Type: {type}</p>
        <p>
          Total Data Points: {sampledData.length.toLocaleString()}
          {sampledData.length !== data.length &&
            ` (sampled from ${data.length.toLocaleString()} total points)`}
        </p>
        {cycleInfo && (
          <>
            <p>
              Cycles: {cycleInfo.minCycle} to {cycleInfo.maxCycle} (
              {cycleInfo.totalCycles} total)
            </p>
            <p>Average measurements per cycle: {cycleInfo.avgPointsPerCycle}</p>
          </>
        )}
        <p>Chart Render Time: {loadTime.toFixed(2)}ms</p>
        {domains && (
          <div className="mt-1">
            <p>
              {config.xAxis} Range: {domains.x[0].toFixed(2)} to{" "}
              {domains.x[1].toFixed(2)}
            </p>
            <p>
              {config.yAxis} Range: {domains.y[0].toFixed(2)} to{" "}
              {domains.y[1].toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {config.type === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={config.xAxis}
                domain={domains?.x}
                label={{ value: config.xAxis, position: "bottom" }}
                type="number"
              />
              <YAxis
                domain={domains?.y}
                label={{
                  value: config.yAxis,
                  angle: -90,
                  position: "insideLeft",
                }}
                type="number"
              />
              <Tooltip
                formatter={(value: number) => value.toFixed(4)}
                labelFormatter={(label: number) => `${config.xAxis}: ${label}`}
              />
              <Line
                type="monotone"
                dataKey={config.yAxis}
                stroke="#0066B1"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          ) : (
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={config.xAxis}
                domain={domains?.x}
                label={{ value: config.xAxis, position: "bottom" }}
                type="number"
              />
              <YAxis
                dataKey={config.yAxis}
                domain={domains?.y}
                label={{
                  value: config.yAxis,
                  angle: -90,
                  position: "insideLeft",
                }}
                type="number"
              />
              <Tooltip
                formatter={(value: number) => value.toFixed(4)}
                labelFormatter={(label: number) => `${config.xAxis}: ${label}`}
              />
              <Scatter
                data={chartData}
                fill="#0066B1"
                isAnimationActive={false}
              />
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartArea;
