import { useState } from 'react';
import { feedbackService } from './service';
import type { FeedbackPayload } from './types';
export function useFeedback() {
  const [loading, setLoading] = useState(false);
  const submit = async (reportId: string, payload: FeedbackPayload) => {
    setLoading(true);
    try { return await feedbackService.submit(reportId, payload); }
    finally { setLoading(false); }
  };
  return { loading, submit };
}
