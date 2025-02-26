import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
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
import { FiRefreshCw } from "react-icons/fi";
import { downloadChartAsImage, downloadDataAsCSV } from "./downloadUtils";
import { DownloadMenu } from "./DownloadMenu";
import {
  ChartCustomization,
  ChartStyle,
  defaultChartStyle,
} from "./ChartCustomization";

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
  // Reference to chart container for downloads
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // State for domains and controls
  const [currentXDomain, setCurrentXDomain] = useState(domains.x);
  const [currentYDomain, setCurrentYDomain] = useState(domains.y);
  const [brushDomain, setBrushDomain] = useState<[number, number] | null>(null);
  const [showControls, setShowControls] = useState(false);

  // Chart style state
  const [chartStyle, setChartStyle] = useState<ChartStyle>(() => {
    return defaultChartStyle([
      {
        key: config.yAxis,
        name: getMetricLabel(config.yAxis),
        color: "#0066B1",
      },
    ]);
  });

  // Store initial style for reset
  const initialStyle = useRef(chartStyle);

  // Update domains when data or config changes
  useEffect(() => {
    setCurrentXDomain(domains.x);
    setCurrentYDomain(domains.y);
    setBrushDomain(null);

    // Update chart style when config changes
    const newStyle = defaultChartStyle([
      {
        key: config.yAxis,
        name: getMetricLabel(config.yAxis),
        color: "#0066B1",
      },
    ]);
    setChartStyle(newStyle);
    initialStyle.current = newStyle;
  }, [domains, config, getMetricLabel]);

  const handleReset = useCallback(() => {
    setCurrentXDomain(domains.x);
    setCurrentYDomain(domains.y);
    setBrushDomain(null);
    setChartStyle(initialStyle.current);
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

  // Handle downloads
  const handleDownloadImage = useCallback(() => {
    const title =
      chartStyle.title || `${getMetricLabel(config.yAxis)}-analysis`;
    downloadChartAsImage(
      chartContainerRef,
      `${title.replace(/\s+/g, "-").toLowerCase()}.png`
    );
  }, [chartStyle.title, config.yAxis, getMetricLabel]);

  const handleDownloadData = useCallback(() => {
    const title = chartStyle.title || `${getMetricLabel(config.yAxis)}-data`;
    downloadDataAsCSV(data, `${title.replace(/\s+/g, "-").toLowerCase()}.csv`);
  }, [data, chartStyle.title, config.yAxis, getMetricLabel]);

  return (
    <div
      className={`relative h-[400px] ${isDetailView ? "w-full lg:w-1/2" : "w-full"}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      ref={chartContainerRef}
    >
      {/* Title Display */}
      {chartStyle.title && (
        <div className="absolute top-2 left-0 right-0 text-center z-10">
          <h3 className="text-sm font-medium text-gray-700">
            {chartStyle.title}
          </h3>
        </div>
      )}

      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white/80 rounded-lg p-1 shadow">
          <ChartCustomization
            lines={chartStyle.lines}
            onLineStyleChange={(key, updates) => {
              setChartStyle((prev) => ({
                ...prev,
                lines: prev.lines.map((line) =>
                  line.key === key ? { ...line, ...updates } : line
                ),
              }));
            }}
            chartTitle={chartStyle.title}
            onTitleChange={(title) =>
              setChartStyle((prev) => ({ ...prev, title }))
            }
          />
          <button
            onClick={handleReset}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
            title="Reset View"
          >
            <FiRefreshCw size={16} />
          </button>
          <DownloadMenu
            onDownloadImage={handleDownloadImage}
            onDownloadData={handleDownloadData}
          />
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        {config.type === "line" ? (
          <LineChart
            data={data}
            onClick={onChartClick}
            margin={{
              top: chartStyle.title ? 30 : 10,
              right: 30,
              left: 60,
              bottom: 70,
            }}
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
            {chartStyle.lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                strokeDasharray={line.strokeDasharray}
                dot={showDots}
                isAnimationActive={false}
                connectNulls
              />
            ))}
          </LineChart>
        ) : (
          <ScatterChart
            onClick={onChartClick}
            margin={{
              top: chartStyle.title ? 30 : 10,
              right: 30,
              left: 60,
              bottom: 70,
            }}
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
            <Scatter
              data={data}
              fill={chartStyle.lines[0]?.color || "#0066B1"}
              isAnimationActive={false}
            />
          </ScatterChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
