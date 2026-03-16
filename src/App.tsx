import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import BracketPage from './pages/bracket/BracketPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/bracket" element={<BracketPage />} />
    </Routes>
  )
}
