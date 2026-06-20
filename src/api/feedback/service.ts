import { reportService } from '@/api/reports/service';
import type { FeedbackPayload } from './types';
export const feedbackService = {
  submit: (reportId: string, payload: FeedbackPayload) => reportService.feedback(reportId, payload),
};
