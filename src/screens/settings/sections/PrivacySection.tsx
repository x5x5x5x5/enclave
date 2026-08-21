import { PRIVACY_COLUMNS, PRIVACY_ROWS } from '../../../mock/settings'
import type { PrivacyValue } from '../../../mock/settings'
import { useApp } from '../../../state/app'
import { Segmented, Toggle } from '../../../components/primitives/Controls'
import { Group, Panel } from './Shared'

/**
 * The visibility matrix. Rows are facts about you, columns are who may learn
 * them. Nothing here is a default someone else picked.
 */
export function PrivacySection() {
  const privacy = useApp((s) => s.privacy)
  const setPrivacy = useApp((s) => s.setPrivacy)
  const requireRequest = useApp((s) => s.requireRequest)
  const setRequireRequest = useApp((s) => s.setRequireRequest)

  return (
    <>
      <Group
        title="Who can learn what"
        note="These apply to the mask you are wearing. Your other masks keep their own answers."
      >
        <Panel className="p-0">
          <div className="hidden grid-cols-[1fr_auto] items-center gap-4 px-4 py-2.5 hairline-b sm:grid">
            <span className="text-12 uppercase tracking-[0.08em] text-low">Fact</span>
            <span className="flex gap-3 text-12 uppercase tracking-[0.08em] text-low">
              {PRIVACY_COLUMNS.map((c) => (
                <span key={c} className="w-20 text-center">
                  {c}
                </span>
              ))}
            </span>
          </div>
          {PRIVACY_ROWS.map((row, i) => (
            <div
              key={row.id}
              className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
                i > 0 ? 'border-t border-[var(--line-soft)]' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-14 text-hi">{row.label}</p>
                <p className="mt-0.5 text-12 leading-relaxed text-mid">{row.note}</p>
              </div>
              <Segmented
                size="sm"
                ariaLabel={row.label}
                options={PRIVACY_COLUMNS.map((c) => ({ id: c, label: c }))}
                value={privacy[row.id]}
                onChange={(v) => setPrivacy(row.id, v as PrivacyValue)}
              />
            </div>
          ))}
        </Panel>
      </Group>

      <Group title="Messages">
        <Panel>
          <Toggle
            checked={requireRequest}
            onChange={setRequireRequest}
            label="Require a request before direct messages"
            description="A stranger writes once. You decide whether there is a second time."
          />
        </Panel>
        <p className="text-12 leading-relaxed text-mid">
          Member counts you see, and counts other people see of your spaces, are fuzzed on purpose.
          Exact numbers make people easier to follow between rooms.
        </p>
      </Group>
    </>
  )
}
