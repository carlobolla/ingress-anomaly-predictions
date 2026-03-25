import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";
import { Home, Leaderboard, NotFound, Predict, Scoring, Profile } from './pages'
import './index.css'
import { TelegramAuthProvider } from './context';
import { ProtectedRoute } from './components';

export const App = () => {
  return (
    <main className="dark text-foreground bg-background min-h-screen">
      <BrowserRouter>
        <TelegramAuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict/:seriesId" element={<ProtectedRoute><Predict /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/scoring" element={<Scoring />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TelegramAuthProvider>
      </BrowserRouter>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
