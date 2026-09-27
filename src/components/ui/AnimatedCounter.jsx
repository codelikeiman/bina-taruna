import { useEffect, useRef } from 'react'
import { useInView, animate } from 'framer-motion'

// Angka yang menghitung naik dari 0 ke `value` saat elemen ini pertama
// kali terlihat di layar. Memakai animate() dari Framer Motion dengan
// durasi tetap (bukan physics-spring) supaya animasi selalu berhenti
// tepat di angka akhir, bukan mendekat-mendekat tanpa pernah pas.
export default function AnimatedCounter({ value, suffix = '', prefix = '' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  useEffect(() => {
    if (!isInView) return
    const node = ref.current
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        if (node) node.textContent = prefix + Math.round(latest).toLocaleString('id-ID') + suffix
      },
    })
    return () => controls.stop()
  }, [isInView, value, suffix, prefix])

  return <span ref={ref}>{prefix}0{suffix}</span>
}
