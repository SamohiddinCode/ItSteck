import { useEffect, useState } from 'react'
import { Tag } from 'lucide-react'
import { promotionService } from '@/services/promotionService'
import { useT } from '@/i18n'

/** Seconds per full pass — long enough that even a short promo stays readable. */
const secondsFor = (items) => {
  const chars = items.reduce((sum, p) => sum + p.text.length + (p.discount?.length || 0), 0)
  return Math.min(90, Math.max(18, Math.round(chars / 3)))
}

export default function PromoTicker() {
  const t = useT()
  const [items, setItems] = useState([])

  useEffect(() => {
    let cancelled = false
    promotionService.active()
      .then((data) => { if (!cancelled) setItems(data || []) })
      .catch(() => {}) // a dead promo feed must never break the page
    return () => { cancelled = true }
  }, [])

  if (!items.length) return null

  return (
    <div
      className="relative overflow-hidden border-b border-primary/20 bg-gradient-to-r
                 from-primary/15 via-primary/10 to-primary/15 motion-reduce:overflow-x-auto"
      role="region"
      aria-label={t('promo.label')}
    >
      <div
        className="flex w-max animate-marquee hover:[animation-play-state:paused]
                   motion-reduce:animate-none"
        style={{ animationDuration: `${secondsFor(items)}s` }}
      >
        {/* Two identical copies: the track shifts by exactly half its width, so
            the second copy is already in place when the loop restarts. */}
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex items-center shrink-0 motion-reduce:last:hidden"
            aria-hidden={copy === 1}
          >
            {items.map((promo, i) => (
              <PromoItem key={`${copy}-${i}`} promo={promo} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function PromoItem({ promo }) {
  const body = (
    <>
      <Tag className="w-3.5 h-3.5 text-primary flex-shrink-0" />
      {promo.discount && (
        <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white">
          {promo.discount}
        </span>
      )}
      <span className="whitespace-nowrap">{promo.text}</span>
    </>
  )

  const shared = 'flex items-center gap-2 px-6 py-2 text-sm text-text/90'

  return (
    <>
      {promo.link_url ? (
        <a href={promo.link_url} className={`${shared} hover:text-primary transition-colors`}>
          {body}
        </a>
      ) : (
        <span className={shared}>{body}</span>
      )}
      <span className="text-primary/40 select-none" aria-hidden="true">•</span>
    </>
  )
}
