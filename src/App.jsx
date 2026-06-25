import { Routes, Route } from 'react-router-dom'
import { WebSocketProvider } from './context/WebSocketContext.jsx'
import Shell from './components/layout/Shell.jsx'
import LiveFeed from './pages/LiveFeed.jsx'
import Analytics from './pages/Analytics.jsx'
import WasteMap from './pages/WasteMap.jsx'
import BinMonitor from './pages/BinMonitor.jsx'
import DriveManager from './pages/DriveManager.jsx'
import Scoreboard from './pages/Scoreboard.jsx'
import LearningHub from './pages/LearningHub.jsx'
import Municipal from './pages/Municipal.jsx'
import AreaReport from './pages/AreaReport.jsx'
import ScanHistory from './pages/ScanHistory.jsx'

function App() {
  return (
    <WebSocketProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<LiveFeed />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/map" element={<WasteMap />} />
          <Route path="/bins" element={<BinMonitor />} />
          <Route path="/drives" element={<DriveManager />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="/learn" element={<LearningHub />} />
          <Route path="/municipal" element={<Municipal />} />
          <Route path="/reports" element={<AreaReport />} />
          <Route path="/history" element={<ScanHistory />} />
        </Routes>
      </Shell>
    </WebSocketProvider>
  )
}

export default App
