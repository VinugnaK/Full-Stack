import { createContext, useContext, useMemo, useState } from 'react'

const LayoutContext = createContext(null)

export function LayoutProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const value = useMemo(() => ({
    isSidebarOpen,
    openSidebar: () => setIsSidebarOpen(true),
    closeSidebar: () => setIsSidebarOpen(false),
    toggleSidebar: () => setIsSidebarOpen((current) => !current),
  }), [isSidebarOpen])

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}
