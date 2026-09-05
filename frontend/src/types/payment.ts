export interface Payment {
  id: number
  investment?: number
  user?: number
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  reference?: string
  created_at: string
  confirmed_at?: string
}

export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'WALLET'
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
