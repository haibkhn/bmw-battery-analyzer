import { useState, useMemo } from "react";
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
import { BatteryData, ChartConfig } from "../../types";

interface ChartAreaProps {
  data: BatteryData[];
  availableColumns: string[];
}

const ChartArea = ({ data, availableColumns }: ChartAreaProps) => {
  const [config, setConfig] = useState<ChartConfig>({
    xAxis: "cycle_number",
    yAxis: availableColumns[1] || "capacity",
    type: "line",
  });

  const chartData = useMemo(() => {
    console.log(`Processing ${data.length} data points`);
    return data.map((item) => ({
      [config.xAxis]: item[config.xAxis as keyof BatteryData],
      [config.yAxis]: item[config.yAxis as keyof BatteryData],
    }));
  }, [data, config.xAxis, config.yAxis]);

  // Calculate domains with a small padding
  const domains = useMemo(() => {
    if (data.length === 0) return null;

    const xValues = data.map((item) =>
      Number(item[config.xAxis as keyof BatteryData])
    );
    const yValues = data.map((item) =>
      Number(item[config.yAxis as keyof BatteryData])
    );

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    // Add 2% padding
    const xPadding = (xMax - xMin) * 0.02;
    const yPadding = (yMax - yMin) * 0.02;

    console.log("Chart Ranges:", {
      x: `${xMin} - ${xMax}`,
      y: `${yMin} - ${yMax}`,
    });

    return {
      x: [xMin - xPadding, xMax + xPadding],
      y: [yMin - yPadding, yMax + yPadding],
    };
  }, [data, config.xAxis, config.yAxis]);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      {/* Data Statistics */}
      <div className="mb-4 text-sm text-gray-600">
        <p>Total Data Points: {data.length.toLocaleString()}</p>
        {domains && (
          <>
            <p>
              {config.xAxis} Range: {domains.x[0].toFixed(2)} -{" "}
              {domains.x[1].toFixed(2)}
            </p>
            <p>
              {config.yAxis} Range: {domains.y[0].toFixed(4)} -{" "}
              {domains.y[1].toFixed(4)}
            </p>
          </>
        )}
      </div>

      {/* Chart Controls */}
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
            {availableColumns.map((col) => (
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
            {availableColumns.map((col) => (
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

      {/* Chart Visualization */}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {config.type === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={config.xAxis}
                domain={domains?.x}
                type="number"
                tickFormatter={(value) => value.toFixed(0)}
                label={{
                  value: config.xAxis,
                  position: "bottom",
                  offset: 5,
                }}
                allowDecimals={false}
              />
              <YAxis
                domain={domains?.y}
                type="number"
                tickFormatter={(value) => value.toFixed(4)}
                label={{
                  value: config.yAxis,
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                }}
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
                type="number"
                tickFormatter={(value) => value.toFixed(0)}
                label={{
                  value: config.xAxis,
                  position: "bottom",
                  offset: 5,
                }}
                allowDecimals={false}
              />
              <YAxis
                dataKey={config.yAxis}
                domain={domains?.y}
                type="number"
                tickFormatter={(value) => value.toFixed(4)}
                label={{
                  value: config.yAxis,
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                }}
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
