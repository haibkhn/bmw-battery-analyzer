import { useState } from "react";
import { BatteryData, CSVType, DataResponse } from "./types";
import FileUploadArea from "./components/upload/FileUploadArea";
import ChartArea from "./components/charts/ChartArea";
import MainLayout from "./components/layout/MainLayout";

function App() {
  const [data, setData] = useState<BatteryData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [csvType, setCSVType] = useState<CSVType>("2_column");

  const handleDataLoaded = (response: DataResponse) => {
    console.log("Data loaded:", response);
    setData(response.data);
    setCSVType(response.stats.type);

    if (response.data.length > 0) {
      const availableCols = Object.keys(response.data[0]).filter(
        (key) => key !== "id" && key !== "created_at"
      );
      console.log("Setting columns:", availableCols);
      setColumns(availableCols);
    }
  };

  return (
    <MainLayout>
      <FileUploadArea onDataLoaded={handleDataLoaded} />
      {data.length > 0 && columns.length > 0 && (
        <ChartArea data={data} type={csvType} />
      )}
    </MainLayout>
  );
}

export default App;
