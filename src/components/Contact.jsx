import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import { fadeUp, stagger, viewportOnce } from '../lib/motion'
import { submitContactMessage } from '../lib/siteContentApi'

const fieldClass =
  'mt-1.5 w-full rounded-lg border border-navy-100 px-4 py-2.5 text-sm text-navy-900 focus:border-gold-400 transition-colors'

export default function Contact({ schoolProfile }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'sent' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')
    try {
      await submitContactMessage(form)
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.message || 'Gagal mengirim pesan. Silakan coba lagi.')
    }
  }

  return (
    <section id="kontak" className="section-container py-24 md:py-32">
      <motion.div initial="hidden" whileInView="show" viewport={viewportOnce} variants={stagger()}>
        <SectionHeading
          eyebrow="Kontak & Lokasi"
          title="Hubungi Kami"
          description="Kami siap menjawab pertanyaan seputar pendaftaran dan informasi sekolah."
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div variants={fadeUp} className="space-y-5">
            <div className="flex gap-4 rounded-2xl border border-navy-100 bg-white p-6">
              <MapPin className="shrink-0 text-gold-500" size={22} />
              <div>
                <p className="font-semibold text-navy-900 text-sm">Alamat</p>
                <p className="text-sm text-navy-500 mt-1 leading-relaxed">
                  {schoolProfile.address.street}, {schoolProfile.address.area}, {schoolProfile.address.city}
                </p>
              </div>
            </div>
            <div className="flex gap-4 rounded-2xl border border-navy-100 bg-white p-6">
              <Phone className="shrink-0 text-gold-500" size={22} />
              <div>
                <p className="font-semibold text-navy-900 text-sm">Telepon / WhatsApp</p>
                <p className="text-sm text-navy-500 mt-1">
                  {schoolProfile.phone} · {schoolProfile.whatsapp}
                </p>
              </div>
            </div>
            <div className="flex gap-4 rounded-2xl border border-navy-100 bg-white p-6">
              <Mail className="shrink-0 text-gold-500" size={22} />
              <div>
                <p className="font-semibold text-navy-900 text-sm">Email</p>
                <p className="text-sm text-navy-500 mt-1">{schoolProfile.email}</p>
              </div>
            </div>

            {/* Placeholder peta — ganti dengan embed Google Maps asli, contoh:
                <iframe src="https://www.google.com/maps/embed?pb=..." className="w-full h-full border-0" loading="lazy" />
                (Dapatkan URL dari Google Maps > Bagikan > Sematkan Peta) */}
            <div className="relative h-44 rounded-2xl overflow-hidden bg-navy-900 flex items-center justify-center">
              <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 400 200" preserveAspectRatio="none">
                <path d="M0 150 Q 100 100 200 140 T 400 120" stroke="#e5ba57" strokeWidth="2" fill="none" />
                <path d="M0 60 Q 120 90 220 50 T 400 70" stroke="#e5ba57" strokeWidth="1.5" fill="none" />
                <path d="M50 0 L 60 200" stroke="#e5ba57" strokeWidth="1" fill="none" />
                <path d="M300 0 L 310 200" stroke="#e5ba57" strokeWidth="1" fill="none" />
              </svg>
              <div className="relative flex flex-col items-center gap-2 text-cream-50">
                <MapPin className="text-gold-400" size={26} />
                <span className="text-xs text-cream-100/70">Sematkan Google Maps di sini</span>
              </div>
            </div>
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="rounded-2xl border border-navy-100 bg-white p-8">
            {status === 'sent' ? (
              <div className="flex flex-col items-center justify-center text-center h-full gap-3 py-12">
                <CheckCircle2 className="text-gold-500" size={40} />
                <p className="font-semibold text-navy-900">Pesan terkirim!</p>
                <p className="text-sm text-navy-500">Tim kami akan segera menghubungi Anda kembali.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {status === 'error' && (
                  <div className="flex items-start gap-2.5 rounded-lg bg-maroon-50 border border-maroon-100 px-4 py-3 text-sm text-maroon-600">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-navy-700">
                    Nama Lengkap
                  </label>
                  <input
                    required
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    type="text"
                    className={fieldClass}
                    placeholder="Nama Anda"
                    disabled={status === 'submitting'}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-navy-700">
                    Email
                  </label>
                  <input
                    required
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    className={fieldClass}
                    placeholder="email@contoh.com"
                    disabled={status === 'submitting'}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="text-sm font-medium text-navy-700">
                    Pesan
                  </label>
                  <textarea
                    required
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    className={`${fieldClass} resize-none`}
                    placeholder="Tulis pertanyaan Anda..."
                    disabled={status === 'submitting'}
                  />
                </div>
                <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full disabled:opacity-60">
                  {status === 'submitting' ? 'Mengirim...' : 'Kirim Pesan'} <Send size={16} />
                </button>
              </div>
            )}
          </motion.form>
        </div>
      </motion.div>
    </section>
  )
}
