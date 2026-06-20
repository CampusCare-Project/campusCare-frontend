import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { reportService, type ReportQuery } from '@/api/reports/service';
import type { Report } from '@/api/reports/types';

export type ReportState = {
  items: Report[];
  selected: Report | null;
  loading: boolean;
  error: string | null;
};

const initialState: ReportState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
};

export const fetchReportsThunk = createAsyncThunk('reports/list', (params?: ReportQuery) => reportService.list(params));
export const fetchReportDetailThunk = createAsyncThunk('reports/detail', (id: string) => reportService.detail(id));

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearSelectedReport: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
      })
      .addCase(fetchReportsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Gagal mengambil laporan';
      })
      .addCase(fetchReportDetailThunk.fulfilled, (state, action) => {
        state.selected = action.payload;
      });
  },
});

export const { clearSelectedReport } = reportSlice.actions;
export default reportSlice.reducer;
