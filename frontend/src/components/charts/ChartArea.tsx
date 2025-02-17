import { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
} from "recharts";
import { BatteryData, ChartConfig, CSVType } from "../../types";

interface ChartAreaProps {
  data: BatteryData[];
  type: CSVType;
}

interface CycleStats {
  cycle_number: number;
  avg_voltage: number;
  max_voltage: number;
  min_voltage: number;
  voltage_range: number;
  avg_current: number;
  max_current: number;
  min_current: number;
  current_range: number;
  duration: number;
  measurements: number;
}

interface Metric {
  value: string;
  label: string;
}

const ChartArea = ({ data, type }: ChartAreaProps) => {
  const [selectedCycle, setSelectedCycle] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Calculate stats for 4-column data
  const cycleStats = useMemo(() => {
    if (type !== "4_column") return [];

    const groupedData = data.reduce(
      (acc, point) => {
        const cycle = point.cycle_number;
        if (!acc[cycle]) acc[cycle] = [];
        acc[cycle].push(point);
        return acc;
      },
      {} as Record<number, BatteryData[]>
    );

    return Object.entries(groupedData).map(([cycle, points]): CycleStats => {
      const voltages = points.map((p) => p.voltage || 0);
      const currents = points.map((p) => p.current || 0);
      const times = points.map((p) => p.time || 0);

      return {
        cycle_number: Number(cycle),
        avg_voltage: voltages.reduce((a, b) => a + b) / voltages.length,
        max_voltage: Math.max(...voltages),
        min_voltage: Math.min(...voltages),
        voltage_range: Math.max(...voltages) - Math.min(...voltages),
        avg_current: currents.reduce((a, b) => a + b) / currents.length,
        max_current: Math.max(...currents),
        min_current: Math.min(...currents),
        current_range: Math.max(...currents) - Math.min(...currents),
        duration: (Math.max(...times) - Math.min(...times)) / 1000, // in seconds
        measurements: points.length,
      };
    });
  }, [data, type]);

  // Available metrics for overview
  const overviewMetrics = useMemo(() => {
    if (type === "2_column") {
      return [
        { value: "cycle_number", label: "Cycle Number" },
        { value: "capacity", label: "Capacity" },
      ];
    }
    return [
      { value: "cycle_number", label: "Cycle Number" },
      { value: "avg_voltage", label: "Average Voltage" },
      { value: "max_voltage", label: "Maximum Voltage" },
      { value: "min_voltage", label: "Minimum Voltage" },
      { value: "voltage_range", label: "Voltage Range" },
      { value: "avg_current", label: "Average Current" },
      { value: "max_current", label: "Maximum Current" },
      { value: "min_current", label: "Minimum Current" },
      { value: "current_range", label: "Current Range" },
      { value: "duration", label: "Duration (s)" },
      { value: "measurements", label: "Measurements Count" },
    ];
  }, [type]);

  // Chart configuration
  const [config, setConfig] = useState<ChartConfig>({
    xAxis: "cycle_number",
    yAxis: type === "2_column" ? "capacity" : "avg_voltage",
    type: "line",
  });

  // Update config when type changes
  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      yAxis: type === "2_column" ? "capacity" : "avg_voltage",
    }));
    setSelectedCycle(null);
    setShowDetail(false);
  }, [type]);

  // Get available cycle numbers
  const cycles = useMemo(() => {
    const uniqueCycles = [...new Set(data.map((item) => item.cycle_number))];
    return uniqueCycles.sort((a, b) => a - b);
  }, [data]);

  // Prepare cycle detail data
  const cycleDetailData = useMemo(() => {
    if (!selectedCycle || type !== "4_column") return [];

    const cycleData = data
      .filter((point) => point.cycle_number === selectedCycle)
      .sort((a, b) => (a.time || 0) - (b.time || 0));

    if (cycleData.length === 0) return [];

    const startTime = cycleData[0].time || 0;
    return cycleData.map((point) => ({
      ...point,
      relativeTime: ((point.time || 0) - startTime) / 1000,
    }));
  }, [data, selectedCycle, type]);

  // Calculate domains for main chart
  const mainDomains = useMemo(() => {
    const chartData = type === "4_column" ? cycleStats : data;
    if (chartData.length === 0) return null;

    const xValues = chartData.map((item) =>
      Number((item as any)[config.xAxis])
    );
    const yValues = chartData.map((item) =>
      Number((item as any)[config.yAxis])
    );

    const validXValues = xValues.filter((x) => !isNaN(x));
    const validYValues = yValues.filter((y) => !isNaN(y));

    return {
      x: [Math.min(...validXValues), Math.max(...validXValues)],
      y: [Math.min(...validYValues), Math.max(...validYValues)],
    };
  }, [data, cycleStats, config.xAxis, config.yAxis, type]);

  // Calculate domains for cycle detail
  const detailDomains = useMemo(() => {
    if (!cycleDetailData.length) return null;

    return {
      time: [0, Math.max(...cycleDetailData.map((d) => d.relativeTime))],
      voltage: [
        Math.min(...cycleDetailData.map((d) => d.voltage || 0)),
        Math.max(...cycleDetailData.map((d) => d.voltage || 0)),
      ],
      current: [
        Math.min(...cycleDetailData.map((d) => d.current || 0)),
        Math.max(...cycleDetailData.map((d) => d.current || 0)),
      ],
    };
  }, [cycleDetailData]);

  // Handle chart click
  const handleChartClick = (point: any) => {
    if (type !== "4_column" || !point || !point.activePayload) return;

    const cycle = point.activePayload[0].payload.cycle_number;
    setSelectedCycle(cycle);
    setShowDetail(true);
  };

  const getMetricLabel = (metricValue: string): string => {
    const metric = overviewMetrics.find((m) => m.value === metricValue);
    return metric ? metric.label : metricValue;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      {/* Controls */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            id="x-axis-label"
          >
            X Axis
          </label>
          <select
            value={config.xAxis}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, xAxis: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            aria-labelledby="x-axis-label"
          >
            {overviewMetrics.map((metric) => (
              <option key={metric.value} value={metric.value}>
                {metric.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            id="y-axis-label"
          >
            Y Axis
          </label>
          <select
            value={config.yAxis}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, yAxis: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            aria-labelledby="y-axis-label"
          >
            {overviewMetrics
              .filter((m) => m.value !== config.xAxis)
              .map((metric) => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
          </select>
        </div>
        {type === "4_column" && (
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              id="cycle-select-label"
            >
              View Cycle Detail
            </label>
            <select
              value={selectedCycle || ""}
              onChange={(e) => {
                const cycle = Number(e.target.value);
                setSelectedCycle(cycle);
                setShowDetail(!!cycle);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              aria-labelledby="cycle-select-label"
            >
              <option value="">Select Cycle</option>
              {cycles.map((cycle) => (
                <option key={cycle} value={cycle}>
                  Cycle {cycle}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Charts container */}
      <div className={`flex ${showDetail ? "flex-col lg:flex-row" : ""} gap-4`}>
        {/* Main chart */}
        <div
          className={`h-[400px] ${showDetail ? "w-full lg:w-1/2" : "w-full"}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            {config.type === "line" ? (
              <LineChart
                data={type === "4_column" ? cycleStats : data}
                onClick={handleChartClick}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={config.xAxis}
                  domain={mainDomains?.x}
                  type="number"
                  label={{
                    value: getMetricLabel(config.xAxis),
                    position: "bottom",
                  }}
                />
                <YAxis
                  domain={mainDomains?.y}
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
                  dot={data.length < 100}
                  isAnimationActive={false}
                />
              </LineChart>
            ) : (
              <ScatterChart onClick={handleChartClick}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={config.xAxis}
                  domain={mainDomains?.x}
                  type="number"
                  label={{
                    value: getMetricLabel(config.xAxis),
                    position: "bottom",
                  }}
                />
                <YAxis
                  dataKey={config.yAxis}
                  domain={mainDomains?.y}
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
                <Scatter
                  data={type === "4_column" ? cycleStats : data}
                  fill="#0066B1"
                  isAnimationActive={false}
                />
              </ScatterChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Cycle detail */}
        {showDetail && selectedCycle && type === "4_column" && (
          <div
            className={`h-[400px] ${showDetail ? "w-full lg:w-1/2" : "w-full"}`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Cycle {selectedCycle} Detail ({cycleDetailData.length} points)
              </span>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close cycle detail"
              >
                Close
              </button>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cycleDetailData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="relativeTime"
                  domain={detailDomains?.time}
                  type="number"
                  label={{ value: "Time (s)", position: "bottom" }}
                />
                <YAxis
                  yAxisId="voltage"
                  domain={detailDomains?.voltage}
                  label={{
                    value: "Voltage (V)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <YAxis
                  yAxisId="current"
                  orientation="right"
                  domain={detailDomains?.current}
                  label={{
                    value: "Current (A)",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    value.toFixed(4),
                    name === "voltage" ? "Voltage (V)" : "Current (A)",
                  ]}
                  labelFormatter={(label: number) =>
                    `Time: ${label.toFixed(2)}s`
                  }
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
        )}
      </div>
    </div>
  );
};

export default ChartArea;
