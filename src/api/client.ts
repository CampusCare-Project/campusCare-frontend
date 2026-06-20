import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toast } from "sonner-native";

import { ENV } from "@/config/env";
import { resetToMainTabs } from "@/app/navigationRef";
import { emitUnauthorized } from "@/api/auth/authEvents";

export const TOKEN_KEY = "campuscare_token";
export const USER_KEY = "campuscare_user";

export const publicClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 30000,
});

export const privateClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 30000,
});

privateClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isHandlingUnauthorized = false;
let isHandlingForbidden = false;

privateClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Terjadi kesalahan";

    if (status === 401) {
      if (!isHandlingUnauthorized) {
        isHandlingUnauthorized = true;

        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);

        toast.error("Session sudah habis. Silakan login kembali.");

        emitUnauthorized();

        setTimeout(() => {
          isHandlingUnauthorized = false;
        }, 1000);
      }
    }

    if (status === 403) {
      if (!isHandlingForbidden) {
        isHandlingForbidden = true;

        toast.error(message || "Kamu tidak memiliki akses.");
        resetToMainTabs("Dashboard");

        setTimeout(() => {
          isHandlingForbidden = false;
        }, 1000);
      }
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || "Request gagal";
  }

  if (error instanceof Error) return error.message;

  return "Terjadi kesalahan";
}