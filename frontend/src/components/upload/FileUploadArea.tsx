import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
// import { Toast } from "@/components/ui/toast";
import Papa from "papaparse";

interface FileUploadAreaProps {
  onFileSelect: (file: File) => void;
}

const FileUploadArea = ({ onFileSelect }: FileUploadAreaProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileParsing = async (file: File) => {
    setLoading(true);
    setError(null);

    // Show file size in MB
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    try {
      // For large files, we'll show a loading state right in the upload area
      setSuccess(`Processing ${file.name} (${fileSizeMB} MB)...`);

      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        chunk: (results, parser) => {
          // Handle chunks for large files
          console.log("Processing chunk:", results.data.length, "rows");
        },
        complete: (results) => {
          setLoading(false);
          setSuccess(`Successfully loaded ${file.name}`);
          onFileSelect(file);
        },
        error: (error) => {
          setLoading(false);
          setError(`Error parsing file: ${error.message}`);
        },
      });
    } catch (err) {
      setLoading(false);
      setError("Error processing file");
    }
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files (non-CSV)
    if (rejectedFiles.length > 0) {
      setError("Please upload a CSV file");
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      handleFileParsing(file);
    }
  }, []);

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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bmw-blue mx-auto"></div>
            <p className="text-sm sm:text-base text-gray-500">
              Processing large CSV file, please wait...
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}

        {/* Status Messages */}
        {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
        {success && !loading && (
          <div className="mt-4 text-green-500 text-sm">{success}</div>
        )}
      </div>

      {/* Controls - only show when file is successfully loaded */}
      {success && !loading && !error && (
        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              X Axis
            </label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option>Select variable</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Y Axis
            </label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option>Select variable</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Chart Type
            </label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option>Line Chart</option>
              <option>Scatter Plot</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadArea;
