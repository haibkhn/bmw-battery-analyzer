import React, { useState, useRef, useEffect } from "react";
import { FiDownload, FiChevronDown } from "react-icons/fi";

// Download menu component
interface DownloadMenuProps {
  onDownloadImage: () => void;
  onDownloadData: () => void;
}

export const DownloadMenu: React.FC<DownloadMenuProps> = ({
  onDownloadImage,
  onDownloadData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded hover:bg-gray-200 text-gray-700 flex items-center gap-1"
        title="Download"
      >
        <FiDownload size={16} />
        <FiChevronDown size={12} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded shadow-lg py-2 z-20 w-40">
          <button
            className="w-full text-left px-4 py-1.5 hover:bg-gray-100 text-sm"
            onClick={() => {
              onDownloadImage();
              setIsOpen(false);
            }}
          >
            Download as PNG
          </button>
          <button
            className="w-full text-left px-4 py-1.5 hover:bg-gray-100 text-sm"
            onClick={() => {
              onDownloadData();
              setIsOpen(false);
            }}
          >
            Download Data (CSV)
          </button>
        </div>
      )}
    </div>
  );
};
