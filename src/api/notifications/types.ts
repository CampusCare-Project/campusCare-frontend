export type NotificationType =
  | 'REPORT_CREATED'
  | 'REPORT_VERIFIED'
  | 'REPORT_ASSIGNED'
  | 'REPORT_IN_PROGRESS'
  | 'REPORT_RESOLVED'
  | 'REPORT_REJECTED'
  | 'REPORT_CANCELLED'
  | 'SYSTEM';

export type NotificationItem = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
};
