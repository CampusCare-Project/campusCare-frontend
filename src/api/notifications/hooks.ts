import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { fetchNotificationsThunk, fetchUnreadCountThunk, markAllReadThunk, markReadThunk } from '@/store/slices/notificationSlice';

export function useNotifications() {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((s: RootState) => s.notifications);
  return {
    ...state,
    fetchNotifications: () => dispatch(fetchNotificationsThunk()).unwrap(),
    fetchUnreadCount: () => dispatch(fetchUnreadCountThunk()).unwrap(),
    markRead: (id: string) => dispatch(markReadThunk(id)).unwrap(),
    markAllRead: () => dispatch(markAllReadThunk()).unwrap(),
  };
}
