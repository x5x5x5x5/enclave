import { useState } from 'react'
import { EMBER_PRESETS, SWEEP_AGES, SWEEP_SCOPES } from '../../../mock/settings'
import type { EmberPresetId } from '../../../mock/settings'
import { useApp } from '../../../state/app'
import { useUi } from '../../../state/ui'
import { Button } from '../../../components/primitives/Button'
import { ChipButton } from '../../../components/primitives/Chip'
import { Modal } from '../../../components/primitives/Overlay'
import { Segmented } from '../../../components/primitives/Controls'
import { Group, Panel, Rowed } from './Shared'

const CONTEXTS = [
  { id: 'dms', label: 'Direct messages', note: 'What a new conversation starts with.' },
  { id: 'groups', label: 'Groups', note: 'Applies to groups you create.' },
  { id: 'spaces', label: 'New spaces', note: 'Follow the space rule unless you override it.' },
]

export function DataSection() {
  const defaultEmber = useApp((s) => s.defaultEmber)
  const setDefaultEmber = useApp((s) => s.setDefaultEmber)
  const toast = useUi((s) => s.toast)

  const [sweepOpen, setSweepOpen] = useState(false)
  const [scope, setScope] = useState<string>(SWEEP_SCOPES[0])
  const [age, setAge] = useState<string>(SWEEP_AGES[0])
  const [progress, setProgress] = useState<number | null>(null)

  const runSweep = () => {
    setProgress(0)
    const id = window.setInterval(() => {
      setProgress((p) => {
        const next = (p ?? 0) + 0.08
        if (next >= 1) {
          window.clearInterval(id)
          window.setTimeout(() => {
            setProgress(null)
            setSweepOpen(false)
            toast({
              kind: 'accent',
              title: 'Sweep finished',
              body: 'Your copies are gone. Sealed rooms clear on their own schedule.',
            })
          }, 400)
          return 1
        }
        return next
      })
    }, 160)
  }

  return (
    <>
      <Group
        title="Default expiry"
        note="Every new message inherits one of these unless you change it in the composer. Everyone in the room sees the same countdown."
      >
        {CONTEXTS.map((c) => (
          <Panel key={c.id}>
            <Rowed
              label={c.label}
              note={c.note}
              control={
                <div className="flex flex-wrap justify-end gap-1.5">
                  {c.id === 'spaces' ? (
                    <ChipButton
                      selected={defaultEmber[c.id] === 'follow'}
                      onClick={() => setDefaultEmber(c.id, 'follow')}
                    >
                      Follow space rule
                    </ChipButton>
                  ) : null}
                  {EMBER_PRESETS.filter((p) => p.id !== 'custom').map((p) => (
                    <ChipButton
                      key={p.id}
                      selected={defaultEmber[c.id] === p.id}
                      onClick={() => setDefaultEmber(c.id, p.id as EmberPresetId)}
                    >
                      {p.label}
                    </ChipButton>
                  ))}
                </div>
              }
            />
          </Panel>
        ))}
      </Group>

      <Group title="Sweep my history" note="Remove what you can still reach. The copy says exactly what that means.">
        <Panel>
          <div className="flex flex-col gap-3">
            <Rowed
              label="Scope"
              control={
                <Segmented
                  size="sm"
                  ariaLabel="Sweep scope"
                  options={SWEEP_SCOPES.map((s) => ({ id: s, label: s }))}
                  value={scope}
                  onChange={setScope}
                />
              }
            />
            <Rowed
              label="Age"
              control={
                <Segmented
                  size="sm"
                  ariaLabel="Sweep age"
                  options={SWEEP_AGES.map((s) => ({ id: s, label: s }))}
                  value={age}
                  onChange={setAge}
                />
              }
            />
            <div className="flex justify-end border-t border-[var(--line-soft)] pt-3">
              <Button variant="danger" size="md" onClick={() => setSweepOpen(true)}>
                Sweep
              </Button>
            </div>
          </div>
        </Panel>
      </Group>

      <Modal
        open={sweepOpen}
        onClose={() => (progress === null ? setSweepOpen(false) : undefined)}
        title="Sweep your history"
        subtitle={`${scope} · ${age.toLowerCase()}`}
        footer={
          progress === null ? (
            <>
              <Button variant="ghost" onClick={() => setSweepOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={runSweep}>
                Sweep now
              </Button>
            </>
          ) : null
        }
      >
        {progress === null ? (
          <div className="flex flex-col gap-3">
            <p className="text-14 leading-relaxed text-hi">
              Deletes your messages everywhere it is allowed.
            </p>
            <p className="text-13 leading-relaxed text-mid">
              Other people&rsquo;s copies of sealed rooms expire by key rotation, on the schedule
              that room already had. Nothing here can reach into someone else&rsquo;s device and
              nothing pretends otherwise.
            </p>
          </div>
        ) : (
          <div className="py-6">
            <div className="h-1 overflow-hidden rounded-full bg-[var(--line)]">
              <div
                className="h-full rounded-full bg-breach transition-[width] duration-150"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="mono-num mt-2 text-center text-12 text-low">
              {Math.round(progress * 100)}% · removing your copies
            </p>
          </div>
        )}
      </Modal>
    </>
  )
}
