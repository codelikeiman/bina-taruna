import { GraduationCap, AtSign, PlayCircle, Share2, MapPin, Phone, Mail } from 'lucide-react'
import { navLinks } from '../data/schoolData'

export default function Footer({ schoolProfile }) {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-navy-950 text-cream-100/70">
      <div className="section-container py-16 grid md:grid-cols-[1.3fr_0.8fr_1fr] gap-12">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gold-400 text-gold-400">
              <GraduationCap size={20} />
            </span>
            <span className="font-display text-lg font-semibold text-cream-50">{schoolProfile.shortName}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed max-w-xs">{schoolProfile.motto}</p>
          <div className="mt-6 flex gap-3">
            {[AtSign, PlayCircle, Share2].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Media sosial sekolah"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-50/15 hover:border-gold-400 hover:text-gold-400 transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-cream-50/50 mb-5">Tautan</p>
          <ul className="space-y-3 text-sm">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-gold-400 transition-colors">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-cream-50/50 mb-5">Kontak</p>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin size={16} className="shrink-0 mt-0.5" /> {schoolProfile.address.street}, {schoolProfile.address.city}
            </li>
            <li className="flex gap-3">
              <Phone size={16} className="shrink-0" /> {schoolProfile.phone}
            </li>
            <li className="flex gap-3">
              <Mail size={16} className="shrink-0" /> {schoolProfile.email}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream-50/10 py-6">
        <p className="section-container text-xs text-center text-cream-50/40">
          © {year} {schoolProfile.name}. Seluruh hak cipta dilindungi.
        </p>
      </div>
    </footer>
  )
}
