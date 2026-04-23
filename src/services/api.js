import axios from "axios";

const BASE_URL = "http://localhost:8000";

export const initiateScan = async (url) => {
  const response = await axios.post(`${BASE_URL}/scan?url=${url}`);
  return response.data.scan_id;
};

export const checkScanStatus = async (scanId) => {
  const response = await axios.get(`${BASE_URL}/scan/${scanId}/status`);
  return response.data;
};

export const pollScanResult = async (scanId) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const data = await checkScanStatus(scanId);
        if (data.status === 'completed') {
          clearInterval(interval);
          resolve(data);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          reject(new Error("Scan failed on server"));
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 2000);
  });
};

// Simple scan function as requested
export const scanWebsite = async (url) => {
  const response = await axios.get(`${BASE_URL}/scan?url=${url}`);
  return response.data;
};
