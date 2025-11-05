export enum NotificationErrors {
  NOTIFICATION_NOT_FOUND = 'Notification not found',
  USER_NOT_AUTHORIZED = 'User not authorized to access this notification',
  INVALID_NOTIFICATION_TYPE = 'Invalid notification type',
  FAILED_TO_CREATE = 'Failed to create notification',
  FAILED_TO_UPDATE = 'Failed to update notification',
  FAILED_TO_DELETE = 'Failed to delete notification',
}

export enum NotificationSuccess {
  NOTIFICATION_CREATED = 'Notification created successfully',
  NOTIFICATION_UPDATED = 'Notification updated successfully',
  NOTIFICATION_DELETED = 'Notification deleted successfully',
  NOTIFICATION_FOUND = 'Notification found successfully',
  NOTIFICATIONS_RETRIEVED = 'Notifications retrieved successfully',
  NOTIFICATIONS_MARKED_READ = 'All notifications marked as read',
  UNREAD_COUNT_RETRIEVED = 'Unread notification count retrieved successfully',
}
