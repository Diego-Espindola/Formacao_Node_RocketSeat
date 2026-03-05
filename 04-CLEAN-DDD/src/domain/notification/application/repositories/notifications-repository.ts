import { Notification } from '../../enterprise/entities/notification.js'

export interface NotificationsRepository {
  create(notification: Notification): Promise<void>
}