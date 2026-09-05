import { cn } from '@/utils'

interface TableProps {
  children: React.ReactNode
  className?: string
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="table-container">
      <table className={cn('table-fintech', className)}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, className }: TableProps) {
  return (
    <thead className={className}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className }: TableProps) {
  return <tbody className={className}>{children}</tbody>
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={className}>
      {children}
    </tr>
  )
}

export function TableCell({ children, className, align = 'left', mono = false }: TableProps & { align?: 'left' | 'center' | 'right'; mono?: boolean }) {
  return (
    <td
      className={cn(
        align === 'right' && 'table-cell-numeric',
        align === 'center' && 'text-center',
        mono && 'table-cell-mono',
        className
      )}
    >
      {children}
    </td>
  )
}

export function TableHead({ children, className, align = 'left' }: TableProps & { align?: 'left' | 'center' | 'right' }) {
  return (
    <th
      className={cn(
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
    >
      {children}
    </th>
  )
}
