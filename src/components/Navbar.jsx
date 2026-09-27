import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, LogOut, Menu, User, X, GraduationCap } from 'lucide-react'
import { navLinks } from '../data/schoolData'
import { useAuth } from '../context/AuthContext'
import LogoutConfirmModal from './LogoutConfirmModal'

export default function Navbar({ schoolProfile }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  const confirmLogout = () => {
    setConfirmingLogout(false)
    setOpen(false)
    logout()
    navigate('/')
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-cream-50/90 backdrop-blur-md shadow-sm shadow-navy-900/5 py-3' : 'bg-transparent py-5'
      }`}
    >
      <nav className="section-container flex items-center justify-between">
        <a href="/#beranda" className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
              scrolled ? 'border-navy-800 text-navy-800' : 'border-cream-50 text-cream-50'
            }`}
          >
            <GraduationCap size={20} strokeWidth={2} />
          </span>
          <span className="leading-tight">
            <span
              className={`block font-display text-base font-semibold tracking-wide transition-colors duration-300 ${
                scrolled ? 'text-navy-900' : 'text-cream-50'
              }`}
            >
              {schoolProfile.shortName}
            </span>
            <span
              className={`hidden xs:block text-[10px] font-medium tracking-[0.2em] uppercase transition-colors duration-300 whitespace-nowrap ${
                scrolled ? 'text-navy-400' : 'text-cream-100/70'
              }`}
            >
              {schoolProfile.tagline}
            </span>
          </span>
        </a>

        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-gold-500 ${
                  scrolled ? 'text-navy-700' : 'text-cream-50/90'
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                  scrolled ? 'text-navy-700' : 'text-cream-50/90'
                }`}
              >
                <User className="h-4 w-4" /> {user.name}
              </span>
              <button
                type="button"
                onClick={() => setConfirmingLogout(true)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  scrolled ? 'text-navy-500 hover:text-maroon-500' : 'text-cream-50/80 hover:text-maroon-300'
                }`}
              >
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </>
          ) : (
            <a
              href="/auth"
              className={`inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                scrolled ? 'text-navy-700 hover:text-gold-600' : 'text-cream-50/90 hover:text-gold-300'
              }`}
            >
              Masuk
            </a>
          )}
          <a
            href="/ppdb"
            className={`inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
              scrolled ? 'bg-navy-800 text-cream-50 hover:bg-navy-700' : 'bg-cream-50 text-navy-900 hover:bg-gold-300'
            }`}
          >
            Daftar PPDB
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className={`lg:hidden flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
            scrolled ? 'text-navy-800' : 'text-cream-50'
          }`}
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden bg-cream-50 border-t border-navy-100 mt-3"
          >
            <ul className="section-container flex flex-col py-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-navy-800 font-medium border-b border-navy-50 last:border-none"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-4">
                <a href="/ppdb" onClick={() => setOpen(false)} className="btn-primary w-full">
                  Daftar PPDB
                </a>
              </li>
              <li className="pt-3">
                {isLoggedIn ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-700">
                      <User className="h-4 w-4" /> {user.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setConfirmingLogout(true)}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-maroon-600 hover:bg-maroon-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Keluar
                    </button>
                  </div>
                ) : (
                  <a
                    href="/auth"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-full border border-navy-100 py-2.5 text-sm font-semibold text-navy-700 hover:bg-navy-50 transition-colors"
                  >
                    <LogIn className="h-4 w-4" /> Masuk / Daftar Akun
                  </a>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <LogoutConfirmModal
        open={confirmingLogout}
        userName={user?.name}
        onConfirm={confirmLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </header>
  )
}
