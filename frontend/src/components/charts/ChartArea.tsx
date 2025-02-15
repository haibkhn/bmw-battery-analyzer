import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";

interface ChartAreaProps {
  data: any[];
  xAxis: string;
  yAxis: string;
  chartType: "line" | "scatter";
}

const ChartArea = ({ data, xAxis, yAxis, chartType }: ChartAreaProps) => {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      [xAxis]: item[xAxis],
      [yAxis]: item[yAxis],
    }));
  }, [data, xAxis, yAxis]);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={xAxis}
                label={{ value: xAxis, position: "bottom" }}
              />
              <YAxis
                label={{ value: yAxis, angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={yAxis}
                stroke="#0066B1"
                dot={false}
              />
            </LineChart>
          ) : (
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={xAxis}
                label={{ value: xAxis, position: "bottom" }}
              />
              <YAxis
                dataKey={yAxis}
                label={{ value: yAxis, angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend />
              <Scatter data={chartData} fill="#0066B1" />
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartArea;
