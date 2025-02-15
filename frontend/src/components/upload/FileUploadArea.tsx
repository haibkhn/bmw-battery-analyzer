import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { api } from "../../services/api";

interface FileUploadAreaProps {
  onDataLoaded: (data: any[]) => void;
}

const FileUploadArea = ({ onDataLoaded }: FileUploadAreaProps) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);

  const checkUploadStatus = useCallback(
    async (id: string) => {
      try {
        const { status } = await api.getUploadStatus(id);
        if (status.status === "processing") {
          setProgress((status.processed / status.total) * 100);
          setTimeout(() => checkUploadStatus(id), 1000); // Poll every second
        } else if (status.status === "completed") {
          setProgress(100);
          const { data } = await api.getData({});
          onDataLoaded(data);
          setLoading(false);
        } else if (status.status === "error") {
          setError("Error processing file");
          setLoading(false);
        }
      } catch (err) {
        setError("Error checking upload status");
        setLoading(false);
      }
    },
    [onDataLoaded]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setLoading(true);
      setError(null);
      setProgress(0);

      try {
        const { fileId } = await api.uploadCSV(file);
        setFileId(fileId);
        checkUploadStatus(fileId);
      } catch (err) {
        setError("Error uploading file");
        setLoading(false);
      }
    },
    [checkUploadStatus]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
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
            <div className="w-full">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Processing CSV file...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            <p className="text-sm text-gray-500">
              Large files may take a few moments to process
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
