import { useState, useCallback } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { MobileBottomNav } from './MobileBottomNav'

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPath: string
}

export function DashboardLayout({ children, currentPath }: DashboardLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const openSidebar = useCallback(() => setMobileSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setMobileSidebarOpen(false), [])

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      <Navbar onOpenSidebar={openSidebar} />
      <div className="flex min-h-[calc(100vh-var(--header-height))]">
        <Sidebar
          currentPath={currentPath}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={closeSidebar}
        />
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 lg:px-8 pb-24 lg:pb-12 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
