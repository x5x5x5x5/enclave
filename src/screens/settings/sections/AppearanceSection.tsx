import { OWN_MASKS } from '../../../mock/masks'
import { HUE_LABEL } from '../../../mock/world'
import { useApp } from '../../../state/app'
import { Segmented } from '../../../components/primitives/Controls'
import { MaskAvatar } from '../../../components/identity/MaskAvatar'
import { Group, Panel, Rowed } from './Shared'

export function AppearanceSection() {
  const density = useApp((s) => s.density)
  const setDensity = useApp((s) => s.setDensity)
  const motion = useApp((s) => s.motion)
  const setMotion = useApp((s) => s.setMotion)
  const activeMaskId = useApp((s) => s.activeMaskId)
  const setActiveMask = useApp((s) => s.setActiveMask)

  return (
    <>
      <Group title="Density" note="Spaces still set their own atmosphere. This is the floor under it.">
        <Panel>
          <Rowed
            label="Row density"
            note="Cozy gives lists room to breathe. Compact fits more of a busy hall on screen."
            control={
              <Segmented
                ariaLabel="Density"
                options={[
                  { id: 'cozy', label: 'Cozy' },
                  { id: 'compact', label: 'Compact' },
                ]}
                value={density}
                onChange={setDensity}
              />
            }
          />
        </Panel>
      </Group>

      <Group title="Motion">
        <Panel>
          <Rowed
            label="Reduced motion"
            note="Follow the system, or force it here. Reduced motion means opacity only and instant height changes, everywhere."
            control={
              <Segmented
                ariaLabel="Motion"
                options={[
                  { id: 'system', label: 'Follow system' },
                  { id: 'reduced', label: 'Reduced' },
                ]}
                value={motion}
                onChange={setMotion}
              />
            }
          />
        </Panel>
      </Group>

      <Group title="Mask hue" note="The accent follows whoever you are wearing. Try it.">
        <Panel>
          <div className="flex flex-wrap gap-2">
            {OWN_MASKS.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMask(m.id)}
                className={
                  m.id === activeMaskId
                    ? 'flex items-center gap-2 rounded-chip border border-[color:var(--accent-line)] bg-accent-soft px-2.5 py-1.5 text-13 text-accent'
                    : 'flex items-center gap-2 rounded-chip border border-[var(--line)] px-2.5 py-1.5 text-13 text-mid hover:bg-ink-2 hover:text-hi'
                }
              >
                <MaskAvatar maskId={m.id} size={20} presence={false} />
                {m.displayName}
                <span className="text-low">{HUE_LABEL[m.hue]}</span>
              </button>
            ))}
          </div>
        </Panel>
      </Group>
    </>
  )
}
