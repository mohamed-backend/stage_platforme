import type { Investment } from './investment'

export interface Transaction {
  id: number
  user?: number
  investment?: number
  investment_detail?: Investment
  type: TransactionType
  transaction_type?: TransactionType
  amount: number
  reference?: string
  description?: string
  status: TransactionStatus
  created_at: string
  updated_at?: string
}

export type TransactionType = 'INVESTMENT' | 'REFUND' | 'WITHDRAWAL' | 'DEPOSIT'
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
