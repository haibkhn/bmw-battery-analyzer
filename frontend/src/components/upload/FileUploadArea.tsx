import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadAreaProps {
  onFileSelect: (file: File) => void;
}

const FileUploadArea = ({ onFileSelect }: FileUploadAreaProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
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
        `}
      >
        <input {...getInputProps()} />
        <p className="text-sm sm:text-base text-gray-500">
          Drag and drop your CSV file here, or click to select
        </p>
        <button
          className="mt-2 sm:mt-4 px-4 py-2 bg-bmw-blue text-white rounded-md
          hover:bg-bmw-darkBlue transition-colors text-sm sm:text-base"
        >
          Select File
        </button>
      </div>

      {/* Basic Controls */}
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
    </div>
  );
};

export default FileUploadArea;
