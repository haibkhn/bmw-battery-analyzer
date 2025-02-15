import MainLayout from "./components/layout/MainLayout";
import FileUploadArea from "./components/upload/FileUploadArea";

function App() {
  const handleFileSelect = (file: File) => {
    console.log("Selected file:", file);
  };

  return (
    <MainLayout>
      <FileUploadArea onFileSelect={handleFileSelect} />
    </MainLayout>
  );
}

export default App;
