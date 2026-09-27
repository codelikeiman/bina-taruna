import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import RequireAuth from './components/RequireAuth'
import AppShell from './components/AppShell'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SchoolProfilePage from './pages/SchoolProfilePage'
import VisionMissionPage from './pages/VisionMissionPage'
import ContactMessagesPage from './pages/ContactMessagesPage'
import AccountPage from './pages/AccountPage'
import PpdbRegistrationsPage from './pages/ppdb/PpdbRegistrationsPage'
import PpdbRegistrationDetailPage from './pages/ppdb/PpdbRegistrationDetailPage'
import PpdbSettingsPage from './pages/ppdb/PpdbSettingsPage'
import PpdbUserAccountsPage from './pages/ppdb/PpdbUserAccountsPage'
import { makeResourcePage } from './pages/resources/makeResourcePage'
import { resourceDefinitions } from './lib/resourceDefinitions'

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<Protected><DashboardPage /></Protected>} />
            <Route path="/school-profile" element={<Protected><SchoolProfilePage /></Protected>} />
            <Route path="/vision-mission" element={<Protected><VisionMissionPage /></Protected>} />
            <Route path="/contact-messages" element={<Protected><ContactMessagesPage /></Protected>} />
            <Route path="/ppdb-registrations" element={<Protected><PpdbRegistrationsPage /></Protected>} />
            <Route path="/ppdb-registrations/:id" element={<Protected><PpdbRegistrationDetailPage /></Protected>} />
            <Route path="/ppdb-user-accounts" element={<Protected><PpdbUserAccountsPage /></Protected>} />
            <Route path="/ppdb-settings" element={<Protected><PpdbSettingsPage /></Protected>} />
            <Route path="/account" element={<Protected><AccountPage /></Protected>} />

            {/* Satu rute per resource generik (stats, teachers, achievements, dst.) — lihat lib/resourceDefinitions.ts */}
            {resourceDefinitions.map((r) => {
              const Page = makeResourcePage(r.key)
              return <Route key={r.key} path={`/${r.key}`} element={<Protected><Page /></Protected>} />
            })}

            <Route path="*" element={<Protected><NotFoundPage /></Protected>} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

function NotFoundPage() {
  return (
    <div className="card p-12 text-center">
      <p className="font-display text-lg font-semibold text-navy-900">Halaman tidak ditemukan</p>
      <p className="mt-1.5 text-sm text-navy-500">Periksa kembali alamat yang Anda tuju.</p>
    </div>
  )
}
