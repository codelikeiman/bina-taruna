import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AuthPage from './pages/AuthPage.jsx'
import PpdbPage from './pages/PpdbPage.jsx'
import PpdbStatusPage from './pages/PpdbStatusPage.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/ppdb" element={<PpdbPage />} />
          <Route path="/ppdb/status" element={<PpdbStatusPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
