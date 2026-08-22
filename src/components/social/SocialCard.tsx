import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download } from 'lucide-react'
import { cx } from '../../lib/cx'
import { BRAND } from '../../config/brand'
import { maskById } from '../../mock/masks'
import { SOCIAL, SOCIAL_CARD_TEMPLATES } from '../../mock/social'
import type { SocialCardTemplateId } from '../../mock/social'
import { useUi } from '../../state/ui'
import { Button } from '../primitives/Button'
import { ChipButton } from '../primitives/Chip'
import { Modal } from '../primitives/Overlay'
import { AvatarMark } from '../identity/AvatarMark'
import { QrMark } from './Stats'

export function SocialCard() {
  const open = useUi((s) => s.overlay) === 'social-card'
  const closeOverlay = useUi((s) => s.closeOverlay)
  const toast = useUi((s) => s.toast)
  const [template, setTemplate] = useState<SocialCardTemplateId>('gaming')
  const [busy, setBusy] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const spec = SOCIAL_CARD_TEMPLATES.find((t) => t.id === template)!
  const mask = maskById(spec.maskId)
  const anonymous = template === 'anonymous'
  const badges = SOCIAL.reputation.badges.filter((b) => b.kind !== 'secret').slice(0, 3)

  const exportPng = async () => {
    if (!cardRef.current) return
    setBusy(true)
    try {
      const url = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#0B0E13',
      })
      const a = document.createElement('a')
      a.href = url
      a.download = `${BRAND.name.toLowerCase()}-card-${template}.png`
      a.click()
      toast({
        kind: 'accent',
        title: 'Card exported',
        body: `${spec.name} template saved as a PNG.`,
      })
    } catch {
      toast({
        kind: 'breach',
        title: 'Export failed',
        body: 'The card could not be rendered to an image. Try again.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={closeOverlay}
      title="Social card"
      subtitle="One card per context. Nothing here is linked to your other masks."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={closeOverlay}>
            Close
          </Button>
          <Button
            variant="solid"
            icon={<Download size={15} strokeWidth={1.5} />}
            onClick={exportPng}
            disabled={busy}
          >
            {busy ? 'Exporting…' : 'Export PNG'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 no-scrollbar md:flex-wrap md:overflow-visible">
          {SOCIAL_CARD_TEMPLATES.map((t) => (
            <ChipButton
              key={t.id}
              className="snap-center"
              selected={t.id === template}
              onClick={() => setTemplate(t.id)}
            >
              {t.name}
            </ChipButton>
          ))}
        </div>

        <div className="flex justify-center">
          <div
            ref={cardRef}
            data-mask-hue={spec.hue}
            className="relative w-[420px] max-w-full overflow-hidden rounded-modal border p-6"
            style={{
              borderColor: `rgb(var(--hue-${spec.hue}-rgb) / .32)`,
              background: `linear-gradient(150deg, rgb(var(--hue-${spec.hue}-rgb) / .14), var(--ink-1) 55%)`,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span
                    className="rounded-full p-[2px]"
                    style={{ background: `rgb(var(--hue-${spec.hue}-rgb) / .4)` }}
                  >
                    <AvatarMark preset={mask.avatar} hue={spec.hue} size={48} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-20 leading-tight text-hi">
                      {anonymous ? 'Someone' : mask.displayName}
                    </p>
                    <p className="mono-num truncate text-12 text-low">
                      {anonymous ? 'Scan to connect' : mask.handle}
                    </p>
                  </div>
                </div>
                <p className="mt-3 max-w-[15rem] text-13 leading-relaxed text-mid">{spec.status}</p>
              </div>

              <div className="shrink-0 rounded-[8px] bg-[var(--text-hi)] p-1.5">
                <QrMark seed={`${template}:${mask.handle}`} size={78} />
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
              <div className="flex flex-wrap gap-1.5">
                {anonymous ? (
                  <span className="rounded-chip border border-[var(--line)] px-2 py-1 text-12 text-low">
                    No badges shown
                  </span>
                ) : (
                  badges.map((b) => (
                    <span
                      key={b.id}
                      className="rounded-chip border px-2 py-1 text-12"
                      style={{
                        borderColor: `rgb(var(--hue-${spec.hue}-rgb) / .3)`,
                        color: `var(--hue-${spec.hue})`,
                      }}
                    >
                      {b.name}
                    </span>
                  ))
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-12 text-low">Reputation</p>
                <p
                  className="font-display text-15"
                  style={{ color: anonymous ? 'var(--text-mid)' : `var(--hue-${spec.hue})` }}
                >
                  {anonymous ? 'Not shown' : SOCIAL.reputation.tier}
                </p>
              </div>
            </div>

            <div
              className={cx('mt-5 flex items-center justify-between border-t pt-3')}
              style={{ borderColor: 'var(--line)' }}
            >
              <span className="font-display text-13 text-mid">{BRAND.wordmark}</span>
              <span className="text-12 text-low">
                {anonymous ? 'Unlinkable by design' : 'Sealed by default'}
              </span>
            </div>
          </div>
        </div>

        <p className="text-center text-12 leading-relaxed text-mid">
          {anonymous
            ? 'The anonymous card hides the handle. Scanning starts a request, not a lookup.'
            : 'This card only shows what this mask already shows in public.'}
        </p>
      </div>
    </Modal>
  )
}
