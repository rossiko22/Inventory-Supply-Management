export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success';
export type NotificationCategory = 'ORDER' | 'INVENTORY' | 'WAREHOUSE';

export interface AppNotification {
  id:         string;
  category:   NotificationCategory;
  severity:   NotificationSeverity;
  title:      string;
  message:    string;
  resourceId: string | null;
  read:       boolean;
  createdAt:  string;
}