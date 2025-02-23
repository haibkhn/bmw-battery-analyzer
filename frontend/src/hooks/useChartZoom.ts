import { useState, useCallback } from "react";

interface ZoomState {
  domain: {
    x: [number, number];
    y: [number, number];
  };
  mode: "zoom" | "pan" | "none";
}

export const useChartZoom = (initialDomain: ZoomState["domain"]) => {
  const [zoomState, setZoomState] = useState<ZoomState>({
    domain: initialDomain,
    mode: "none",
  });

  const handleZoomIn = useCallback(() => {
    setZoomState((prev) => ({
      ...prev,
      mode: "zoom",
    }));
  }, []);

  const handlePan = useCallback(() => {
    setZoomState((prev) => ({
      ...prev,
      mode: "pan",
    }));
  }, []);

  const handleReset = useCallback(() => {
    setZoomState({
      domain: initialDomain,
      mode: "none",
    });
  }, [initialDomain]);

  const handleDomainChange = useCallback((newDomain: ZoomState["domain"]) => {
    setZoomState((prev) => ({
      ...prev,
      domain: newDomain,
    }));
  }, []);

  return {
    zoomState,
    handleZoomIn,
    handlePan,
    handleReset,
    handleDomainChange,
  };
};
