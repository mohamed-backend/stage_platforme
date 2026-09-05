import { cn } from '@/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
  hover?: boolean
  style?: React.CSSProperties
}

export function Card({ children, className, padding = true, hover = false, style }: CardProps) {
  return (
    <div
      style={style}
      className={cn(
        'card',
        padding && 'card-padded',
        hover && 'card-hoverable',
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
  return (
    <div className={cn('card-header', className)}>
      <div>{children}</div>
      {action}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
  as?: 'h2' | 'h3' | 'h4'
}

export function CardTitle({ children, className, as: Tag = 'h3' }: CardTitleProps) {
  return (
    <Tag className={cn('card-title', className)}>
      {children}
    </Tag>
  )
}
