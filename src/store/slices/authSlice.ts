import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService } from '@/api/auth/service';
import type { LoginPayload, RegisterPayload, User } from '@/api/auth/types';

export type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  bootstrapping: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  bootstrapping: true,
  error: null,
};

export const restoreSessionThunk = createAsyncThunk('auth/restore', authService.restoreSession);
export const loginThunk = createAsyncThunk('auth/login', (payload: LoginPayload) => authService.login(payload));
export const registerThunk = createAsyncThunk('auth/register', (payload: RegisterPayload) => authService.register(payload));
export const logoutThunk = createAsyncThunk('auth/logout', authService.logout);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
  clearAuth: (state) => {
    state.token = null;
    state.user = null;
    state.loading = false;
  },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSessionThunk.pending, (state) => {
        state.bootstrapping = true;
      })
      .addCase(restoreSessionThunk.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.bootstrapping = false;
      })
      .addCase(restoreSessionThunk.rejected, (state) => {
        state.bootstrapping = false;
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login gagal';
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});


export default authSlice.reducer;
export const { clearAuth } = authSlice.actions;