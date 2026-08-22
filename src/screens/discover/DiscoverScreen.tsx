import { useMemo, useState } from 'react'
import { Screen } from '../../components/shell/Screen'
import { Search } from 'lucide-react'
import { DISCOVERY, DISCOVERY_CATEGORIES } from '../../mock/discovery'
import type { DiscoverySpace } from '../../mock/types'
import { useUi } from '../../state/ui'
import { Button } from '../../components/primitives/Button'
import { Card, EmptyState } from '../../components/primitives/EmptyState'
import { Chip, ChipButton } from '../../components/primitives/Chip'
import { Input } from '../../components/primitives/Input'
import { Sheet } from '../../components/primitives/Overlay'
import { FuzzedCount } from '../../components/trust'
import { SealGlyph, ZkGlyph } from '../../components/trust/Glyphs'

function PreviewSheet({
  space,
  onClose,
}: {
  space: DiscoverySpace | null
  onClose: () => void
}) {
  const later = useUi((s) => s.later)
  return (
    <Sheet open={!!space} onClose={onClose} title={space ? space.name : ''}>
      {space ? (
        <div className="flex flex-col gap-4 p-4">
          <div className="rounded-card border border-[color:var(--ember-glow)] bg-ember-soft px-3 py-2">
            <p className="text-13 text-ember">You are previewing as no one.</p>
            <p className="mt-0.5 text-12 leading-relaxed text-mid">
              Join to pick a mask. Until then this space cannot see you at all.
            </p>
          </div>

          <p className="text-13 leading-relaxed text-mid">{space.oneLiner}</p>

          <div className="flex flex-wrap gap-2">
            <FuzzedCount value={`${space.memberEstimate} members`} />
            {space.gates.map((g) => (
              <Chip key={g} tone="neutral" icon={<ZkGlyph size={11} />}>
                {g}
              </Chip>
            ))}
            {space.sealedEverything ? (
              <Chip tone="neutral" icon={<SealGlyph size={11} />}>
                Everything sealed
              </Chip>
            ) : null}
          </div>

          <div>
            <p className="mb-2 text-12 uppercase tracking-[0.08em] text-low">
              {space.preview.channel}
            </p>
            <div className="flex flex-col gap-2">
              {space.preview.lines.map((l, i) => (
                <div key={i} className="rounded-card border border-[var(--line)] bg-ink-2 p-3">
                  <p className="text-12" style={{ color: `var(--hue-${l.hue})` }}>
                    {l.who}
                  </p>
                  <p className="mt-0.5 text-14 leading-relaxed text-hi">{l.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-12 leading-relaxed text-mid">
              {space.sealedEverything
                ? 'Previews are limited here on purpose. Sealed rooms have nothing to show a stranger.'
                : 'A read-only glimpse. Nobody in the room is told you looked.'}
            </p>
          </div>

          <Button variant="solid" size="md" full onClick={() => later('Joining spaces')}>
            Join and pick a mask
          </Button>
        </div>
      ) : null}
    </Sheet>
  )
}

export function DiscoverScreen() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [preview, setPreview] = useState<DiscoverySpace | null>(null)

  const spaces = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DISCOVERY.filter((s) =>
      category === 'All'
        ? true
        : category === 'Sealed only'
          ? s.sealedEverything
          : s.category === category,
    ).filter((s) => (q ? `${s.name} ${s.oneLiner}`.toLowerCase().includes(q) : true))
  }, [query, category])

  return (
    <Screen gutter={false} contentClassName="px-[var(--gutter)]">
      <div className="mx-auto w-full max-w-4xl py-6">
        <header>
          <h1 className="font-display text-24 text-hi">Discover</h1>
          <p className="mt-1 max-w-xl text-13 leading-relaxed text-mid">
            Every space says what it will ask of you before you knock. Sizes are approximate on
            purpose.
          </p>
          <Input
            className="mt-4 h-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search spaces"
            leading={<Search size={15} strokeWidth={1.5} />}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {DISCOVERY_CATEGORIES.map((c) => (
              <ChipButton key={c} selected={category === c} onClick={() => setCategory(c)}>
                {c}
              </ChipButton>
            ))}
          </div>
        </header>

        {spaces.length === 0 ? (
          <EmptyState
            title="No spaces match that"
            body="Try a different word, or clear the category."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery('')
              setCategory('All')
            }}
          />
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {spaces.map((s) => (
              <Card key={s.id} className="flex flex-col p-4">
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card border bg-ink-2 font-display text-13 text-mid"
                    style={{ borderColor: `rgb(var(--hue-${s.hue}-rgb) / 0.35)` }}
                  >
                    {s.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-17 text-hi">{s.name}</p>
                    <p className="mt-0.5 text-13 leading-relaxed text-mid">{s.oneLiner}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <FuzzedCount value={s.memberEstimate} />
                  {s.gates.map((g) => (
                    <Chip key={g} tone="neutral" icon={<ZkGlyph size={11} />}>
                      {g}
                    </Chip>
                  ))}
                  {s.sealedEverything ? (
                    <Chip tone="neutral" icon={<SealGlyph size={11} />}>
                      Everything sealed
                    </Chip>
                  ) : null}
                </div>

                <div className="mt-auto flex gap-2 pt-4">
                  <Button variant="quiet" size="sm" onClick={() => setPreview(s)}>
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => useUi.getState().later('Joining spaces')}
                  >
                    Join
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <PreviewSheet space={preview} onClose={() => setPreview(null)} />
    </Screen>
  )
}
