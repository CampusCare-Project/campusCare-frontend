import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getLocalReports, syncPendingReports } from '@/offline/sync';

export type OfflineState = {
  pendingCount: number;
  syncing: boolean;
  lastSyncAt?: string | null;
};

const initialState: OfflineState = {
  pendingCount: 0,
  syncing: false,
  lastSyncAt: null,
};

export const loadOfflineQueueThunk = createAsyncThunk('offline/load', getLocalReports);
export const syncOfflineQueueThunk = createAsyncThunk('offline/sync', syncPendingReports);

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadOfflineQueueThunk.fulfilled, (state, action) => {
        state.pendingCount = action.payload.length;
      })
      .addCase(syncOfflineQueueThunk.pending, (state) => {
        state.syncing = true;
      })
      .addCase(syncOfflineQueueThunk.fulfilled, (state, action) => {
        state.syncing = false;
        state.pendingCount = action.payload.remaining;
        state.lastSyncAt = new Date().toISOString();
      })
      .addCase(syncOfflineQueueThunk.rejected, (state) => {
        state.syncing = false;
      });
  },
});

export default offlineSlice.reducer;
