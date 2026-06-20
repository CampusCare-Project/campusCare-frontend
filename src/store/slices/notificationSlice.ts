import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { notificationService } from '@/api/notifications/service';
import type { NotificationItem } from '@/api/notifications/types';

export type NotificationState = {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
};

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  loading: false,
};

export const fetchNotificationsThunk = createAsyncThunk('notifications/list', () => notificationService.list({ limit: 50 }));
export const fetchUnreadCountThunk = createAsyncThunk('notifications/unreadCount', notificationService.unreadCount);
export const markReadThunk = createAsyncThunk('notifications/markRead', (id: string) => notificationService.markRead(id));
export const markAllReadThunk = createAsyncThunk('notifications/markAllRead', notificationService.markAllRead);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => { state.loading = true; })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
      })
      .addCase(fetchUnreadCountThunk.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count;
      })
      .addCase(markReadThunk.fulfilled, (state, action) => {
        const item = state.items.find((n) => n.id === action.payload.id);
        if (item) item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markAllReadThunk.fulfilled, (state) => {
        state.items = state.items.map((item) => ({ ...item, isRead: true }));
        state.unreadCount = 0;
      });
  },
});

export default notificationSlice.reducer;
