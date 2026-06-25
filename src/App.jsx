import { Routes, Route } from 'react-router-dom'
import { WebSocketProvider } from './context/WebSocketContext.jsx'
import Shell from './components/layout/Shell.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LiveFeed from './pages/LiveFeed.jsx'
import Analytics from './pages/Analytics.jsx'
import WasteMap from './pages/WasteMap.jsx'
import BinMonitor from './pages/BinMonitor.jsx'
import Community from './pages/Community.jsx'
import LearningHub from './pages/LearningHub.jsx'
import ScanHistory from './pages/ScanHistory.jsx'

function App() {
  return (
    <WebSocketProvider>
      <Routes>
        {/* Public landing page — no dashboard shell */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard — wrapped in Shell with top navigation */}
        <Route
          path="/dashboard/*"
          element={
            <Shell>
              <Routes>
                <Route path="/" element={<LiveFeed />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="map" element={<WasteMap />} />
                <Route path="bins" element={<BinMonitor />} />
                <Route path="community" element={<Community />} />
                <Route path="history" element={<ScanHistory />} />
                <Route path="learn" element={<LearningHub />} />
              </Routes>
            </Shell>
          }
        />
      </Routes>
    </WebSocketProvider>
  )
}

export default App
