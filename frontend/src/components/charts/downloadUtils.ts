import React, { useState, useRef, useEffect } from "react";
import { FiDownload, FiChevronDown } from "react-icons/fi";

// Function to download chart as image
export const downloadChartAsImage = (
  containerRef: React.RefObject<HTMLDivElement>,
  filename = "chart.png"
) => {
  if (!containerRef.current) return;

  // Using html2canvas library
  import("html2canvas").then((html2canvas) => {
    const { default: convertToCanvas } = html2canvas;

    convertToCanvas(containerRef.current as HTMLElement, {
      backgroundColor: "#ffffff",
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
    }).then((canvas) => {
      // Convert canvas to blob and save
      canvas.toBlob((blob) => {
        if (blob) {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      });
    });
  });
};

// Function to download data as CSV
export const downloadDataAsCSV = (data: any[], filename = "chart-data.csv") => {
  if (!data || data.length === 0) return;

  // Convert data to CSV format
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((item) => {
    return Object.values(item)
      .map((value) => {
        // Handle values with commas by quoting
        if (typeof value === "string" && value.includes(",")) {
          return `"${value}"`;
        }
        return value;
      })
      .join(",");
  });

  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });

  // Create download link
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
