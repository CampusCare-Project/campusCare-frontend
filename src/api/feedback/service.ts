import { reportService } from '@/api/reports/service';
import { privateClient } from "@/api/client";
import type { FeedbackPayload,ReportFeedback } from './types';
export const feedbackService = {
  submit: (reportId: string, payload: FeedbackPayload) => reportService.feedback(reportId, payload),


};
 export async function getReportFeedback(reportId: string): Promise<ReportFeedback | null> {
  try {
    const response = await privateClient.get(
      `/api/reports/${reportId}/feedback`
    );

    return response.data?.data ?? null;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }

    throw error;
  }
}