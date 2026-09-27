import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { GraduationCap, LogOut, Menu, X, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { navGroups } from '../lib/navigation'

export default function AppShell({ children }: { children: ReactNode }) {
  const { admin, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 px-5 py-5 border-b border-navy-800/60">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gold-400 text-gold-300">
          <GraduationCap size={20} strokeWidth={1.75} />
        </span>
        <div className="leading-tight min-w-0">
          <p className="font-display text-sm font-semibold text-cream-50 truncate">SMA Bina Taruna</p>
          <p className="text-[11px] uppercase tracking-[0.15em] text-cream-100/50">Dashboard Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2.5 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream-100/35">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-navy-800 text-cream-50'
                        : 'text-cream-100/70 hover:bg-navy-800/60 hover:text-cream-50'
                    }`
                  }
                >
                  <item.icon size={17} strokeWidth={1.75} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-navy-800/60 p-3 space-y-1">
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-cream-100/70 hover:bg-navy-800/60 hover:text-cream-50 transition-colors"
        >
          <ExternalLink size={17} strokeWidth={1.75} />
          Lihat Situs Publik
        </a>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-cream-100/70 hover:bg-maroon-600/30 hover:text-cream-50 transition-colors"
        >
          <LogOut size={17} strokeWidth={1.75} />
          Keluar
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-navy-50 lg:flex">
      {/* Sidebar — desktop (statis) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-navy-900 lg:h-screen lg:sticky lg:top-0">
        {sidebarContent}
      </aside>

      {/* Sidebar — mobile (overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-navy-950/50"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-navy-900 flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-navy-100 bg-cream-50/95 backdrop-blur px-5 py-3.5 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu"
            className="btn-icon lg:hidden"
          >
            <Menu size={22} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight hidden sm:block">
              <p className="text-sm font-semibold text-navy-900">{admin?.name}</p>
              <p className="text-xs text-navy-400">{admin?.email}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-cream-50 font-display text-sm font-semibold">
              {admin?.name?.[0]?.toUpperCase() ?? 'A'}
            </span>
          </div>
        </header>

        <main className="px-5 py-6 lg:px-8 lg:py-8 max-w-5xl">{children}</main>
      </div>

      {mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Tutup menu"
          className="fixed top-4 right-4 z-50 lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-cream-50"
        >
          <X size={20} />
        </button>
      )}
    </div>
  )
}
