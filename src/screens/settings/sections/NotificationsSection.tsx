import { useApp } from '../../../state/app'
import { Slider, Toggle } from '../../../components/primitives/Controls'
import { Chip } from '../../../components/primitives/Chip'
import { MaskAvatar } from '../../../components/identity/MaskAvatar'
import { Group, Panel, Rowed } from './Shared'

const pad = (n: number) => String(n).padStart(2, '0')
const toClock = (halfHours: number) => `${pad(Math.floor(halfHours / 2))}:${halfHours % 2 ? '30' : '00'}`
const fromClock = (v: string) => {
  const [h, m] = v.split(':').map(Number)
  return h * 2 + (m >= 30 ? 1 : 0)
}

export function NotificationsSection() {
  const rules = useApp((s) => s.notifRules)
  const update = useApp((s) => s.updateNotifRule)
  const priorityContacts = useApp((s) => s.priorityContacts)
  const togglePriority = useApp((s) => s.togglePriority)
  const globalQuietHours = useApp((s) => s.globalQuietHours)
  const setGlobalQuietHours = useApp((s) => s.setGlobalQuietHours)

  return (
    <>
      <Group
        title="Per space"
        note="Rules live with the space, not the account. A loud gaming hall and a quiet reading room should not share one setting."
      >
        {rules.map((rule) => (
          <Panel key={rule.scopeId}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="font-display text-15 text-hi">{rule.scopeLabel}</p>
              {rule.mentionsOnly ? <Chip tone="accent">mentions only</Chip> : <Chip>everything</Chip>}
            </div>

            <div className="flex flex-col gap-3">
              <Toggle
                checked={rule.mentionsOnly}
                onChange={(v) => update(rule.scopeId, { mentionsOnly: v })}
                label="Mentions only"
                description="Everything else waits for you."
              />
              <Toggle
                checked={rule.muteEveryone}
                onChange={(v) => update(rule.scopeId, { muteEveryone: v })}
                label="Mute @everyone"
                description="Staff can still reach you by name."
              />

              <div className="border-t border-[var(--line-soft)] pt-3">
                <Rowed
                  label="Quiet hours"
                  note={
                    rule.quietHours
                      ? `Nothing from ${rule.scopeLabel} between these hours.`
                      : 'Off for this space.'
                  }
                  control={
                    <Toggle
                      checked={!!rule.quietHours}
                      onChange={(v) =>
                        update(rule.scopeId, {
                          quietHours: v ? { from: '23:00', to: '08:00' } : undefined,
                        })
                      }
                    />
                  }
                />
                {rule.quietHours ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Slider
                      min={0}
                      max={47}
                      value={fromClock(rule.quietHours.from)}
                      onChange={(v) =>
                        update(rule.scopeId, {
                          quietHours: { ...rule.quietHours!, from: toClock(v) },
                        })
                      }
                      label="From"
                      valueLabel={rule.quietHours.from}
                    />
                    <Slider
                      min={0}
                      max={47}
                      value={fromClock(rule.quietHours.to)}
                      onChange={(v) =>
                        update(rule.scopeId, {
                          quietHours: { ...rule.quietHours!, to: toClock(v) },
                        })
                      }
                      label="To"
                      valueLabel={rule.quietHours.to}
                    />
                  </div>
                ) : null}
              </div>

              <div className="border-t border-[var(--line-soft)] pt-3">
                <Rowed
                  label="Daily digest"
                  note={rule.digestAt ? `One summary at ${rule.digestAt}.` : 'No digest.'}
                  control={
                    <Toggle
                      checked={!!rule.digestAt}
                      onChange={(v) => update(rule.scopeId, { digestAt: v ? '09:00' : undefined })}
                    />
                  }
                />
                {rule.digestAt ? (
                  <Slider
                    className="mt-3"
                    min={0}
                    max={47}
                    value={fromClock(rule.digestAt)}
                    onChange={(v) => update(rule.scopeId, { digestAt: toClock(v) })}
                    label="Arrives at"
                    valueLabel={rule.digestAt}
                  />
                ) : null}
              </div>
            </div>
          </Panel>
        ))}
      </Group>

      <Group title="People who always get through">
        <Panel>
          <div className="flex flex-col gap-3">
            {priorityContacts.map((c) => (
              <Rowed
                key={c.maskId}
                label={
                  <span className="flex items-center gap-2">
                    <MaskAvatar maskId={c.maskId} size={22} presence={false} />
                    {c.label}
                  </span>
                }
                note="Reaches you through quiet hours and mute."
                control={<Toggle checked={c.on} onChange={() => togglePriority(c.maskId)} />}
              />
            ))}
          </div>
        </Panel>
      </Group>

      <Group title="Global quiet hours" note="Applies everywhere, unless someone above is on the list.">
        <Panel>
          <div className="grid gap-3 sm:grid-cols-2">
            <Slider
              min={0}
              max={47}
              value={fromClock(globalQuietHours.from)}
              onChange={(v) => setGlobalQuietHours({ ...globalQuietHours, from: toClock(v) })}
              label="From"
              valueLabel={globalQuietHours.from}
            />
            <Slider
              min={0}
              max={47}
              value={fromClock(globalQuietHours.to)}
              onChange={(v) => setGlobalQuietHours({ ...globalQuietHours, to: toClock(v) })}
              label="To"
              valueLabel={globalQuietHours.to}
            />
          </div>
        </Panel>
      </Group>
    </>
  )
}
