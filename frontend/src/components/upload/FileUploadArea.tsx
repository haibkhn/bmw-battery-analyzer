import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { api } from "../../services/api";
import { BatteryData } from "../../types";

interface FileUploadAreaProps {
  onDataLoaded: (data: BatteryData[]) => void;
}

const FileUploadArea = ({ onDataLoaded }: FileUploadAreaProps) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(
    async (fileId: string) => {
      try {
        const { status } = await api.getStatus(fileId);

        if (status.status === "processing") {
          setProgress((status.processed / status.total) * 100);
          setTimeout(() => checkStatus(fileId), 500);
        } else if (status.status === "completed") {
          setProgress(100);
          // Add logging here
          console.log("Upload completed, fetching data...");
          const { data } = await api.getData();
          console.log("Received data:", data.length, "rows");
          onDataLoaded(data);
          setLoading(false);
        } else if (status.status === "error") {
          setError(status.error || "Error processing file");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error in checkStatus:", err);
        setError("Error checking file status");
        setLoading(false);
      }
    },
    [onDataLoaded]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Don't allow new uploads while processing
      if (loading) return;

      const file = acceptedFiles[0];
      if (!file) return;

      setLoading(true);
      setError(null);
      setProgress(0);

      try {
        const response = await api.uploadFile(file);
        if (response.success) {
          console.log(
            "Upload successful, checking status for:",
            response.fileId
          );
          // Add a small delay before first status check
          setTimeout(() => checkStatus(response.fileId), 500);
        } else {
          throw new Error(response.error || "Upload failed");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error uploading file");
        setLoading(false);
      }
    },
    [checkStatus, loading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
    disabled: loading, // Disable dropzone while processing
  });

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer
          ${isDragActive ? "border-bmw-blue bg-blue-50" : "border-gray-300 hover:border-bmw-blue"}
          ${loading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} disabled={loading} />

        {loading ? (
          <div className="space-y-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-bmw-blue h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">
              Processing CSV file... {Math.round(progress)}%
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm sm:text-base text-gray-500">
              Drag and drop your CSV file here, or click to select
            </p>
            <button
              className="mt-2 sm:mt-4 px-4 py-2 bg-bmw-blue text-white rounded-md
                hover:bg-bmw-darkBlue transition-colors text-sm sm:text-base"
              disabled={loading}
            >
              Select File
            </button>
          </div>
        )}

        {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
      </div>
    </div>
  );
};

export default FileUploadArea;
