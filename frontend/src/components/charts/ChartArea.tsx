import React, { useState, useMemo, useEffect } from "react";
import { BatteryData, CSVType, ChartConfig } from "../../types";
import { useMetrics } from "../../hooks/useMetrics";
import { useCycleStats } from "../../hooks/useCycleStats";
import { ChartControls } from "./ChartControls";
import { MainChart } from "./MainChart";
import { CycleDetailChart } from "./CycleDetailChart";

interface ChartAreaProps {
  data: BatteryData[];
  type: CSVType;
}

const ChartArea: React.FC<ChartAreaProps> = ({ data, type }) => {
  const [selectedCycle, setSelectedCycle] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [config, setConfig] = useState<ChartConfig>({
    xAxis: "cycle_number",
    yAxis: type === "2_column" ? "capacity" : "avg_voltage",
    type: "line",
  });

  const cycleStats = useCycleStats(data, type);
  const metrics = useMetrics(type);

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

  // Calculate domains for main chart
  const mainDomains = useMemo(() => {
    const chartData = type === "4_column" ? cycleStats : data;
    if (chartData.length === 0)
      return {
        x: [0, 0] as [number, number],
        y: [0, 0] as [number, number],
      };

    const xValues = chartData.map((item) =>
      Number((item as any)[config.xAxis])
    );
    const yValues = chartData.map((item) =>
      Number((item as any)[config.yAxis])
    );

    const validXValues = xValues.filter((x) => !isNaN(x));
    const validYValues = yValues.filter((y) => !isNaN(y));

    return {
      x: [Math.min(...validXValues), Math.max(...validXValues)] as [
        number,
        number,
      ],
      y: [Math.min(...validYValues), Math.max(...validYValues)] as [
        number,
        number,
      ],
    };
  }, [data, cycleStats, config.xAxis, config.yAxis, type]);

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

  // Calculate domains for cycle detail
  const detailDomains = useMemo(() => {
    if (!cycleDetailData.length)
      return {
        time: [0, 0] as [number, number],
        voltage: [0, 0] as [number, number],
        current: [0, 0] as [number, number],
      };

    const timeMax = Math.max(...cycleDetailData.map((d) => d.relativeTime));
    const voltageValues = cycleDetailData.map((d) => d.voltage || 0);
    const currentValues = cycleDetailData.map((d) => d.current || 0);

    return {
      time: [0, timeMax] as [number, number],
      voltage: [Math.min(...voltageValues), Math.max(...voltageValues)] as [
        number,
        number,
      ],
      current: [Math.min(...currentValues), Math.max(...currentValues)] as [
        number,
        number,
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
    const metric = metrics.find((m) => m.value === metricValue);
    return metric ? metric.label : metricValue;
  };

  const handleCycleChange = (cycle: number | null) => {
    setSelectedCycle(cycle);
    setShowDetail(!!cycle);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <ChartControls
        config={config}
        onConfigChange={setConfig}
        metrics={metrics}
        selectedCycle={selectedCycle}
        onCycleChange={handleCycleChange}
        cycles={cycles}
        type={type}
      />

      <div className={`flex ${showDetail ? "flex-col lg:flex-row" : ""} gap-4`}>
        <MainChart
          data={type === "4_column" ? cycleStats : data}
          config={config}
          domains={mainDomains}
          onChartClick={handleChartClick}
          getMetricLabel={getMetricLabel}
          showDots={data.length < 100}
        />

        {showDetail && selectedCycle && type === "4_column" && (
          <CycleDetailChart
            cycleData={cycleDetailData}
            onClose={() => setShowDetail(false)}
            cycleNumber={selectedCycle}
            domains={detailDomains}
          />
        )}
      </div>
    </div>
  );
};

export default ChartArea;
