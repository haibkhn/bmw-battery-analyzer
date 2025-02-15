import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

export const api = {
  async uploadCSV(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${BASE_URL}/csv/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async getUploadStatus(fileId: string) {
    const response = await axios.get(`${BASE_URL}/csv/status/${fileId}`);
    return response.data;
  },

  async getData(params: {
    startCycle?: number;
    endCycle?: number;
    limit?: number;
    offset?: number;
  }) {
    const response = await axios.get(`${BASE_URL}/csv/data`, { params });
    return response.data;
  },
};
