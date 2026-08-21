import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { COMMUNITIES } from '../../mock/communities'
import { useWorld } from '../../state/world'
import { Button } from '../../components/primitives/Button'
import { Card } from '../../components/primitives/EmptyState'
import { Chip } from '../../components/primitives/Chip'
import { IdentityChip } from '../../components/identity/IdentityChip'
import { Murmur } from '../../components/nav/Murmur'
import { FuzzedCount } from '../../components/trust'
import { ZkGlyph } from '../../components/trust/Glyphs'

/** The mobile home for spaces. On desktop the rail already does this job. */
export function SpacesScreen() {
  const navigate = useNavigate()
  const demoMode = useWorld((s) => s.demoMode)

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-ink-0">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8">
        <header className="mb-5 flex items-center justify-between gap-3">
          <h1 className="font-display text-24 text-hi">Spaces</h1>
          <Button
            variant="quiet"
            size="sm"
            icon={<Compass size={15} strokeWidth={1.5} />}
            onClick={() => navigate('/discover')}
          >
            Discover
          </Button>
        </header>

        <div className="flex flex-col gap-3">
          {COMMUNITIES.map((c) => (
            <Card key={c.id} className="p-4">
              <button
                onClick={() => navigate(`/space/${c.id}`)}
                className="flex w-full items-start gap-3 text-left"
              >
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card border font-display text-13"
                  style={{
                    borderColor: `rgb(var(--hue-${c.hue}-rgb) / .4)`,
                    background: `rgb(var(--hue-${c.hue}-rgb) / .12)`,
                    color: `var(--hue-${c.hue})`,
                  }}
                >
                  {c.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-17 text-hi">{c.name}</span>
                  <span className="mt-0.5 block text-13 leading-relaxed text-mid">{c.blurb}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-2">
                    <FuzzedCount value={c.memberEstimate} />
                    {c.gate ? (
                      <Chip tone="neutral" icon={<ZkGlyph size={11} />}>
                        {c.gate.label}
                      </Chip>
                    ) : null}
                    <Chip>{c.atmosphere}</Chip>
                  </span>
                </span>
              </button>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--line-soft)] pt-3">
                <IdentityChip maskId={c.usingMaskId} prefix="here as" size="sm" />
                <Murmur
                  intensity={demoMode ? Math.min(1, c.murmur + 0.1) : c.murmur}
                  hue={c.hue}
                  width={40}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
