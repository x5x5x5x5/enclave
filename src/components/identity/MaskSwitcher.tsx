import { motion, useReducedMotion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { cx } from '../../lib/cx'
import { BRAND } from '../../config/brand'
import { OWN_MASKS, maskById } from '../../mock/masks'
import { HUE_LABEL, spacesUsingMask } from '../../mock/world'
import type { Presence } from '../../mock/types'
import { useApp } from '../../state/app'
import { useUi } from '../../state/ui'
import { Modal } from '../primitives/Overlay'
import { Segmented } from '../primitives/Controls'
import { Button } from '../primitives/Button'
import { MaskAvatar } from './MaskAvatar'

const PRESENCES: { id: Presence; label: string }[] = [
  { id: 'online', label: 'Online' },
  { id: 'away', label: 'Away' },
  { id: 'invisible', label: 'Invisible' },
]

export function MaskSwitcher() {
  const open = useUi((s) => s.overlay) === 'mask-switcher'
  const closeOverlay = useUi((s) => s.closeOverlay)
  const later = useUi((s) => s.later)
  const toast = useUi((s) => s.toast)
  const activeMaskId = useApp((s) => s.activeMaskId)
  const contextMaskId = useApp((s) => s.contextMaskId)
  const contextLabel = useApp((s) => s.contextLabel)
  const setActiveMask = useApp((s) => s.setActiveMask)
  const presence = useApp((s) => s.presence)
  const setPresence = useApp((s) => s.setPresence)
  const reduce = useReducedMotion()

  // Opened from inside a room, the switcher has to say what it will *not* do:
  // that room keeps the identity it already knows.
  const contextMask = contextMaskId ? maskById(contextMaskId) : null
  const where = contextLabel ?? 'This room'
  const scopeWarning = contextMask
    ? `${where} knows you as ${contextMask.displayName} and will keep doing so. Changing your mask here would start a fresh, unlinked profile.`
    : undefined

  return (
    <Modal
      open={open}
      onClose={closeOverlay}
      title="Your masks"
      subtitle="One account. The interface takes the shape of whoever you are right now."
      size="md"
      footer={
        <>
          <p className="mr-auto max-w-64 text-12 leading-relaxed text-mid">{BRAND.maskNote}</p>
          <Button
            variant="outline"
            size="sm"
            icon={<Plus size={14} strokeWidth={1.5} />}
            onClick={() => later('Making a new mask')}
          >
            New mask
          </Button>
        </>
      }
    >
      {scopeWarning ? (
        <p className="mb-3 rounded-card border border-[color:var(--ember-glow)] bg-ember-soft px-3 py-2 text-12 leading-relaxed text-ember">
          {scopeWarning}
        </p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {OWN_MASKS.map((mask, i) => {
          const active = mask.id === activeMaskId
          const spaces = spacesUsingMask(mask.id)
          const current = presence[mask.id] ?? mask.presence
          return (
            <motion.li
              key={mask.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : i * 0.04, duration: 0.2, ease: [0.2, 0, 0, 1] }}
              className={cx(
                'rounded-card border p-3 transition-colors',
                active
                  ? 'border-[color:var(--accent-line)] bg-accent-soft'
                  : 'border-[var(--line)] bg-ink-1 hover:bg-ink-2',
              )}
              style={
                active
                  ? undefined
                  : ({
                      // Each card previews its own hue, not the active one.
                      borderColor: `rgb(var(--hue-${mask.hue}-rgb) / .18)`,
                    } as React.CSSProperties)
              }
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => {
                    setActiveMask(mask.id)
                    toast({
                      kind: 'accent',
                      title: `Now wearing ${mask.displayName}`,
                      body:
                        contextMask && contextMask.id !== mask.id
                          ? `${where} still knows you as ${contextMask.displayName}.`
                          : `${HUE_LABEL[mask.hue]} · ${mask.handle}`,
                    })
                  }}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                >
                  <MaskAvatar
                    maskId={mask.id}
                    size={40}
                    mask={{ ...mask, presence: current }}
                    presence
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className="truncate font-display text-15 text-hi">
                        {mask.displayName}
                      </span>
                      <span className="mono-num truncate text-12 text-low">{mask.handle}</span>
                    </span>
                    {mask.bio ? (
                      <span className="mt-0.5 block truncate text-12 text-mid">{mask.bio}</span>
                    ) : null}
                    <span className="mt-1 flex items-center gap-2 text-12 text-low">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: `var(--hue-${mask.hue})` }}
                      />
                      {HUE_LABEL[mask.hue]}
                      <span aria-hidden="true">·</span>
                      {spaces.length === 0
                        ? 'No spaces yet'
                        : spaces.length === 1
                          ? '1 space uses this mask'
                          : `${spaces.length} spaces use this mask`}
                    </span>
                  </span>
                </button>
                {active ? (
                  <span className="mt-1 rounded-chip border border-[color:var(--accent-line)] px-1.5 py-0.5 text-12 text-accent">
                    Wearing
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--line-soft)] pt-2.5">
                <span className="text-12 text-low">Presence here</span>
                <Segmented
                  size="sm"
                  ariaLabel={`Presence for ${mask.displayName}`}
                  options={PRESENCES}
                  value={current}
                  onChange={(p) => setPresence(mask.id, p)}
                />
              </div>
            </motion.li>
          )
        })}
      </ul>
    </Modal>
  )
}
