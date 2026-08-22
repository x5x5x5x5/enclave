import { useState } from 'react'
import { Laptop, Smartphone, Monitor, Tablet } from 'lucide-react'
import { cx } from '../../../lib/cx'
import { shortStamp } from '../../../lib/time'
import { SESSIONS } from '../../../mock/settings'
import { useApp } from '../../../state/app'
import { useUi } from '../../../state/ui'
import { Button } from '../../../components/primitives/Button'
import { Chip } from '../../../components/primitives/Chip'
import { Input } from '../../../components/primitives/Input'
import { Modal } from '../../../components/primitives/Overlay'
import { Toggle } from '../../../components/primitives/Controls'
import { Group, Panel } from './Shared'

const DEVICE_ICON: Record<string, typeof Laptop> = {
  ThinkPad: Laptop,
  'Pixel 10 Pro': Smartphone,
  Desktop: Monitor,
  'Old tablet': Tablet,
}

export function SecuritySection() {
  const revoked = useApp((s) => s.revokedSessions)
  const revokeSession = useApp((s) => s.revokeSession)
  const duressArmed = useApp((s) => s.duressArmed)
  const setDuressArmed = useApp((s) => s.setDuressArmed)
  const panicHide = useApp((s) => s.panicHide)
  const setPanicHide = useApp((s) => s.setPanicHide)
  const toast = useUi((s) => s.toast)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [real, setReal] = useState('')
  const [duress, setDuress] = useState('')

  const canArm = real.length >= 4 && duress.length >= 4 && real !== duress

  return (
    <>
      <Group title="Devices" note="Every device holds its own keys. Revoking one cannot be undone from that device.">
        {SESSIONS.map((s) => {
          const Icon = DEVICE_ICON[s.device] ?? Laptop
          const isRevoked = revoked.includes(s.id)
          const stale = !s.current && Date.now() - new Date(s.lastSeen).getTime() > 30 * 86400000
          return (
            <Panel key={s.id} className={cx(isRevoked && 'opacity-50')}>
              <div className="flex flex-wrap items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-[var(--line)] bg-ink-2 text-mid">
                  <Icon size={16} strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-14 text-hi">{s.device}</span>
                    {s.current ? <Chip>this device</Chip> : null}
                    {stale ? <Chip>not seen in a while</Chip> : null}
                    {isRevoked ? <Chip tone="breach">revoked</Chip> : null}
                  </div>
                  <p className="mt-0.5 text-12 text-low">
                    {s.platform} · last seen {shortStamp(s.lastSeen)}
                  </p>
                  <p className="mono-num mt-1 truncate whitespace-nowrap text-12 text-low">{s.fingerprint}</p>
                </div>
                {!s.current && !isRevoked ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      revokeSession(s.id)
                      toast({
                        kind: 'breach',
                        title: `${s.device} revoked`,
                        body: 'Its keys are dead. It cannot read anything new or old.',
                      })
                    }}
                  >
                    Revoke
                  </Button>
                ) : null}
              </div>
            </Panel>
          )
        })}
      </Group>

      <Group title="Duress mode">
        <Panel tone={duressArmed ? 'breach' : 'default'}>
          <p className="font-display text-15 text-hi">A second password that opens a decoy.</p>
          <p className="mt-1.5 max-w-xl text-13 leading-relaxed text-mid">
            Entering your duress password opens a clean decoy account. Your real masks stay hidden,
            and nothing on screen suggests there is more to find.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-13 text-mid">Your real password</span>
              <Input
                type="password"
                value={real}
                onChange={(e) => setReal(e.target.value)}
                placeholder="Not stored anywhere in this prototype"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-13 text-mid">Duress password</span>
              <Input
                type="password"
                value={duress}
                onChange={(e) => setDuress(e.target.value)}
                placeholder="Different from the real one"
                invalid={duress.length > 0 && duress === real}
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant="quiet"
              size="sm"
              disabled={!canArm}
              onClick={() =>
                toast({
                  kind: 'neutral',
                  title: 'Decoy opened in a test window',
                  body: 'One mask, no spaces, no vault. Exactly what a stranger would find.',
                })
              }
            >
              Test the decoy
            </Button>
            {duressArmed ? (
              <Button variant="danger" size="sm" onClick={() => setDuressArmed(false)}>
                Turn duress mode off
              </Button>
            ) : (
              <Button
                variant="danger"
                size="sm"
                disabled={!canArm}
                onClick={() => setConfirmOpen(true)}
              >
                Arm duress mode
              </Button>
            )}
            {duressArmed ? <Chip tone="breach">armed</Chip> : null}
          </div>
        </Panel>

        <Panel>
          <Toggle
            checked={panicHide}
            onChange={setPanicHide}
            tone="breach"
            label="Panic hide gesture"
            description="Three-finger swipe down closes every room and returns to a neutral screen. No animation, no trace in the task switcher."
          />
        </Panel>
      </Group>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Arm duress mode"
        subtitle="Read this once before you turn it on."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setDuressArmed(true)
                setConfirmOpen(false)
                toast({
                  kind: 'breach',
                  title: 'Duress mode armed',
                  body: 'Your duress password now opens the decoy.',
                })
              }}
            >
              Arm it
            </Button>
          </>
        }
      >
        <div className="rounded-card border border-[color:var(--breach-glow)] bg-breach-soft p-4">
          <p className="text-14 leading-relaxed text-hi">
            If you forget which password is which, you will open the decoy and see nothing of yours.
          </p>
          <p className="mt-2 text-13 leading-relaxed text-mid">
            There is no recovery path from inside the decoy, on purpose. That is the feature.
          </p>
        </div>
      </Modal>
    </>
  )
}
