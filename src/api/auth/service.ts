import AsyncStorage from "@react-native-async-storage/async-storage";
import { privateClient, publicClient, TOKEN_KEY, USER_KEY } from "@/api/client";
import type { ApiResponse } from "@/types/common";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "./types";

function normalizeAuthResponse(raw: any): AuthResponse {
  const data = raw?.data ?? raw;

  const token =
    data?.token ||
    data?.accessToken ||
    data?.data?.token ||
    data?.data?.accessToken;

  const user = data?.user || data?.data?.user;

  if (!token || !user) {
    throw new Error("Format response login tidak sesuai");
  }

  return { token, user };
}

export const authService = {
  async login(payload: LoginPayload) {
    const response = await publicClient.post("/api/auth/login", payload);
    const auth = normalizeAuthResponse(response.data);

    await AsyncStorage.setItem(TOKEN_KEY, auth.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(auth.user));

    return auth;
  },
// this stuff wont be used btw
  async register(payload: RegisterPayload) {
    const response = await publicClient.post<ApiResponse<User>>(
      "/api/auth/register",
      payload
    );

    return response.data.data;
  },

  async getUserById(id: string) {
  const response = await privateClient.get(`/api/auth/users/${id}`);

  const data = response.data?.data ?? response.data;

  return Array.isArray(data) ? data[0] : data;
},

  async me() {
    const response = await privateClient.get("/api/auth/verify");
    const user = response.data?.data?.user || response.data?.user;

    return user as User;
  },

  async logout() {
    try {
      await privateClient.post("/api/auth/logout");
    } finally {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    }
  },

  async restoreSession() {
    const [token, userRaw] = await AsyncStorage.multiGet([
      TOKEN_KEY,
      USER_KEY,
    ]);

    const savedToken = token[1];
    const savedUser = userRaw[1] ? (JSON.parse(userRaw[1]) as User) : null;

    return {
      token: savedToken,
      user: savedUser,
    };
  },
};