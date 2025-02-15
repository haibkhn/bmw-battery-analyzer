import { useState } from "react";
import Papa from "papaparse";

interface ParseResult {
  data: any[];
  columns: string[];
  error: string | null;
  loading: boolean;
}

export const useCSVParser = () => {
  const [parseResult, setParseResult] = useState<ParseResult>({
    data: [],
    columns: [],
    error: null,
    loading: false,
  });

  const parseCSV = async (file: File) => {
    setParseResult((prev) => ({ ...prev, loading: true, error: null }));

    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setParseResult({
              data: [],
              columns: [],
              error: "Error parsing CSV file",
              loading: false,
            });
            return;
          }

          setParseResult({
            data: results.data,
            columns: results.meta.fields || [],
            error: null,
            loading: false,
          });
          resolve(results);
        },
        error: (error) => {
          setParseResult({
            data: [],
            columns: [],
            error: error.message,
            loading: false,
          });
        },
      });
    });
  };

  return { parseCSV, ...parseResult };
};
