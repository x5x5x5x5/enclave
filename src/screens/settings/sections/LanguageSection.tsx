import { LANGUAGES } from '../../../mock/settings'
import { COMMUNITIES } from '../../../mock/communities'
import { useApp } from '../../../state/app'
import { useUi } from '../../../state/ui'
import { Segmented, Toggle } from '../../../components/primitives/Controls'
import { ChipButton } from '../../../components/primitives/Chip'
import { Group, Panel, Rowed } from './Shared'

const PER_SPACE = [
  { id: 'follow' as const, label: 'Follow' },
  { id: 'always' as const, label: 'Always' },
  { id: 'never' as const, label: 'Never' },
]
type PerSpace = (typeof PER_SPACE)[number]['id']

export function LanguageSection() {
  const language = useApp((s) => s.language)
  const setLanguage = useApp((s) => s.setLanguage)
  const rules = useApp((s) => s.translateRules)
  const toggleRule = useApp((s) => s.toggleTranslateRule)
  const later = useUi((s) => s.later)

  return (
    <>
      <Group title="Your language">
        <Panel>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <ChipButton key={l} selected={l === language} onClick={() => setLanguage(l)}>
                {l}
              </ChipButton>
            ))}
          </div>
        </Panel>
      </Group>

      <Group
        title="Auto-translate"
        note="Translation happens on your device. Nothing is sent anywhere to be read."
      >
        <Panel>
          <div className="flex flex-col gap-3">
            {rules.map((r) => (
              <Toggle
                key={r.id}
                checked={r.on}
                onChange={() => toggleRule(r.id)}
                label={r.label}
              />
            ))}
          </div>
        </Panel>
      </Group>

      <Group title="Per space" note="Override the rules above inside one space.">
        <Panel>
          <div className="flex flex-col gap-3">
            {COMMUNITIES.map((c) => (
              <Rowed
                key={c.id}
                label={c.name}
                note="Follow your global rules unless set otherwise."
                control={
                  <Segmented
                    size="sm"
                    ariaLabel={`Translation in ${c.name}`}
                    options={PER_SPACE}
                    value={'follow' as PerSpace}
                    onChange={() => later('Per-space translation overrides')}
                  />
                }
              />
            ))}
          </div>
        </Panel>
      </Group>
    </>
  )
}
