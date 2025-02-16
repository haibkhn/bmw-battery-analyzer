import axios from "axios";
import { UploadResponse, ProcessStatus, BatteryData } from "../types";

const BASE_URL = "http://localhost:3000/api/csv";

export const api = {
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async getStatus(
    fileId: string
  ): Promise<{ success: boolean; status: ProcessStatus }> {
    console.log("Requesting status for:", `${BASE_URL}/status/${fileId}`);
    const response = await axios.get(`${BASE_URL}/status/${fileId}`);
    return response.data;
  },

  async getData(params: {
    startCycle?: number;
    endCycle?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data: BatteryData[] }> {
    const response = await axios.get(`${BASE_URL}/data`, { params });
    return response.data;
  },
};
