import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { loginThunk, logoutThunk, registerThunk, restoreSessionThunk } from '@/store/slices/authSlice';
import type { RegisterPayload } from './types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  return {
    ...auth,
    login: (identifier: string, password: string) => dispatch(loginThunk({ identifier, password })).unwrap(),
    register: (payload: RegisterPayload) => dispatch(registerThunk(payload)).unwrap(),
    logout: () => dispatch(logoutThunk()).unwrap(),
    restore: () => dispatch(restoreSessionThunk()).unwrap(),
  };
};
