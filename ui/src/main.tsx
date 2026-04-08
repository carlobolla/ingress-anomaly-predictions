import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";
import Home from '@/pages/home';
import Leaderboard from '@/pages/leaderboard';
import NotFound from '@/pages/not_found';
import Predict from '@/pages/predict';
import Scoring from '@/pages/scoring';
import Profile from '@/pages/profile';
import './index.css'
import TelegramAuthProvider from '@/context/telegram-auth-provider';
import ProtectedRoute from '@/components/protected_route';

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
