import { useState } from "react";
import MainLayout from "./components/layout/MainLayout";
import FileUploadArea from "./components/upload/FileUploadArea";
import ChartArea from "./components/charts/ChartArea";

function App() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartConfig, setChartConfig] = useState({
    xAxis: "",
    yAxis: "",
    chartType: "line" as const,
  });

  const handleDataLoaded = (data: any[]) => {
    setChartData(data);
    if (data.length > 0) {
      const columns = Object.keys(data[0]);
      setChartConfig((prev) => ({
        ...prev,
        xAxis: columns[0],
        yAxis: columns[1],
      }));
    }
  };

  return (
    <MainLayout>
      <FileUploadArea onDataLoaded={handleDataLoaded} />
      {chartData.length > 0 && (
        <ChartArea
          data={chartData}
          xAxis={chartConfig.xAxis}
          yAxis={chartConfig.yAxis}
          chartType={chartConfig.chartType}
        />
      )}
    </MainLayout>
  );
}

export default App;
