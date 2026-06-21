export type FeedbackPayload = { rating: number; comment?: string };

export type ReportFeedback = {
  id: string;
  reportId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  report?: {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    reporterId: string;
    assignedTechnicianId?: string | null;
    locationText?: string | null;
    createdAt: string;
    resolvedAt?: string | null;
    category?: any;
    building?: any;
    room?: any;
  };
};