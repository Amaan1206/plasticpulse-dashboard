import { useLocation } from 'react-router-dom'
import TopNav from './TopNav.jsx'

export default function Shell({ children }) {
  const location = useLocation()
  const isMapPage = location.pathname === '/dashboard/map'

  return (
    <div className="flex flex-col h-screen w-screen bg-ocean-950 overflow-hidden relative">
      {/* Ambient aurora background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-aurora opacity-60" />
        <div className="absolute inset-0 bg-grid-dots opacity-30" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(6,10,20,0.6)_100%)]" />
      </div>

      <TopNav />
      <main className={`flex-1 overflow-auto relative z-10 ${isMapPage ? 'p-0' : 'p-6 lg:p-8'}`}>
        <div className={`${isMapPage ? '' : 'max-w-[1400px] mx-auto'} animate-fade-in`}>
          {children}
        </div>
      </main>
    </div>
  )
}
