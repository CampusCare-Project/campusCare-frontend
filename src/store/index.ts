import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import reportReducer from './slices/reportSlice';
import notificationReducer from './slices/notificationSlice';
import offlineReducer from './slices/offlineSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    reports: reportReducer,
    notifications: notificationReducer,
    offline: offlineReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
