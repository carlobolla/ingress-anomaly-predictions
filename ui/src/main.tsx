import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";
import { HeroUIProvider } from '@heroui/react'
import { useTheme } from '@heroui/use-theme';
import { Home, Leaderboard, NotFound, Predict } from './pages'
import './index.css'
import { TelegramAuthProvider } from './context';
import { ProtectedRoute } from './components';

export const App = () => {
  const { theme } = useTheme();
  return (
    <main className={`${theme} text-foreground bg-background`}>
      <BrowserRouter>
        <TelegramAuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict/:seriesId" element={<ProtectedRoute><Predict /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TelegramAuthProvider>
      </BrowserRouter>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </StrictMode>
)
