import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { fetchReportDetailThunk, fetchReportsThunk } from '@/store/slices/reportSlice';
import { reportService } from './service';

export const useReports = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((s: RootState) => s.reports);
  return {
    ...state,
    fetchReports: (params?: Parameters<typeof reportService.list>[0]) => dispatch(fetchReportsThunk(params)).unwrap(),
    fetchReportDetail: (id: string) => dispatch(fetchReportDetailThunk(id)).unwrap(),
    createReport: reportService.create,
    verifyReport: reportService.verify,
    rejectReport: reportService.reject,
    assignReport: reportService.assign,
    updateStatus: reportService.updateStatus,
    addNote: reportService.addNote,
    addMedia: reportService.addMedia,
    feedback: reportService.feedback,
  };
};
