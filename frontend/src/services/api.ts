import axios from "axios";
import {
  BatteryData,
  ProcessStatus,
  UploadResponse,
  DataResponse,
} from "../types";

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
    const response = await axios.get(`${BASE_URL}/status/${fileId}`);
    return response.data;
  },

  async getData(): Promise<DataResponse> {
    console.log("Fetching data from API...");
    const response = await axios.get<DataResponse>(`${BASE_URL}/data`);
    console.log("API Response:", response.data);
    return response.data;
  },
};
