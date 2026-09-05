export interface Notification {
  id: number
  user?: number
  title: string
  message: string
  type: NotificationType
  notification_type?: NotificationType
  is_read: boolean
  created_at: string
}

export type NotificationType = 'INVESTMENT' | 'PAYMENT' | 'TRANSACTION' | 'MARKET' | 'PROJECT' | 'SYSTEM'
