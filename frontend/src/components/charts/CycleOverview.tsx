import React, { useRef, useState, useCallback, useMemo } from "react";
import { BatteryData } from "../../types";
import { ChartWithControls } from "./ChartWithControls";
import {
  ChartCustomization,
  ChartStyle,
  defaultChartStyle,
} from "./ChartCustomization";
import { downloadChartAsImage, downloadDataAsCSV } from "./downloadUtils";
import { DownloadMenu } from "./DownloadMenu";
import { FiRefreshCw } from "react-icons/fi";

interface CycleOverviewProps {
  data: BatteryData[];
  cycles: number[];
}

export const CycleOverview: React.FC<CycleOverviewProps> = ({
  data,
  cycles,
}) => {
  // References to chart containers for downloads
  const voltageChartRef = useRef<HTMLDivElement>(null);
  const currentChartRef = useRef<HTMLDivElement>(null);

  // State for controls
  const [showVoltageControls, setShowVoltageControls] = useState(false);
  const [showCurrentControls, setShowCurrentControls] = useState(false);

  // Chart style states
  const [voltageChartStyle, setVoltageChartStyle] = useState<ChartStyle>(() =>
    defaultChartStyle([
      { key: "peak_voltage", name: "Peak Voltage", color: "#0066B1" },
      { key: "avg_voltage", name: "Average Voltage", color: "#00B100" },
      { key: "min_voltage", name: "Min Voltage", color: "#FF0000" },
    ])
  );

  const [currentChartStyle, setCurrentChartStyle] = useState<ChartStyle>(() =>
    defaultChartStyle([
      { key: "peak_current", name: "Peak Current", color: "#B100B1" },
      { key: "avg_current", name: "Average Current", color: "#B16600" },
      { key: "min_current", name: "Min Current", color: "#00B1B1" },
    ])
  );

  // Store initial styles for reset
  const initialVoltageStyle = useRef(voltageChartStyle);
  const initialCurrentStyle = useRef(currentChartStyle);

  // Calculate summary data and domains
  const { summaryData, domains } = useMemo(() => {
    const summaries = cycles.map((cycleNum) => {
      const cycleData = data.filter((d) => d.cycle_number === cycleNum);

      const voltages = cycleData.map((d) => d.voltage || 0);
      const currents = cycleData.map((d) => d.current || 0);
      const times = cycleData.map((d) => d.time || 0);

      return {
        cycle_number: cycleNum,
        avg_voltage: voltages.reduce((a, b) => a + b, 0) / voltages.length,
        peak_voltage: Math.max(...voltages),
        min_voltage: Math.min(...voltages),
        avg_current: currents.reduce((a, b) => a + b, 0) / currents.length,
        peak_current: Math.max(...currents),
        min_current: Math.min(...currents),
        duration: (Math.max(...times) - Math.min(...times)) / 1000,
      };
    });

    // Calculate domains with padding
    const getPaddedDomain = (values: number[], padding = 0.05) => {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;
      return [min - range * padding, max + range * padding] as [number, number];
    };

    const voltageDomain = getPaddedDomain([
      ...summaries.map((s) => s.peak_voltage),
      ...summaries.map((s) => s.avg_voltage),
      ...summaries.map((s) => s.min_voltage),
    ]);

    const currentDomain = getPaddedDomain([
      ...summaries.map((s) => s.peak_current),
      ...summaries.map((s) => s.avg_current),
      ...summaries.map((s) => s.min_current),
    ]);

    return {
      summaryData: summaries,
      domains: {
        voltage: voltageDomain,
        current: currentDomain,
        cycles: [Math.min(...cycles), Math.max(...cycles)] as [number, number],
      },
    };
  }, [data, cycles]);

  // Handle resets
  const handleVoltageReset = useCallback(() => {
    setVoltageChartStyle(initialVoltageStyle.current);
  }, []);

  const handleCurrentReset = useCallback(() => {
    setCurrentChartStyle(initialCurrentStyle.current);
  }, []);

  // Handle downloads
  const handleVoltageDownloadImage = useCallback(() => {
    const title = voltageChartStyle.title || "voltage-analysis";
    downloadChartAsImage(
      voltageChartRef,
      `${title.replace(/\s+/g, "-").toLowerCase()}.png`
    );
  }, [voltageChartStyle.title]);

  const handleVoltageDownloadData = useCallback(() => {
    const title = voltageChartStyle.title || "voltage-data";
    downloadDataAsCSV(
      summaryData,
      `${title.replace(/\s+/g, "-").toLowerCase()}.csv`
    );
  }, [summaryData, voltageChartStyle.title]);

  const handleCurrentDownloadImage = useCallback(() => {
    const title = currentChartStyle.title || "current-analysis";
    downloadChartAsImage(
      currentChartRef,
      `${title.replace(/\s+/g, "-").toLowerCase()}.png`
    );
  }, [currentChartStyle.title]);

  const handleCurrentDownloadData = useCallback(() => {
    const title = currentChartStyle.title || "current-data";
    downloadDataAsCSV(
      summaryData,
      `${title.replace(/\s+/g, "-").toLowerCase()}.csv`
    );
  }, [summaryData, currentChartStyle.title]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Voltage Chart */}
      <div
        className="relative h-[400px]"
        onMouseEnter={() => setShowVoltageControls(true)}
        onMouseLeave={() => setShowVoltageControls(false)}
        ref={voltageChartRef}
      >
        {/* Title Display */}
        {voltageChartStyle.title && (
          <div className="absolute top-2 left-0 right-0 text-center z-10">
            <h3 className="text-sm font-medium text-gray-700">
              {voltageChartStyle.title}
            </h3>
          </div>
        )}

        {/* Controls Overlay */}
        {showVoltageControls && (
          <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white/80 rounded-lg p-1 shadow">
            <ChartCustomization
              lines={voltageChartStyle.lines}
              onLineStyleChange={(key, updates) => {
                setVoltageChartStyle((prev) => ({
                  ...prev,
                  lines: prev.lines.map((line) =>
                    line.key === key ? { ...line, ...updates } : line
                  ),
                }));
              }}
              chartTitle={voltageChartStyle.title}
              onTitleChange={(title) =>
                setVoltageChartStyle((prev) => ({ ...prev, title }))
              }
            />
            <button
              onClick={handleVoltageReset}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
              title="Reset View"
            >
              <FiRefreshCw size={16} />
            </button>
            <DownloadMenu
              onDownloadImage={handleVoltageDownloadImage}
              onDownloadData={handleVoltageDownloadData}
            />
          </div>
        )}

        <ChartWithControls
          data={summaryData}
          xAxis={{
            key: "cycle_number",
            label: "Cycle Number",
            domain: domains.cycles,
          }}
          yAxis={{
            key: "voltage",
            label: "Voltage (V)",
            domain: domains.voltage,
          }}
          lines={voltageChartStyle.lines}
        />
      </div>

      {/* Current Chart */}
      <div
        className="relative h-[400px]"
        onMouseEnter={() => setShowCurrentControls(true)}
        onMouseLeave={() => setShowCurrentControls(false)}
        ref={currentChartRef}
      >
        {/* Title Display */}
        {currentChartStyle.title && (
          <div className="absolute top-2 left-0 right-0 text-center z-10">
            <h3 className="text-sm font-medium text-gray-700">
              {currentChartStyle.title}
            </h3>
          </div>
        )}

        {/* Controls Overlay */}
        {showCurrentControls && (
          <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white/80 rounded-lg p-1 shadow">
            <ChartCustomization
              lines={currentChartStyle.lines}
              onLineStyleChange={(key, updates) => {
                setCurrentChartStyle((prev) => ({
                  ...prev,
                  lines: prev.lines.map((line) =>
                    line.key === key ? { ...line, ...updates } : line
                  ),
                }));
              }}
              chartTitle={currentChartStyle.title}
              onTitleChange={(title) =>
                setCurrentChartStyle((prev) => ({ ...prev, title }))
              }
            />
            <button
              onClick={handleCurrentReset}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
              title="Reset View"
            >
              <FiRefreshCw size={16} />
            </button>
            <DownloadMenu
              onDownloadImage={handleCurrentDownloadImage}
              onDownloadData={handleCurrentDownloadData}
            />
          </div>
        )}

        <ChartWithControls
          data={summaryData}
          xAxis={{
            key: "cycle_number",
            label: "Cycle Number",
            domain: domains.cycles,
          }}
          yAxis={{
            key: "current",
            label: "Current (A)",
            domain: domains.current,
          }}
          lines={currentChartStyle.lines}
        />
      </div>
    </div>
  );
};

export default CycleOverview;
