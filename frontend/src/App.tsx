import { useState } from "react";
import MainLayout from "./components/layout/MainLayout";
import FileUploadArea from "./components/upload/FileUploadArea";
import ChartArea from "./components/charts/ChartArea";
import { BatteryData } from "./types";

function App() {
  const [data, setData] = useState<BatteryData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  const handleDataLoaded = (newData: BatteryData[]) => {
    setData(newData);
    if (newData.length > 0) {
      setColumns(Object.keys(newData[0]));
    }
  };

  return (
    <MainLayout>
      <FileUploadArea onDataLoaded={handleDataLoaded} />
      {data.length > 0 && <ChartArea data={data} availableColumns={columns} />}
    </MainLayout>
  );
}

export default App;
